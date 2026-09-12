import type { ReactNode } from "react";
import type { Dictionary } from "@/content/i18n/types";
import type { Locale } from "@/lib/site";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

interface SiteShellProps {
  locale: Locale;
  dict: Dictionary;
  /** The same page in the other language (the English docs link back to the Turkish home). */
  alternateHref: string;
  children: ReactNode;
}

/** Skip link, navigation, main landmark and footer. Turkish pages are wrapped in lang="tr". */
export function SiteShell({ locale, dict, alternateHref, children }: SiteShellProps) {
  const content = (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-accent px-3 py-2 text-sm font-semibold text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
      >
        {dict.skipLink}
      </a>
      <Nav locale={locale} nav={dict.nav} alternateHref={alternateHref} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer locale={locale} dict={dict} alternateHref={alternateHref} />
    </>
  );
  return locale === "tr" ? <div lang="tr">{content}</div> : content;
}
