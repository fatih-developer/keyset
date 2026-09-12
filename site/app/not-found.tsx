import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { en } from "@/content/i18n/en";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// One static 404.html serves both languages, so it carries a short Turkish line too.
export default function NotFound() {
  return (
    <SiteShell locale="en" dict={en} alternateHref="/tr/">
      <section aria-labelledby="nf-title" className="pt-24 pb-24">
        <Container className="flex flex-col items-start gap-6 pt-16">
          <p className="font-mono text-sm text-muted">
            <span className="text-accent">$</span> keyset verify page
          </p>
          <p className="font-mono text-sm text-warn">✕ 404 · route not found</p>
          <h1 id="nf-title" className="text-headline max-w-[680px] text-4xl font-semibold tracking-tight sm:text-5xl">
            This page is not part of the setup
          </h1>
          <p className="max-w-[680px] text-lg text-muted">The link may be old or mistyped. Start again from the home page or the documentation.</p>
          <p lang="tr" className="max-w-[680px] text-base text-faint">
            Bu sayfa bulunamadı. Ana sayfaya ya da dokümanlara dönebilirsiniz.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/">Back to Keyset</ButtonLink>
            <ButtonLink href="/docs/" variant="ghost">
              Documentation
            </ButtonLink>
            <Link href="/tr/" hrefLang="tr" lang="tr" className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-fg">
              Türkçe ana sayfa
            </Link>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
