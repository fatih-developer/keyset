import type { Dictionary, LegalPage as LegalContent } from "@/content/i18n/types";
import { SiteShell } from "./SiteShell";
import { Container } from "@/components/ui/Section";
import { inline } from "@/lib/inline";
import { localePath, type Locale } from "@/lib/site";

interface LegalPageProps {
  locale: Locale;
  dict: Dictionary;
  page: LegalContent;
  path: "/privacy/" | "/terms/";
}

export function LegalPage({ locale, dict, page, path }: LegalPageProps) {
  const other: Locale = locale === "en" ? "tr" : "en";
  return (
    <SiteShell locale={locale} dict={dict} alternateHref={localePath(other, path)}>
      <article className="pt-24 pb-24">
        <Container className="pt-16">
          <header className="flex max-w-2xl flex-col gap-4 border-b border-line pb-12">
            <h1 className="text-headline text-4xl font-semibold tracking-tight sm:text-5xl">{page.title}</h1>
            <p className="font-mono text-xs text-faint">{page.updated}</p>
          </header>
          <div className="flex max-w-2xl flex-col gap-12 pt-12">
            {page.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-fg">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base text-muted">
                    {inline(paragraph)}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Container>
      </article>
    </SiteShell>
  );
}
