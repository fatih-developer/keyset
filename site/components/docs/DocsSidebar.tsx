"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DocsSidebarProps {
  groups: { title: string; docs: { slug: string; title: string }[] }[];
}

export function DocsSidebar({ groups }: DocsSidebarProps) {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-widest text-faint uppercase">{group.title}</p>
          <ul className="flex flex-col gap-1 border-l border-line">
            {group.docs.map((doc) => {
              const href = `/docs/keyset/${doc.slug}/`;
              const current = pathname.replace(/\/?$/, "/") === href;
              return (
                <li key={doc.slug}>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={`-ml-px block border-l py-1 pl-4 text-sm transition-colors duration-500 ease-fluid ${current ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"}`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
