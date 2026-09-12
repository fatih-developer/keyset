import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { textLink } from "@/components/ui/Button";
import { inline } from "@/lib/inline";
import { SECURITY_URL } from "@/lib/site";

export function Security({ security }: { security: Dictionary["security"] }) {
  return (
    <Section id="security" eyebrow={security.eyebrow} title={security.title} intro={security.intro}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ul data-reveal className="overflow-hidden rounded-2xl border border-line bg-panel">
          {security.points.map((point) => (
            <li key={point.title} className="flex gap-4 border-b border-line p-6 last:border-b-0">
              <ShieldCheck aria-hidden="true" size={20} weight="bold" className="mt-0.5 shrink-0 text-accent" />
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-fg">{point.title}</h3>
                <p className="text-sm text-muted">{inline(point.body)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div data-reveal style={{ transitionDelay: "120ms" }} className="flex flex-col justify-between gap-12 rounded-2xl border border-line p-6 sm:p-8">
          <p className="text-3xl font-semibold tracking-tight text-fg">
            <span className="block">{security.trust[0]}</span>
            <span className="mt-4 block text-xl font-medium text-muted">{security.trust[1]}</span>
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a href={SECURITY_URL} className={textLink}>
              {security.policyLink}
            </a>
            <Link href="/docs/keyset/threat-model/" className={textLink}>
              {security.threatModelLink}
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
