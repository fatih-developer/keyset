import { readFileSync } from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import { REPO_BLOB_URL } from "./site";

/** Repository docs directory. The site must be built from a full checkout (next build runs in site/). */
const DOCS_DIR = path.join(process.cwd(), "..", "docs");

/**
 * Public Keyset docs, grouped for the sidebar. Only these files are published; internal planning
 * documents (PRD, landing brief, release notes, repository structure, decisions) never are.
 */
export const DOC_GROUPS: { title: string; slugs: string[] }[] = [
  { title: "Get started", slugs: ["installation", "cli"] },
  { title: "Providers", slugs: ["google", "github", "providers"] },
  { title: "Auth libraries", slugs: ["better-auth", "authjs"] },
  { title: "Agents", slugs: ["mcp", "skills"] },
  { title: "Reference", slugs: ["compatibility", "troubleshooting", "sdk", "provider-sdk", "architecture", "threat-model"] },
];

const SLUGS = DOC_GROUPS.flatMap((group) => group.slugs);
const fileFor = (slug: string) => `${slug.toUpperCase()}.md`;

export function docSlugs(): string[] {
  return SLUGS;
}

export function isDocSlug(slug: string): boolean {
  return SLUGS.includes(slug);
}

export function docHref(slug: string): string {
  return `/docs/keyset/${slug}/`;
}

export function docSourceUrl(slug: string): string {
  return `${REPO_BLOB_URL}/docs/${fileFor(slug)}`;
}

function readDoc(slug: string): string {
  return readFileSync(path.join(DOCS_DIR, fileFor(slug)), "utf8");
}

export function docTitle(slug: string): string {
  return /^#\s+(.+)$/m.exec(readDoc(slug))?.[1].trim() ?? slug;
}

/** First paragraph after the title, used as the page description. */
export function docSummary(slug: string): string {
  const body = readDoc(slug).replace(/^#\s+.+$/m, "");
  const paragraph = body.split(/\n\s*\n/).map((block) => block.trim()).find((block) => block && !/^[#`|>-]/.test(block));
  return (paragraph ?? "").replace(/\s+/g, " ").replace(/[`*]/g, "").slice(0, 200);
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

export interface DocHeading {
  id: string;
  text: string;
}

function textOf(node: HastNode): string {
  return node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");
}

/** docs/X.md links become site routes when published; every other relative link points at GitHub. */
function rewriteHref(href: string): string {
  if (!href || href.startsWith("#") || href.startsWith("/") || /^[a-z][a-z+.-]*:/i.test(href)) return href;
  const [file, hash] = href.split("#");
  const repoPath = path.posix.normalize(path.posix.join("docs", file));
  const fragment = hash ? `#${hash}` : "";
  const match = /^docs\/([A-Z0-9-]+)\.md$/.exec(repoPath);
  const slug = match?.[1].toLowerCase();
  return slug && isDocSlug(slug) ? `${docHref(slug)}${fragment}` : `${REPO_BLOB_URL}/${repoPath}${fragment}`;
}

function siteTransform(headings: DocHeading[]) {
  return () => (tree: unknown) => {
    const visit = (node: HastNode) => {
      const children = node.children;
      if (!children) return;
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        if (child.type === "element") {
          // The page renders the title itself.
          if (child.tagName === "h1") {
            children.splice(index--, 1);
            continue;
          }
          if (child.tagName === "h2") headings.push({ id: String(child.properties?.id ?? ""), text: textOf(child) });
          if (child.tagName === "a" && child.properties) child.properties.href = rewriteHref(String(child.properties.href ?? ""));
          if (child.tagName === "table") {
            children[index] = { type: "element", tagName: "div", properties: { className: ["table-wrap"] }, children: [child] };
          }
        }
        visit(child);
      }
    };
    visit(tree as HastNode);
  };
}

export async function renderDoc(slug: string): Promise<{ title: string; html: string; headings: DocHeading[] }> {
  const headings: DocHeading[] = [];
  // Raw HTML in markdown is dropped (remark-rehype default), so docs cannot inject markup.
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeShiki, { theme: "github-dark-default", defaultLanguage: "text", fallbackLanguage: "text" })
    .use(siteTransform(headings))
    .use(rehypeStringify)
    .process(readDoc(slug));
  return { title: docTitle(slug), html: String(file), headings };
}
