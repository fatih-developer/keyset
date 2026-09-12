import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { INSTALL_FROM_SOURCE, MCP_CONFIG, MCP_INSTALL, MCP_TOOLS } from "@/lib/commands";
import { inline } from "@/lib/inline";

export function CliMcp({ dict }: { dict: Dictionary }) {
  const { cliMcp, common } = dict;
  const copy = { copy: common.copy, copied: common.copied, copyLabel: common.copyLabel };
  return (
    <Section id="interfaces" eyebrow={cliMcp.eyebrow} title={cliMcp.title} intro={cliMcp.intro}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article data-reveal className="flex flex-col gap-6 rounded-2xl border border-line bg-panel p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-fg">{cliMcp.cli.title}</h3>
            <p className="text-base text-muted">{inline(cliMcp.cli.body)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2">
            {[
              [cliMcp.cli.packageLabel, "@key-set/cli"],
              [cliMcp.cli.commandLabel, "keyset"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-ground p-4">
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-2 font-mono text-sm text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold text-fg">{cliMcp.cli.installTitle}</h4>
            <p className="text-sm text-muted">{inline(cliMcp.cli.installNote)}</p>
            <CodeBlock title="terminal" code={INSTALL_FROM_SOURCE} {...copy} />
          </div>
        </article>

        <article data-reveal style={{ transitionDelay: "120ms" }} className="flex flex-col gap-6 rounded-2xl border border-line bg-panel p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-fg">{cliMcp.mcp.title}</h3>
            <p className="text-base text-muted">{cliMcp.mcp.body}</p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold text-fg">{cliMcp.mcp.installTitle}</h4>
            <CodeBlock title="terminal" code={MCP_INSTALL} {...copy} />
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold text-fg">{cliMcp.mcp.configTitle}</h4>
            <CodeBlock title="mcp.json" code={MCP_CONFIG} prompt={false} {...copy} />
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-base font-semibold text-fg">{cliMcp.mcp.flowTitle}</h4>
            <ol className="flex flex-wrap gap-2 font-mono text-xs">
              {MCP_TOOLS.map((tool) => (
                <li key={tool.name} className={`flex items-center gap-2 rounded-full border px-3 py-1 ${tool.mutating ? "border-warn/60 text-fg" : "border-line text-muted"}`}>
                  {tool.name}
                  {tool.mutating && <span className="text-warn">· {cliMcp.mcp.mutatingLabel}</span>}
                </li>
              ))}
            </ol>
            <p className="text-sm text-muted">{inline(cliMcp.mcp.note)}</p>
          </div>
        </article>
      </div>

      <article data-reveal className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-panel p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <h3 className="text-2xl font-semibold tracking-tight text-fg">{cliMcp.agent.title}</h3>
        <p className="text-base text-muted">{cliMcp.agent.body}</p>
      </article>
    </Section>
  );
}
