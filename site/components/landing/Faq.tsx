import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { inline } from "@/lib/inline";

export function Faq({ faq }: { faq: Dictionary["faq"] }) {
  return (
    <Section id="faq" eyebrow={faq.eyebrow} title={faq.title}>
      <div data-reveal className="overflow-hidden rounded-2xl border border-line">
        {faq.items.map((item) => (
          <details key={item.q} className="group border-b border-line last:border-b-0 open:bg-panel">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-4 py-4 text-base font-semibold text-fg transition-colors duration-500 ease-fluid hover:bg-panel sm:px-6 [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden="true" className="relative size-4 shrink-0 text-muted">
                <span className="absolute top-1/2 left-0 h-0.5 w-4 -translate-y-1/2 rounded-full bg-current" />
                <span className="absolute top-1/2 left-0 h-0.5 w-4 -translate-y-1/2 rotate-90 rounded-full bg-current transition-transform duration-500 ease-fluid group-open:rotate-0" />
              </span>
            </summary>
            <p className="max-w-3xl px-4 pb-6 text-base text-muted sm:px-6">{inline(item.a)}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
