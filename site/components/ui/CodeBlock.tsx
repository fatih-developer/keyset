"use client";

import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  title: string;
  code: string;
  /** Show a "$" prompt before command lines. Lines starting with "#" render as comments. */
  prompt?: boolean;
  copy: string;
  copied: string;
  copyLabel: string;
}

export function CodeBlock({ title, code, prompt = true, copy, copied, copyLabel }: CodeBlockProps) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onCopy() {
    // Comments are guidance for the reader, not commands to paste.
    const text = code.split("\n").filter((line) => !line.startsWith("#")).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 2000);
    } catch {
      // Clipboard can be blocked by the browser; the text stays selectable.
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-raise">
      <div className="flex items-center justify-between gap-4 border-b border-line py-2 pr-2 pl-4">
        <span className="font-mono text-xs text-faint">{title}</span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copyLabel}
          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted transition-all duration-500 ease-fluid hover:border-muted hover:text-fg active:scale-[0.98]"
        >
          {done ? copied : copy}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm text-fg">
        <code>
          {code.split("\n").map((line, index) =>
            line.startsWith("#") ? (
              <span key={index} className="block text-faint">
                {line}
              </span>
            ) : (
              <span key={index} className="block">
                {prompt && (
                  <span aria-hidden="true" className="text-accent select-none">
                    ${" "}
                  </span>
                )}
                {line}
              </span>
            ),
          )}
        </code>
      </pre>
      <span aria-live="polite" className="sr-only">
        {done ? copied : ""}
      </span>
    </div>
  );
}
