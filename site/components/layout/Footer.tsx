import Link from "next/link";
import type { Dictionary } from "@/content/i18n/types";
import { products } from "@/content/products";
import { Container } from "@/components/ui/Section";
import { Wordmark } from "@/components/ui/Wordmark";
import { packageUrl } from "@/lib/links";
import { LICENSE_URL, REPO_URL, SECURITY_URL, localePath, type Locale } from "@/lib/site";

const PACKAGES = ["@key-set/core", "@key-set/cli", "@key-set/mcp", "@key-set/sdk", "@key-set/provider-google", "@key-set/adapter-better-auth", "@key-set/adapter-authjs", "@key-set/google-automation"];

const link = "text-muted transition-colors duration-500 ease-fluid hover:text-fg";

export function Footer({ locale, dict, alternateHref }: { locale: Locale; dict: Dictionary; alternateHref: string }) {
  const { footer } = dict;
  const other: Locale = locale === "en" ? "tr" : "en";
  return (
    <footer className="border-t border-line py-16">
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Wordmark className="text-lg" blink={false} />
          <p className="max-w-xs text-sm text-muted">{footer.tagline}</p>
          <p className="text-sm text-faint">{footer.rights}</p>
          <a href={alternateHref} hrefLang={other} lang={other} className={`w-max font-mono text-xs ${link}`}>
            {dict.nav.language}: {locale.toUpperCase()} · {other.toUpperCase()}
          </a>
        </div>

        <FooterColumn title={footer.productsTitle}>
          {products.map((product) => (
            <li key={product.id}>
              {product.status === "available" && product.href ? (
                <Link href={localePath(locale, product.href)} className={link}>
                  {product.name}
                </Link>
              ) : (
                <span className="text-faint">
                  {product.name} <span className="text-xs">· {footer.inDevelopment}</span>
                </span>
              )}
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title={footer.resourcesTitle}>
          <li><Link href="/docs/" className={link}>{footer.docs}</Link></li>
          <li><a href={REPO_URL} className={link}>{footer.github}</a></li>
          <li><a href={SECURITY_URL} className={link}>{footer.security}</a></li>
          <li><a href={LICENSE_URL} className={link}>{footer.license}</a></li>
        </FooterColumn>

        <FooterColumn title={footer.legalTitle}>
          <li><Link href={localePath(locale, "/privacy/")} className={link}>{footer.privacy}</Link></li>
          <li><Link href={localePath(locale, "/terms/")} className={link}>{footer.terms}</Link></li>
        </FooterColumn>

        <FooterColumn title={footer.packagesTitle}>
          {PACKAGES.map((name) => (
            <li key={name}>
              <a href={packageUrl(name)} className={`font-mono text-xs ${link}`}>
                {name}
              </a>
            </li>
          ))}
        </FooterColumn>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-4">
      <p className="eyebrow">{title}</p>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </nav>
  );
}
