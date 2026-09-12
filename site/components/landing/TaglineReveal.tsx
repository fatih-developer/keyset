"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Section";

/** Mandatory tagline moment: each word resolves from muted to full color as it crosses the trigger line. */
export function TaglineReveal({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>(".tagline-word"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((word) => word.classList.add("is-lit"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        // Words that cross in the same frame (one line) still light in reading order.
        const crossed = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
        crossed.forEach((word, order) => {
          word.style.transitionDelay = `${order * 70}ms`;
          word.classList.add("is-lit");
          observer.unobserve(word);
        });
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    words.forEach((word) => observer.observe(word));
    return () => observer.disconnect();
  }, []);

  const words = lines.map((line) => line.split(" "));
  const offsets = words.map((_, lineIndex) => words.slice(0, lineIndex).reduce((sum, line) => sum + line.length, 0));

  return (
    <section aria-label={lines.join(" ")} className="py-24">
      <Container>
        <p ref={ref} aria-hidden="true" className="max-w-[880px] text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {words.map((line, lineIndex) => (
            <span key={lineIndex} className="block [&+&]:mt-4">
              {line.map((word, wordIndex) => (
                <span key={wordIndex}>
                  <span className="tagline-word" data-index={offsets[lineIndex] + wordIndex}>
                    {word}
                  </span>{" "}
                </span>
              ))}
            </span>
          ))}
        </p>
      </Container>
    </section>
  );
}
