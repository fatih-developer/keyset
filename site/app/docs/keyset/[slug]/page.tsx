import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docSlugs, docSourceUrl, docSummary, docTitle, isDocSlug, renderDoc } from "@/lib/docs";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return docSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!isDocSlug(slug)) return {};
  return {
    title: `${docTitle(slug)} · Keyset docs`,
    description: docSummary(slug),
    alternates: { canonical: `/docs/keyset/${slug}/` },
  };
}

export default async function DocPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isDocSlug(slug)) notFound();
  const doc = await renderDoc(slug);

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_200px]">
      <article className="min-w-0">
        <header className="mb-12 flex flex-col gap-4 border-b border-line pb-8">
          <p className="eyebrow">Keyset docs</p>
          <h1 className="text-headline text-4xl font-semibold tracking-tight">{doc.title}</h1>
          <a
            href={docSourceUrl(slug)}
            className="w-max font-mono text-xs text-faint underline decoration-line underline-offset-4 transition-colors duration-500 ease-fluid hover:text-fg"
          >
            View source on GitHub
          </a>
        </header>
        {/* Rendered at build time from the repository's own docs; raw HTML in markdown is dropped. */}
        <div className="prose-docs max-w-3xl" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </article>
      {doc.headings.length > 1 && (
        <nav aria-label="On this page" className="order-first flex flex-col gap-2 xl:sticky xl:top-32 xl:order-none xl:self-start">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">On this page</p>
          <ul className="flex flex-col gap-1 text-sm">
            {doc.headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="text-muted transition-colors duration-500 ease-fluid hover:text-fg">
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
