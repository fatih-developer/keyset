import { ArrowUpRight, Package } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { inline } from "@/lib/inline";
import { packageUrl } from "@/lib/links";

export function Packages({ packages }: { packages: Dictionary["packages"] }) {
  return (
    <Section id="packages" eyebrow={packages.eyebrow} title={packages.title} intro={packages.intro}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.items.map((item, index) => (
          <li key={item.name} data-reveal style={{ transitionDelay: `${(index % 4) * 80}ms` }}>
            <a
              href={packageUrl(item.name)}
              className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-panel p-6 transition-all duration-700 ease-fluid hover:border-muted hover:bg-raise active:scale-[0.98]"
            >
              <span className="flex items-center justify-between text-muted">
                <Package aria-hidden="true" size={20} weight="bold" className="text-accent" />
                <ArrowUpRight aria-hidden="true" size={16} className="transition-transform duration-700 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="font-mono text-sm font-medium break-words text-fg">{item.name}</span>
              <span className="text-sm text-muted">{inline(item.body)}</span>
            </a>
          </li>
        ))}
      </ul>
      <div data-reveal className="mt-12 grid gap-2 rounded-2xl border border-line p-6 sm:p-12">
        {packages.statement.map((line) => (
          <p key={line} className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {line}
          </p>
        ))}
      </div>
    </Section>
  );
}
