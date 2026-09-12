import type { Dictionary } from "@/content/i18n/types";

// CLI output stays in English in every locale: it is what the terminal prints.
// Illustrative only: no real client ID, secret, email address, or personal path.
const INSPECT: [string, string][] = [
  ["Framework", "Next.js"],
  ["Auth library", "Better Auth"],
  ["Provider", "Google OAuth"],
  ["Callback", "/api/auth/callback/google"],
  ["Environment", ".env.local"],
];

const SETUP: [string, string][] = [
  ["Client ID", "written to .env.local"],
  ["Client secret", "•••••••• redacted"],
  ["Auth source", "src/lib/auth.ts updated"],
];

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-1">
      {rows.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[112px_1fr] gap-2 sm:grid-cols-[128px_1fr]">
          <dt className="text-muted">{key}</dt>
          <dd className="truncate text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TerminalVisual({ hero }: { hero: Dictionary["hero"] }) {
  return (
    <div className="relative lg:pb-16">
      <figure role="img" aria-label={hero.terminalLabel} className="overflow-hidden rounded-2xl border border-line bg-raise font-mono text-xs sm:text-sm">
        <div aria-hidden="true" className="flex items-center gap-2 border-b border-line px-4 py-3 text-xs text-faint">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="ml-2">~/apps/storefront</span>
        </div>
        {/* On large screens the status card overlaps the bottom edge, so the body keeps that space empty. */}
        <div aria-hidden="true" className="grid gap-1 px-4 pt-4 pb-6 sm:px-6 lg:pb-16">
          <p className="text-fg">
            <span className="text-accent">$</span> keyset inspect
          </p>
          <Rows rows={INSPECT} />
          <div className="h-3" />
          <p className="text-fg">
            <span className="text-accent">$</span> keyset setup google --auto
          </p>
          <Rows rows={SETUP} />
        </div>
      </figure>
      <div
        role="img"
        aria-label={hero.statusLabel}
        className="mt-4 grid gap-2 rounded-2xl border border-line bg-lift p-4 lg:absolute lg:-right-6 lg:bottom-0 lg:mt-0 lg:w-72"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-fg">
          <span aria-hidden="true" className="size-2 rounded-full bg-ok shadow-[0_0_0_4px_rgb(74_222_128/0.18)]" />
          {hero.statusTitle}
        </p>
        <p className="grid gap-1 font-mono text-xs text-muted">
          <span>keyset verify google --runtime</span>
          <span>{hero.statusMeta}</span>
        </p>
      </div>
    </div>
  );
}
