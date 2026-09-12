import { inspectProject, planGoogleSetup, SecretValue, verify, type ProjectInspection } from "@key-set/core";
import type { CredentialInput, ProviderPlugin, RedirectPlan } from "@key-set/sdk";
export { createGithubProvider, createGithubProvider as createGitHubProvider, githubRedirectPlan, importGithubCredentials, importGithubCredentials as importGitHubCredentials, planGithubSetup, planGithubSetup as planGitHubSetup, suggestedGithubApplicationName, validateGithubAuthorizationRequest } from "./github.js";

export function importGoogleCredentials(input: unknown): CredentialInput {
  let value: Record<string, any>;
  try { value = (typeof input === "string" ? JSON.parse(input) : input) as Record<string, any>; } catch { throw new Error("Google credential JSON is malformed."); }
  const web = value?.web ?? value?.installed ?? value;
  const clientId = web?.client_id;
  const clientSecret = web?.client_secret;
  if (value?.installed || value?.desktop || value?.native) throw new Error("Google credential file is not a Web application OAuth client. Create a Web application client in Google Cloud.");
  if (typeof clientId !== "string" || typeof clientSecret !== "string" || !clientId.trim() || !clientSecret.trim()) throw new Error("Google credential input must contain non-empty client_id and client_secret");
  if (!/^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(clientId.trim())) throw new Error("Google client_id does not look like a Web OAuth client ID.");
  return { clientId: new SecretValue(clientId.trim()), clientSecret: new SecretValue(clientSecret.trim()) };
}

export function validateGoogleAuthorizationRequest(value: string, expectedRedirectUri: string, expectedClientId?: string): { ok: boolean; message: string } {
  try { const url = new URL(value); const redirect = url.searchParams.get("redirect_uri"); const clientId = url.searchParams.get("client_id"); const valid = url.hostname === "accounts.google.com" && url.pathname === "/o/oauth2/v2/auth" && url.searchParams.get("response_type") === "code" && Boolean(url.searchParams.get("scope")) && redirect === expectedRedirectUri && (!expectedClientId || clientId === expectedClientId); return { ok: valid, message: valid ? "Google authorization request is structurally valid." : "Google authorization request has an invalid endpoint, client, scope, or redirect URI." }; } catch { return { ok: false, message: "Google authorization request is not a valid URL." }; }
}

export function googleRedirectPlan(project: ProjectInspection): RedirectPlan {
  const origins = [project.localUrl, ...(project.productionUrl ? [project.productionUrl] : [])].map(url => url.replace(/\/$/, ""));
  return { homepageUrl: origins[0], authorizationCallbackUrl: `${origins[0]}/api/auth/callback/google`, authorizedOrigins: origins, redirectUris: origins.map(origin => `${origin}/api/auth/callback/google`) };
}

export function createGoogleProvider(projectRoot: string): ProviderPlugin {
  return {
    metadata: { id: "google", name: "Google OAuth", protocol: "oauth2", supported: true, capabilities: { guidedProvisioning: true, credentialImport: true, redirectUris: true, authorizedOrigins: true, runtimeAuthorizationInspection: true } },
    prerequisites: () => [{ id: "console", title: "Google Cloud project", satisfied: false, detail: "OAuth client creation requires the Google Cloud Console in v0.1." }],
    plan: () => planGoogleSetup(inspectProject(projectRoot)),
    importCredentials: importGoogleCredentials,
    validate: () => verify(inspectProject(projectRoot), "google"),
    redirectPlan: googleRedirectPlan,
    environment: [{ id: "GOOGLE_CLIENT_ID", description: "Google OAuth client ID", secret: false }, { id: "GOOGLE_CLIENT_SECRET", description: "Google OAuth client secret", secret: true }],
    actions: [{ id: "google-console", kind: "manual", title: "Create Google OAuth client", description: "Create a Web application OAuth client and add the listed origins and redirect URIs.", targetUrl: "https://console.cloud.google.com/apis/credentials" }],
  };
}
