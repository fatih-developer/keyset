import type { Metadata } from "next";
import { KeysetLanding } from "@/components/landing/KeysetLanding";
import { tr } from "@/content/i18n/tr";
import { languageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: tr.meta.title },
  description: tr.meta.description,
  alternates: { ...languageAlternates("/"), canonical: "/tr/" },
  openGraph: { title: tr.meta.title, description: tr.meta.description, url: "/tr/", locale: "tr_TR" },
};

export default function HomeTr() {
  return <KeysetLanding locale="tr" dict={tr} />;
}
