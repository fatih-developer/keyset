export const SITE_URL = "https://onset.fatihunal.dev";
export const REPO_URL = "https://github.com/fatih-developer/keyset";
export const REPO_BLOB_URL = `${REPO_URL}/blob/main`;
export const SECURITY_URL = `${REPO_BLOB_URL}/SECURITY.md`;
export const LICENSE_URL = `${REPO_BLOB_URL}/LICENSE`;
export const ISSUES_URL = `${REPO_URL}/issues`;

export const UMBRELLA = "Onset";
export const PRODUCT = "Keyset";

export type Locale = "en" | "tr";
export const locales: Locale[] = ["en", "tr"];

/** Site path for a locale. English lives at the root, Turkish under /tr. Paths end with "/" (trailingSlash). */
export function localePath(locale: Locale, path = "/"): string {
  return locale === "en" ? path : `/tr${path}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** hreflang alternates for a page that exists in both languages. */
export function languageAlternates(path: string) {
  return {
    canonical: path,
    languages: { en: localePath("en", path), tr: localePath("tr", path), "x-default": localePath("en", path) },
  };
}
