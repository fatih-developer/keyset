import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

interface SectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, intro, children, className = "" }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`py-16 sm:py-24 ${className}`}>
      <Container>
        <header data-reveal className="flex max-w-2xl flex-col gap-4">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {title}
          </h2>
          {intro && <p className="text-lg text-muted">{intro}</p>}
        </header>
        <div className="mt-12">{children}</div>
      </Container>
    </section>
  );
}
