import type { Dictionary } from "@/content/i18n/types";
import { SiteShell } from "@/components/layout/SiteShell";
import { absoluteUrl, localePath, REPO_URL, type Locale } from "@/lib/site";
import { plain } from "@/lib/inline";
import { Hero } from "./Hero";
import { Benefits } from "./Benefits";
import { TaglineReveal } from "./TaglineReveal";
import { HowItWorks } from "./HowItWorks";
import { Capabilities } from "./Capabilities";
import { CliMcp } from "./CliMcp";
import { Packages } from "./Packages";
import { Security } from "./Security";
import { SupportTable } from "./SupportTable";
import { ProductFamily } from "./ProductFamily";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";

/** The Keyset product page. It is the site home until another Onset product ships (see site/README.md). */
export function KeysetLanding({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const other: Locale = locale === "en" ? "tr" : "en";
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Keyset",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux",
      description: dict.meta.description,
      url: absoluteUrl(localePath(locale, "/")),
      codeRepository: REPO_URL,
      license: "https://opensource.org/licenses/MIT",
      inLanguage: locale,
      publisher: { "@type": "Organization", name: "Onset", url: absoluteUrl("/") },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: dict.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: plain(item.a) },
      })),
    },
  ];

  return (
    <SiteShell locale={locale} dict={dict} alternateHref={localePath(other, "/")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <Hero hero={dict.hero} />
      <Benefits benefits={dict.benefits} />
      <TaglineReveal lines={dict.tagline.lines} />
      <HowItWorks how={dict.how} />
      <Capabilities capabilities={dict.capabilities} dict={dict} />
      <CliMcp dict={dict} />
      <Packages packages={dict.packages} />
      <Security security={dict.security} />
      <SupportTable support={dict.support} />
      <ProductFamily locale={locale} family={dict.family} />
      <Faq faq={dict.faq} />
      <FinalCta dict={dict} />
    </SiteShell>
  );
}
