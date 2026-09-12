import { tr } from "@/content/i18n/tr";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const dynamic = "force-static";
export const alt = tr.meta.ogAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ headline: tr.hero.headline, eyebrow: "Keyset · OAuth kurulumu", status: tr.hero.statusTitle });
}
