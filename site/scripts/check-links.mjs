#!/usr/bin/env node
// Verifies every internal link and fragment in the static export (out/). Run after `npm run build`.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const OUT = resolve(import.meta.dirname, "..", "out");
const SITE_URL = "https://onset.fatihunal.dev";

if (!existsSync(OUT)) {
  console.error("out/ not found. Run `npm run build` first.");
  process.exit(1);
}

function htmlFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

const idCache = new Map();
function idsIn(file) {
  if (!idCache.has(file)) idCache.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
  return idCache.get(file);
}

/** Maps a site path to the file the static host would serve. */
function resolveTarget(pathname) {
  const clean = decodeURIComponent(pathname);
  const candidates = clean.endsWith("/") ? [join(OUT, clean, "index.html")] : [join(OUT, clean), join(OUT, `${clean}.html`), join(OUT, clean, "index.html")];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

const problems = [];
const files = htmlFiles(OUT);

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const page = `/${relative(OUT, file).replace(/\\/g, "/").replace(/index\.html$/, "")}`;
  for (const [, raw] of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const href = raw.replace(/&amp;/g, "&");
    if (href === "" || href === "#") {
      problems.push(`${page}: empty or placeholder link "${href}"`);
      continue;
    }
    if (/^(mailto|tel|data|javascript):/i.test(href)) continue;
    if (/^https?:/i.test(href) && !href.startsWith(SITE_URL)) continue;

    const url = new URL(href.startsWith(SITE_URL) ? href.slice(SITE_URL.length) || "/" : href, `http://site${page}`);
    const target = resolveTarget(url.pathname);
    if (!target) {
      problems.push(`${page}: broken link ${href}`);
      continue;
    }
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (fragment && target.endsWith(".html") && !idsIn(target).has(fragment)) {
      problems.push(`${page}: missing anchor ${href}`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} link problem(s):\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
  process.exit(1);
}
console.log(`Checked ${files.length} pages: all internal links and anchors resolve.`);
