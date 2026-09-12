import type { Locale } from "@/lib/site";

export type ProductStatus = "available" | "in-development";

export interface Product {
  id: string;
  name: string;
  summary: Record<Locale, string>;
  status: ProductStatus;
  /** Only available products link anywhere. In-development products never get an href or a command. */
  href?: string;
}

// When a product ships: set status to "available", add its href and page, then turn "/" into the Onset overview.
export const products: Product[] = [
  { id: "keyset", name: "Keyset", status: "available", href: "/", summary: { en: "OAuth provider setup and verification", tr: "OAuth sağlayıcı kurulumu ve doğrulaması" } },
  { id: "secretset", name: "Secretset", status: "in-development", summary: { en: "API keys, environment targets, and secret managers", tr: "API anahtarları, ortam hedefleri ve secret yöneticileri" } },
  { id: "accessset", name: "Accessset", status: "in-development", summary: { en: "Users, sessions, roles, and permissions", tr: "Kullanıcılar, oturumlar, roller ve izinler" } },
  { id: "dataset", name: "Dataset", status: "in-development", summary: { en: "Databases, migrations, backups, and schema drift", tr: "Veritabanları, migration'lar, yedekler ve şema sapması" } },
  { id: "launchset", name: "Launchset", status: "in-development", summary: { en: "Deployment, domains, DNS, SSL, and hosting", tr: "Deploy, alan adları, DNS, SSL ve hosting" } },
  { id: "mailset", name: "Mailset", status: "in-development", summary: { en: "Transactional email and sender configuration", tr: "İşlemsel e-posta ve gönderici yapılandırması" } },
  { id: "payset", name: "Payset", status: "in-development", summary: { en: "Payments, subscriptions, and billing webhooks", tr: "Ödemeler, abonelikler ve faturalama webhook'ları" } },
  { id: "appset", name: "Appset", status: "in-development", summary: { en: "Application features and code scaffolding", tr: "Uygulama özellikleri ve kod iskeleti" } },
];
