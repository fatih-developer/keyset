import { Fragment, type ReactNode } from "react";

const CODE = /(`[^`]+`)/g;

/** Renders `backtick` spans in dictionary strings as inline code. */
export function inline(text: string): ReactNode {
  return text.split(CODE).map((part, index) =>
    part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
      <code key={index} className="rounded-md border border-line bg-raise px-1 py-0.5 font-mono text-sm text-fg">
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** Same string with the backticks removed, for metadata and JSON-LD. */
export function plain(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1");
}
