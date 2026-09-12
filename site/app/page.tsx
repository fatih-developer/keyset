import type { Metadata } from "next";
import { KeysetLanding } from "@/components/landing/KeysetLanding";
import { en } from "@/content/i18n/en";
import { languageAlternates } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: en.meta.title },
  description: en.meta.description,
  alternates: languageAlternates("/"),
  openGraph: { title: en.meta.title, description: en.meta.description, url: "/", locale: "en_US" },
};

export default function Home() {
  return <KeysetLanding locale="en" dict={en} />;
}
