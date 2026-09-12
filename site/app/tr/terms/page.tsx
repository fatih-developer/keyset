import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { tr } from "@/content/i18n/tr";
import { languageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: tr.terms.title,
  description: tr.terms.description,
  alternates: { ...languageAlternates("/terms/"), canonical: "/tr/terms/" },
};

export default function TermsTr() {
  return <LegalPage locale="tr" dict={tr} page={tr.terms} path="/terms/" />;
}
