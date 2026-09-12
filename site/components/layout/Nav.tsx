"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/i18n/types";
import { Wordmark } from "@/components/ui/Wordmark";
import { ButtonLink } from "@/components/ui/Button";
import { INSTALL_URL } from "@/lib/links";
import { localePath, type Locale } from "@/lib/site";

interface NavProps {
  locale: Locale;
  nav: Dictionary["nav"];
  /** Same page in the other language. */
  alternateHref: string;
}

const SECTIONS = ["capabilities", "how", "packages", "security"] as const;

const trim = (path: string) => (path.length > 1 ? path.replace(/\/$/, "") : path);

export function Nav({ locale, nav, alternateHref }: NavProps) {
  const pathname = trim(usePathname() ?? "/");
  const home = localePath(locale, "/");
  const onLanding = pathname === trim(home);
  const onDocs = pathname.startsWith("/docs");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const other: Locale = locale === "en" ? "tr" : "en";

  const links = [
    { id: "capabilities", label: nav.product },
    { id: "how", label: nav.howItWorks },
    { id: "packages", label: nav.packages },
    { id: "security", label: nav.security },
  ];

  // Scroll spy: marks the section in view as the current nav item.
  useEffect(() => {
    if (!onLanding || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [onLanding]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (current: boolean) =>
    `rounded-full px-2 py-1 transition-colors duration-500 ease-fluid hover:text-fg ${current ? "text-fg underline decoration-accent decoration-2 underline-offset-8" : "text-muted"}`;

  const menuItems = [
    ...links.map((link) => ({ href: `${home}#${link.id}`, label: link.label, current: onLanding && active === link.id, note: "" })),
    { href: "/docs/", label: nav.docs, current: onDocs, note: nav.docsNote },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
        <nav
          aria-label={nav.label}
          className="flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-line bg-raise/80 py-2 pr-2 pl-4 backdrop-blur-xl lg:w-max lg:justify-start"
        >
          <Link href={home} aria-label={nav.home} className="rounded-full text-sm">
            <Wordmark product="Keyset" />
          </Link>
          <ul className="hidden items-center gap-2 text-sm lg:flex">
            {links.map((link) => {
              const current = onLanding && active === link.id;
              return (
                <li key={link.id}>
                  <a href={`${home}#${link.id}`} aria-current={current ? "location" : undefined} className={linkClass(current)}>
                    {link.label}
                  </a>
                </li>
              );
            })}
            <li>
              <Link href="/docs/" aria-current={onDocs ? "page" : undefined} className={linkClass(onDocs)}>
                {nav.docs}
                {nav.docsNote && <span className="ml-1 font-mono text-xs text-faint">EN</span>}
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <a
              href={alternateHref}
              hrefLang={other}
              lang={other}
              aria-label={`${nav.language}: ${other === "tr" ? "Türkçe" : "English"}`}
              className="hidden rounded-full px-2 py-1 font-mono text-xs text-muted transition-colors duration-500 ease-fluid hover:text-fg sm:inline-flex"
            >
              {other.toUpperCase()}
            </a>
            {/* Wrapped: ButtonLink sets its own display, which would override `hidden`. */}
            <span className="hidden lg:inline-flex">
              <ButtonLink href={INSTALL_URL} size="sm">
                {nav.install}
              </ButtonLink>
            </span>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? nav.closeMenu : nav.openMenu}
              onClick={() => setOpen((value) => !value)}
              className="relative size-9 rounded-full bg-lift transition-colors duration-500 ease-fluid hover:bg-line lg:hidden"
            >
              <span
                aria-hidden="true"
                className={`absolute left-2.5 h-0.5 w-4 rounded-full bg-fg transition-all duration-700 ease-fluid ${open ? "top-[17px] rotate-45" : "top-[13px]"}`}
              />
              <span
                aria-hidden="true"
                className={`absolute left-2.5 h-0.5 w-4 rounded-full bg-fg transition-all duration-700 ease-fluid ${open ? "top-[17px] -rotate-45" : "top-[21px]"}`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-black/80 px-4 pt-24 pb-8 backdrop-blur-3xl transition-opacity duration-700 ease-fluid lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ul className="flex flex-col gap-2 px-2 pt-6">
          {menuItems.map((item, index) => (
            <li
              key={item.href}
              style={{ transitionDelay: open ? `${100 + index * 50}ms` : "0ms" }}
              className={`border-b border-line transition-all duration-700 ease-fluid ${open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
            >
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={item.current ? "page" : undefined}
                className={`flex items-center justify-between py-3 text-3xl font-semibold tracking-tight ${item.current ? "text-fg" : "text-muted"}`}
              >
                {item.label}
                <span className="font-mono text-xs font-normal text-faint">{item.current ? nav.current : item.note}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-4">
          <ButtonLink href={INSTALL_URL}>{nav.install}</ButtonLink>
          <a href={alternateHref} hrefLang={other} lang={other} className="text-center font-mono text-xs text-muted">
            {nav.language}: <span className="text-fg">{locale.toUpperCase()}</span> · {other.toUpperCase()}
          </a>
        </div>
      </div>
    </>
  );
}
