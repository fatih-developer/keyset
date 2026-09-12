import type { Dictionary } from "@/content/i18n/types";
import { products } from "@/content/products";
import { Section } from "@/components/ui/Section";
import type { Locale } from "@/lib/site";

/** Planned products are visibly labeled and never linked or given commands. */
export function ProductFamily({ locale, family }: { locale: Locale; family: Dictionary["family"] }) {
  return (
    <Section id="onset" eyebrow={family.eyebrow} title={family.title} intro={family.body}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => {
          const available = product.status === "available";
          return (
            <li
              key={product.id}
              data-reveal
              style={{ transitionDelay: `${(index % 4) * 80}ms` }}
              className={`flex flex-col gap-4 rounded-2xl border p-6 ${available ? "border-accent/60 bg-panel" : "border-dashed border-line"}`}
            >
              <span className={`flex w-max items-center gap-2 rounded-full border px-2 py-0.5 font-mono text-xs ${available ? "border-ok/40 text-ok" : "border-line text-faint"}`}>
                <span aria-hidden="true" className={`size-1.5 rounded-full ${available ? "bg-ok" : "bg-faint"}`} />
                {available ? family.available : family.inDevelopment}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className={`font-mono text-lg font-medium ${available ? "text-fg" : "text-muted"}`}>{product.name.toLowerCase()}</h3>
                <p className="text-sm text-muted">{product.summary[locale]}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-faint">{family.note}</p>
    </Section>
  );
}
