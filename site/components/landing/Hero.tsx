import Link from "next/link";
import type { Dictionary } from "@/content/i18n/types";
import { Container } from "@/components/ui/Section";
import { ButtonLink, textLink } from "@/components/ui/Button";
import { INSTALL_URL } from "@/lib/links";
import { TerminalVisual } from "./TerminalVisual";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Hero({ hero }: { hero: Dictionary["hero"] }) {
  return (
    <section aria-labelledby="hero-title" className="pt-24 pb-16 sm:pb-24">
      <Container className="grid grid-cols-1 items-center gap-12 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="eyebrow rise" style={delay(0)}>
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="text-headline rise max-w-[680px] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl" style={delay(80)}>
            <span className="block">{hero.headline[0]}</span>
            <span className="block">{hero.headline[1]}</span>
          </h1>
          <p className="rise max-w-[680px] text-lg text-muted" style={delay(160)}>
            {hero.sub}
          </p>
          <div className="rise flex flex-wrap items-center gap-6" style={delay(240)}>
            <ButtonLink href={INSTALL_URL}>{hero.cta}</ButtonLink>
            <Link href="/docs/keyset/google/" className={`text-base ${textLink}`}>
              {hero.secondary}
            </Link>
          </div>
          <div className="rise flex flex-col gap-2" style={delay(320)}>
            <p className="text-sm text-faint">{hero.helper}</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              {hero.proof}
            </p>
          </div>
        </div>
        <div className="rise" style={delay(200)}>
          <TerminalVisual hero={hero} />
        </div>
      </Container>
    </section>
  );
}
