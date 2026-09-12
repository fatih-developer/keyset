import type { Dictionary } from "@/content/i18n/types";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { FIRST_RUN } from "@/lib/commands";
import { INSTALL_URL } from "@/lib/links";

export function FinalCta({ dict }: { dict: Dictionary }) {
  const { final, common } = dict;
  return (
    <section aria-labelledby="final-title" className="py-16 sm:py-24">
      <Container>
        <div data-reveal className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-line bg-panel p-6 sm:p-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h2 id="final-title" className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              {final.title}
            </h2>
            <p className="text-lg text-muted">{final.body}</p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href={INSTALL_URL}>{final.cta}</ButtonLink>
              <ButtonLink href="/docs/keyset/installation/" variant="ghost">
                {final.secondary}
              </ButtonLink>
            </div>
          </div>
          <CodeBlock title={final.commandsLabel} code={FIRST_RUN} copy={common.copy} copied={common.copied} copyLabel={common.copyLabel} />
        </div>
      </Container>
    </section>
  );
}
