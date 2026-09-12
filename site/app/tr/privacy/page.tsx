import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { tr } from "@/content/i18n/tr";
import { languageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: tr.privacy.title,
  description: tr.privacy.description,
  alternates: { ...languageAlternates("/privacy/"), canonical: "/tr/privacy/" },
};

export default function PrivacyTr() {
  return <LegalPage locale="tr" dict={tr} page={tr.privacy} path="/privacy/" />;
}
