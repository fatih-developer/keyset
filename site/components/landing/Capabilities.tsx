import { Key, LockKey, MagnifyingGlass, PlugsConnected, Stethoscope } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { DIAGNOSTIC_COMMANDS, ENV_ROWS } from "@/lib/commands";
import { inline } from "@/lib/inline";

function Panel({ icon: IconComponent, title, children, className = "" }: { icon: Icon; title: string; children: ReactNode; className?: string }) {
  return (
    <article data-reveal className={`flex flex-col gap-4 rounded-2xl border border-line bg-panel p-6 ${className}`}>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
        <IconComponent aria-hidden="true" size={20} weight="bold" className="text-accent" />
        {title}
      </h3>
      {children}
    </article>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-line bg-ground px-3 py-1 text-sm text-fg">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Capabilities({ capabilities, dict }: { capabilities: Dictionary["capabilities"]; dict: Dictionary }) {
  const { inspection, providers, auth, env, diagnostics } = capabilities;
  return (
    <Section id="capabilities" eyebrow={capabilities.eyebrow} title={capabilities.title} intro={capabilities.intro}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel icon={MagnifyingGlass} title={inspection.title} className="lg:row-span-2">
          <ul className="flex flex-col gap-3">
            {inspection.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel icon={PlugsConnected} title={providers.title}>
          <p className="text-sm text-muted">{providers.body}</p>
          <Chips items={providers.items} />
        </Panel>

        <Panel icon={LockKey} title={auth.title}>
          <p className="text-sm text-muted">{auth.body}</p>
          <Chips items={auth.items} />
        </Panel>

        <Panel icon={Key} title={env.title} className="lg:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[480px] border-collapse text-left font-mono text-sm">
              <thead className="bg-ground">
                <tr>
                  {[env.adapter, env.clientId, env.clientSecret].map((heading) => (
                    <th key={heading} scope="col" className="border-b border-line px-4 py-3 font-sans text-xs font-semibold tracking-wide text-muted uppercase">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENV_ROWS.map((row) => (
                  <tr key={row.adapter} className="border-b border-line last:border-b-0">
                    <th scope="row" className="px-4 py-3 font-sans font-medium text-fg">
                      {row.adapter}
                    </th>
                    <td className="px-4 py-3 text-fg">{row.id}</td>
                    <td className="px-4 py-3 text-fg">{row.secret}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-faint">{env.note}</p>
        </Panel>

        <Panel icon={Stethoscope} title={diagnostics.title} className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <p className="text-sm text-muted">{inline(diagnostics.body)}</p>
            <CodeBlock title="terminal" code={DIAGNOSTIC_COMMANDS} copy={dict.common.copy} copied={dict.common.copied} copyLabel={dict.common.copyLabel} />
          </div>
        </Panel>
      </div>
    </Section>
  );
}
