import Link from "next/link";
import type { Dictionary } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";

export function SupportTable({ support }: { support: Dictionary["support"] }) {
  return (
    <Section id="support" eyebrow={support.eyebrow} title={support.title} intro={support.intro}>
      <div data-reveal className="grid grid-cols-1 gap-6">
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-panel">
              <tr>
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold text-fg sm:px-6">
                  {support.headArea}
                </th>
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold text-fg sm:px-6">
                  {support.headValue}
                </th>
              </tr>
            </thead>
            <tbody>
              {support.rows.map(([area, value]) => (
                <tr key={area} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-4 py-3 align-top font-mono text-xs font-medium tracking-wide text-muted uppercase sm:px-6">
                    {area}
                  </th>
                  <td className="px-4 py-3 text-fg sm:px-6">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/docs/keyset/compatibility/"
          className="w-max text-base font-medium text-fg underline decoration-accent underline-offset-4 transition-colors duration-500 ease-fluid hover:text-accent"
        >
          {support.link}
        </Link>
      </div>
    </Section>
  );
}
