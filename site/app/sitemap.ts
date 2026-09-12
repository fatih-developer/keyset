import type { MetadataRoute } from "next";
import { docHref, docSlugs } from "@/lib/docs";
import { absoluteUrl, localePath } from "@/lib/site";

export const dynamic = "force-static";

const BILINGUAL = ["/", "/privacy/", "/terms/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const bilingual = BILINGUAL.flatMap((path) => {
    const languages = { en: absoluteUrl(localePath("en", path)), tr: absoluteUrl(localePath("tr", path)) };
    return [
      { url: languages.en, alternates: { languages } },
      { url: languages.tr, alternates: { languages } },
    ];
  });
  const docs = ["/docs/", ...docSlugs().map(docHref)].map((path) => ({ url: absoluteUrl(path) }));
  return [...bilingual, ...docs];
}
