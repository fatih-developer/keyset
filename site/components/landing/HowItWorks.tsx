import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { MCP_TOOLS } from "@/lib/commands";
import { inline } from "@/lib/inline";

export function HowItWorks({ how }: { how: Dictionary["how"] }) {
  return (
    <Section id="how" eyebrow={how.eyebrow} title={how.title} intro={how.intro}>
      {/* Numbered because the steps really are a sequence. */}
      <ol className="grid gap-4 lg:grid-cols-3">
        {how.steps.map((step, index) => {
          const writes = step.command.includes("setup");
          return (
            <li key={step.command} data-reveal style={{ transitionDelay: `${index * 120}ms` }} className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-2">
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2 font-mono text-xs">
                <span className="tracking-widest text-muted uppercase">
                  {how.stepLabel} {index + 1} · {step.name}
                </span>
                <span className="flex items-center gap-2 text-faint">
                  <span aria-hidden="true" className={`size-2 rounded-full ${writes ? "bg-warn" : "bg-ok"}`} />
                  {step.badge}
                </span>
              </div>
              <p className="overflow-x-auto rounded-lg border border-line bg-ground px-4 py-3 font-mono text-sm whitespace-nowrap text-fg">
                <span aria-hidden="true" className="text-accent">$ </span>
                {step.command}
              </p>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                <h3 className="text-lg font-semibold text-fg">{step.title}</h3>
                <p className="text-sm text-muted">{inline(step.body)}</p>
                {step.note && <p className="mt-2 rounded-lg border border-line p-3 text-sm text-fg">{step.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <div data-reveal className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-faint">
        <span className="mr-2">{how.flowLabel}</span>
        {MCP_TOOLS.map((tool, index) => (
          <span key={tool.name} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">→</span>}
            <span className={`rounded-full border px-2 py-0.5 ${tool.mutating ? "border-warn/60 text-fg" : "border-line text-muted"}`}>{tool.name}</span>
          </span>
        ))}
      </div>
    </Section>
  );
}
