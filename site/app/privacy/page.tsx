import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { en } from "@/content/i18n/en";
import { languageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: en.privacy.title,
  description: en.privacy.description,
  alternates: languageAlternates("/privacy/"),
};

export default function Privacy() {
  return <LegalPage locale="en" dict={en} page={en.privacy} path="/privacy/" />;
}
