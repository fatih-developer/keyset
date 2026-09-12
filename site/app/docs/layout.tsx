import Link from "next/link";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Section";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DOC_GROUPS, docTitle } from "@/lib/docs";
import { en } from "@/content/i18n/en";

// Docs are English only. The language switch leads back to the Turkish home page.
export default function DocsLayout({ children }: { children: ReactNode }) {
  const groups = DOC_GROUPS.map((group) => ({ title: group.title, docs: group.slugs.map((slug) => ({ slug, title: docTitle(slug) })) }));
  return (
    <SiteShell locale="en" dict={en} alternateHref="/tr/">
      <div className="pt-24 pb-24">
        <Container className="grid gap-12 pt-16 lg:grid-cols-[224px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-160px)] lg:self-start lg:overflow-y-auto">
            <Link href="/docs/" className="eyebrow mb-6 block transition-colors duration-500 ease-fluid hover:text-fg">
              Keyset docs
            </Link>
            <DocsSidebar groups={groups} />
          </aside>
          <div className="min-w-0">{children}</div>
        </Container>
      </div>
    </SiteShell>
  );
}
