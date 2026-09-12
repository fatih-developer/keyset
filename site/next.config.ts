import type { NextConfig } from "next";

// Static export: `next build` writes the whole site to out/ for any static host.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
