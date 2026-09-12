import { ArrowsClockwise, LockKey, MagnifyingGlass, Path } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { inline } from "@/lib/inline";

const ICONS = [MagnifyingGlass, LockKey, ArrowsClockwise, Path];

export function Benefits({ benefits }: { benefits: Dictionary["benefits"] }) {
  return (
    <Section id="benefits" eyebrow={benefits.eyebrow} title={benefits.title}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {benefits.items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <li key={item.title} data-reveal style={{ transitionDelay: `${(index % 2) * 120}ms` }} className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-2">
              <p className="flex items-center gap-2 px-2 pt-2 font-mono text-xs tracking-widest text-muted uppercase">
                <Icon aria-hidden="true" size={16} weight="bold" className="text-accent" />
                {item.label}
              </p>
              <div className="flex flex-1 flex-col gap-2 rounded-lg border border-line bg-ground p-6">
                <h3 className="text-xl font-semibold text-fg">{item.title}</h3>
                <p className="text-base text-muted">{inline(item.body)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
