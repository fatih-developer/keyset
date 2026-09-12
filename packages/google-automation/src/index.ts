import { chromium, type Browser, type Frame, type Page } from "playwright";
import { SecretValue, callbackUrls, type ProjectInspection } from "@key-set/core";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface GoogleConsoleAutomationOptions {
  project: ProjectInspection;
  productionUrl?: string;
  applicationName?: string;
  timeoutMs?: number;
  headless?: false;
}

export interface GoogleConsoleCredentials {
  clientId: string;
  clientSecret: SecretValue;
  cloudProjectId: string;
  authorizedOrigins: string[];
  redirectUris: string[];
}

const CONSOLE = "https://console.cloud.google.com";

function chromeExecutable(): string {
  const candidates = [
    process.env.KEYSET_CHROME_PATH,
    process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined,
    process.platform === "win32" ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" : undefined,
    process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined,
    process.platform === "linux" ? "/usr/bin/google-chrome" : undefined,
  ].filter((value): value is string => Boolean(value));
  const found = candidates.find(existsSync);
  if (!found) throw new Error("Google Chrome was not found. Install Chrome or set KEYSET_CHROME_PATH.");
  return found;
}

async function launchNormalChrome(): Promise<{ browser: Browser; process: ChildProcess; profile: string }> {
  const port = 45000 + (process.pid % 1000);
  const profile = mkdtempSync(join(tmpdir(), "keyset-google-chrome-"));
  const child = spawn(chromeExecutable(), [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", `${CONSOLE}/projectselector`], { stdio: "ignore", windowsHide: false });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try { const response = await fetch(`http://127.0.0.1:${port}/json/version`); if (response.ok) return { browser: await chromium.connectOverCDP(`http://127.0.0.1:${port}`), process: child, profile }; } catch { /* Chrome is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  child.kill(); rmSync(profile, { recursive: true, force: true });
  throw new Error("Could not connect to the normal Chrome browser.");
}

async function removeTemporaryProfile(profile: string): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt++) {
    try { rmSync(profile, { recursive: true, force: true }); return; }
    catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  // A locked temporary profile is harmless and contains only the isolated
  // browser session; never let Windows cleanup races fail the setup result.
}
function projectIdFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("project") ?? parsed.pathname.match(/\/project(?:s)?\/([a-z][a-z0-9-]{4,28})/i)?.[1] ?? undefined;
  } catch { return undefined; }
}

async function visibleText(page: Page): Promise<string> { return page.locator("body").innerText({ timeout: 5_000 }).catch(() => ""); }

async function waitForAuthenticatedConsole(page: Page, timeoutMs: number): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const url = page.url();
    const projectId = projectIdFromUrl(url);
    if (projectId && url.includes("console.cloud.google.com") && !url.includes("accounts.google.com")) return projectId;
    const text = await visibleText(page);
    if (/select a project|project selector|welcome to google cloud/i.test(text)) {
      const candidate = projectIdFromUrl(url);
      if (candidate) return candidate;
    }
    await page.waitForTimeout(500);
  }
  throw new Error("Google Cloud login or project selection did not complete before timeout.");
}

function frames(page: Page): Frame[] { return page.frames(); }

async function findClickable(page: Page, expressions: RegExp[]) {
  for (const frame of frames(page)) for (const expression of expressions) {
    for (const target of [frame.getByRole("button", { name: expression }).first(), frame.getByRole("link", { name: expression }).first(), frame.getByText(expression, { exact: true }).first()]) {
      if (await target.count() && await target.isVisible().catch(() => false)) return target;
    }
  }
  return undefined;
}

async function clickByText(page: Page, expressions: RegExp[], timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const target = await findClickable(page, expressions);
    if (target) { await target.click(); return; }
    await page.waitForTimeout(500);
  }
  throw new Error("Google Cloud Console UI changed; required action could not be located.");
}

async function fillFirst(page: Page, labels: RegExp[], value: string): Promise<void> {
  for (const frame of frames(page)) for (const label of labels) for (const target of [frame.getByLabel(label).first(), frame.getByPlaceholder(label).first()]) if (await target.count() && await target.isVisible().catch(() => false)) { await target.fill(value); return; }
  throw new Error("Google Cloud Console UI changed; required field could not be located.");
}

async function fillContactEmail(page: Page, value: string): Promise<void> {
  for (const frame of frames(page)) {
    for (const target of [frame.getByLabel(/text field for emails/i).first(), frame.getByLabel(/contact email/i).first(), frame.getByPlaceholder(/email addresses/i).first()]) {
      if (!await target.count() || !await target.isVisible().catch(() => false)) continue;
      await target.fill(value);
      await target.press("Enter");
      return;
    }
  }
  throw new Error("Google OAuth contact email field could not be located.");
}

async function selectWebApplication(page: Page): Promise<void> {
  for (const frame of frames(page)) {
    const select = frame.locator('cfc-select[formcontrolname="typeControl"]').first();
    if (await select.count() && await select.isVisible().catch(() => false)) {
      await select.click();
      await clickByText(page, [/web application/i]);
      return;
    }
  }
  await clickByText(page, [/web application/i]);
}

async function addUri(page: Page, value: string, sectionIndex: number): Promise<void> {
  let added = false;
  for (const frame of frames(page)) {
    const buttons = frame.getByRole("button", { name: /add uri/i });
    const count = await buttons.count();
    if (count > sectionIndex && await buttons.nth(sectionIndex).isVisible().catch(() => false)) {
      await buttons.nth(sectionIndex).click();
      added = true;
      break;
    }
  }
  if (!added) throw new Error("Google OAuth Add URI button could not be located.");
  for (const frame of frames(page)) {
    const inputs = frame.locator('input[formcontrolname="uri"]:visible');
    const count = await inputs.count();
    if (count > 0) { await inputs.nth(count - 1).fill(value); return; }
  }
  throw new Error("Google OAuth URI field could not be located.");
}

async function clickCreate(page: Page): Promise<void> {
  const target = await findClickable(page, [/^create$/i]);
  if (!target) throw new Error("Google OAuth Create button could not be located.");
  await target.evaluate(element => (element as HTMLElement).click());
}

async function selectSupportEmail(page: Page): Promise<string> {
  for (const frame of frames(page)) {
    for (const target of [frame.getByRole("combobox", { name: /user support email/i }).first(), frame.getByLabel(/user support email/i).first(), frame.getByText(/user support email/i, { exact: true }).first()]) {
      if (!await target.count() || !await target.isVisible().catch(() => false)) continue;
      await target.click();
      await page.waitForTimeout(500);
      for (const optionFrame of frames(page)) {
        const option = optionFrame.getByText(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).first();
        if (await option.count() && await option.isVisible().catch(() => false)) {
          const email = (await option.innerText()).trim();
          await option.click();
          return email;
        }
      }
    }
  }
  throw new Error("A Google account email could not be selected for OAuth support contact.");
}

async function chooseAudience(page: Page): Promise<void> {
  for (const frame of frames(page)) for (const target of [frame.getByRole("radio", { name: /external/i }).first(), frame.getByText(/external/i, { exact: true }).first()]) if (await target.count() && await target.isVisible().catch(() => false)) { await target.click(); return; }
  throw new Error("Google OAuth audience could not be selected.");
}

async function completeAuthPlatformOnboarding(page: Page, applicationName: string): Promise<void> {
  if (!/app information/i.test(await visibleText(page))) return;
  await fillFirst(page, [/app name/i], applicationName);
  const supportEmail = await selectSupportEmail(page);
  await clickByText(page, [/next/i]);
  await page.waitForTimeout(500);
  await chooseAudience(page);
  await clickByText(page, [/next/i]);
  await page.waitForTimeout(500);
  await fillContactEmail(page, supportEmail);
  await clickByText(page, [/next/i]);
  await page.waitForTimeout(500);
  for (const frame of frames(page)) {
    const agreement = frame.getByRole("checkbox", { name: /google api services.*user data policy|i agree/i }).first();
    if (await agreement.count() && await agreement.isVisible().catch(() => false)) { await agreement.check(); break; }
  }
  const continueButton = await findClickable(page, [/^continue$/i]);
  if (continueButton) { await continueButton.click(); await page.waitForTimeout(500); }
  await clickCreate(page);
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
}

async function automateConsole(page: Page, projectId: string, options: GoogleConsoleAutomationOptions, origins: string[], redirects: string[]): Promise<GoogleConsoleCredentials> {
  await page.goto(`${CONSOLE}/auth/clients?project=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  // New Google Auth Platform projects require a one-time onboarding click
  // before the Clients page exposes the create flow.
  if (/not configured yet/i.test(await visibleText(page))) {
    await clickByText(page, [/get started/i]);
    await page.waitForLoadState("domcontentloaded", { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(1_000);
    await completeAuthPlatformOnboarding(page, options.applicationName ?? `${projectId} Keyset OAuth`);
    await page.goto(`${CONSOLE}/auth/clients?project=${encodeURIComponent(projectId)}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
  }
  await clickByText(page, [/create client/i, /create credentials/i]);
  await selectWebApplication(page);
  const name = options.applicationName ?? `${projectId} Keyset OAuth`;
  let nameFilled = false;
  for (const frame of frames(page)) {
    const nameInput = frame.locator('input[formcontrolname="displayName"]').first();
    if (await nameInput.count() && await nameInput.isVisible().catch(() => false)) { await nameInput.fill(name); nameFilled = true; break; }
  }
  if (!nameFilled) await fillFirst(page, [/^name$|application name/i], name);
  for (const origin of origins) await addUri(page, origin, 0);
  for (const redirect of redirects) await addUri(page, redirect, 1);
  await clickCreate(page);
  await page.waitForTimeout(1_000);
  const text = await visibleText(page);
  const clientId = text.match(/[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com/i)?.[0];
  const secret = text.match(/GOCSPX-[A-Za-z0-9_-]+/)?.[0] ?? text.match(/client secret\s*[:\n]\s*([A-Za-z0-9._-]+)/i)?.[1];
  if (!clientId || !secret) throw new Error("Google created the client, but its credentials could not be read safely. No project files were changed.");
  return { clientId, clientSecret: new SecretValue(secret), cloudProjectId: projectId, authorizedOrigins: origins, redirectUris: redirects };
}

export async function createGoogleWebCredentials(options: GoogleConsoleAutomationOptions): Promise<GoogleConsoleCredentials> {
  if (options.headless !== false) throw new Error("Google Console automation requires a visible browser; headless mode is disabled.");
  const origins = [options.project.localUrl, ...(options.productionUrl ? [options.productionUrl.replace(/\/$/, "")] : [])];
  const redirects = origins.map(origin => callbackUrls(origin, options.project.authAdapter, "google").redirectUri);
  let browser: Browser | undefined;
  let chromeProcess: ChildProcess | undefined;
  let profile: string | undefined;
  let page: Page | undefined;
  let preserveBrowser = false;
  try {
    const launched = await launchNormalChrome();
    browser = launched.browser; chromeProcess = launched.process; profile = launched.profile;
    const contexts = browser.contexts();
    const context = contexts[0] ?? await browser.newContext();
    page = context.pages()[0] ?? await context.newPage();
    const projectId = await waitForAuthenticatedConsole(page, options.timeoutMs ?? 300_000);
    return await automateConsole(page, projectId, options, origins, redirects);
  } catch (error) {
    if (page) {
      const diagnostic = join(tmpdir(), "keyset-google-console-last-failure.png");
      await page.screenshot({ path: diagnostic, fullPage: true }).catch(() => undefined);
      const message = error instanceof Error ? error.message : String(error);
      preserveBrowser = Boolean(chromeProcess && chromeProcess.exitCode === null);
      chromeProcess?.unref();
      throw new Error(`${message} Diagnostic screenshot: ${diagnostic}`);
    }
    throw error;
  } finally {
    await browser?.close().catch(() => undefined);
    if (!preserveBrowser) {
      if (chromeProcess && !chromeProcess.killed) chromeProcess.kill();
      if (profile) await removeTemporaryProfile(profile);
    }
  }
}
