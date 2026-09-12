import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const FONT_DIR = path.join(process.cwd(), "node_modules", "geist", "dist", "fonts");

async function fonts() {
  const [sans, mono] = await Promise.all([
    readFile(path.join(FONT_DIR, "geist-sans", "Geist-SemiBold.ttf")),
    readFile(path.join(FONT_DIR, "geist-mono", "GeistMono-Medium.ttf")),
  ]);
  return [
    { name: "Geist", data: sans, weight: 600 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}

/** 1200×630 social card, rendered at build time (static export). */
export async function renderOgImage({ headline, eyebrow, status }: { headline: [string, string]; eyebrow: string; status: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000000", padding: 80, fontFamily: "Geist" }}>
        <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "Geist Mono", fontSize: 32, color: "#ededed" }}>
          <span>onset</span>
          <span style={{ width: 20, height: 5, background: "#5ea2ff", marginLeft: 2, marginBottom: 6 }} />
          <span style={{ color: "#7c7c7c", margin: "0 16px" }}>/</span>
          <span style={{ color: "#9b9b9b" }}>keyset</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontFamily: "Geist Mono", fontSize: 22, letterSpacing: 2, color: "#9b9b9b", textTransform: "uppercase" }}>{eyebrow}</span>
          <span style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2, color: "#ffffff" }}>{headline[0]}</span>
          <span style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2, color: "#9b9b9b", marginTop: -24 }}>{headline[1]}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "Geist Mono", fontSize: 24 }}>
          <span style={{ display: "flex", color: "#ededed", border: "2px solid #313131", borderRadius: 16, padding: "14px 24px", background: "#1f1f1f" }}>
            <span style={{ color: "#5ea2ff", marginRight: 12 }}>$</span>keyset verify google --runtime
          </span>
          <span style={{ display: "flex", alignItems: "center", color: "#4ade80" }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: "#4ade80", marginRight: 12 }} />
            {status}
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}

export async function renderAppleIcon() {
  const [, mono] = await fonts();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 44, background: "#000000", fontFamily: "Geist Mono", fontSize: 96, color: "#ededed" }}>
        <span>o</span>
        <span style={{ width: 52, height: 12, background: "#5ea2ff", marginLeft: 4, marginBottom: 16 }} />
      </div>
    ),
    { width: 180, height: 180, fonts: [mono] },
  );
}
