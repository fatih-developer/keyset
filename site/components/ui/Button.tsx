import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-700 ease-fluid active:scale-[0.98]";

const variants = {
  primary: "bg-accent text-black hover:bg-accent-hover",
  ghost: "border border-line text-fg hover:border-muted hover:bg-raise",
};

const sizes = {
  md: "px-3 py-2 text-base",
  sm: "px-3 py-2 text-sm",
};

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}

export function ButtonLink({ href, children, variant = "primary", size = "md", className = "" }: ButtonLinkProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (/^https?:/.test(href)) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export const textLink =
  "font-medium text-fg underline decoration-accent underline-offset-4 transition-colors duration-500 ease-fluid hover:text-accent";
