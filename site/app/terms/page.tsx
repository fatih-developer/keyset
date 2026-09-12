import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { en } from "@/content/i18n/en";
import { languageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: en.terms.title,
  description: en.terms.description,
  alternates: languageAlternates("/terms/"),
};

export default function Terms() {
  return <LegalPage locale="en" dict={en} page={en.terms} path="/terms/" />;
}
