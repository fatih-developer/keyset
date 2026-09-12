import { en } from "@/content/i18n/en";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const dynamic = "force-static";
export const alt = en.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ headline: en.hero.headline, eyebrow: "Keyset · OAuth setup", status: en.hero.statusTitle });
}
