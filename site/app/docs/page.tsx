import type { Metadata } from "next";
import Link from "next/link";
import { DOC_GROUPS, docHref, docSummary, docTitle } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Keyset documentation",
  description: "Install Keyset, configure Google or GitHub OAuth, connect coding agents through MCP, and check compatibility.",
  alternates: { canonical: "/docs/" },
};

export default function DocsIndex() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-2xl flex-col gap-4">
        <p className="eyebrow">Documentation</p>
        <h1 className="text-headline text-4xl font-semibold tracking-tight sm:text-5xl">Keyset documentation</h1>
        <p className="text-lg text-muted">
          Guides and reference for the Keyset CLI, its local MCP server, and the provider and auth adapter packages. Keyset is currently the only Onset
          product with documentation.
        </p>
      </header>
      {DOC_GROUPS.map((group) => (
        <section key={group.title} aria-label={group.title} className="flex flex-col gap-4">
          <h2 className="font-mono text-xs tracking-widest text-faint uppercase">{group.title}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {group.slugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={docHref(slug)}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-panel p-6 transition-all duration-700 ease-fluid hover:border-muted hover:bg-raise active:scale-[0.98]"
                >
                  <span className="text-lg font-semibold text-fg">{docTitle(slug)}</span>
                  <span className="line-clamp-3 text-sm text-muted">{docSummary(slug)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
