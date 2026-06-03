import { supabase } from "@/lib/supabase";

export type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  sort_order: number;
};

export type Provider = {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
  category: string;
  categorySlug: string;
  summary: string;
  description: string;
  phone: string;
  email: string;
  minOrder: string;
  minOrderValue: number | null;
  delivery: string;
  paymentMethods: string[];
  logoUrl: string | null;
  isFounder: boolean;
  isVerified: boolean;
  profileScore: number;
  instagram: string | null;
  images: string[];
};

export type ProviderRow = {
  id: string;
  slug: string;
  company_name: string;
  description: string | null;
  province: string | null;
  city: string | null;
  whatsapp: string | null;
  email: string | null;
  min_order: string | null;
  shipping_info: string | null;
  payment_methods: string | null;
  logo_url: string | null;
  is_founder: boolean | null;
  is_verified: boolean | null;
  profile_score: number | null;
  instagram: string | null;
  images: string[] | string | null;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export const PROVIDER_LIST_FIELDS =
  "id, slug, company_name, description, province, city, whatsapp, email, min_order, shipping_info, payment_methods, logo_url, is_founder, is_verified, profile_score, categories(name, slug)";

export const PROVIDER_DETAIL_FIELDS =
  "id, slug, company_name, description, province, city, whatsapp, email, min_order, shipping_info, payment_methods, logo_url, images, is_founder, is_verified, profile_score, instagram, categories(name, slug)";

export const MIN_ORDER_FILTERS = [
  { key: "", label: "Cualquier pedido" },
  { key: "bajo", label: "Hasta $50.000" },
  { key: "medio", label: "$50.000 a $150.000" },
  { key: "alto", label: "Mas de $150.000" },
] as const;

export type MinOrderFilterKey = "" | "bajo" | "medio" | "alto";

function categoryFromRow(
  categories: ProviderRow["categories"]
): { name: string; slug: string } {
  if (!categories) return { name: "General", slug: "general" };
  if (Array.isArray(categories)) {
    return categories[0] ?? { name: "General", slug: "general" };
  }
  return categories;
}

export function parseMinOrderValue(value: string | null): number | null {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

export function splitPaymentMethods(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function parseImages(value: ProviderRow["images"]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [];
}

export function mapProvider(row: ProviderRow): Provider {
  const description = row.description ?? "";
  const category = categoryFromRow(row.categories);
  const summary =
    description.length > 160
      ? `${description.slice(0, 160).trim()}...`
      : description;

  return {
    id: row.id,
    slug: row.slug,
    name: row.company_name,
    city: row.city ?? "",
    province: row.province ?? "",
    category: category.name,
    categorySlug: category.slug,
    summary,
    description,
    phone: row.whatsapp ?? "",
    email: row.email ?? "",
    minOrder: row.min_order ?? "",
    minOrderValue: parseMinOrderValue(row.min_order),
    delivery: row.shipping_info ?? "",
    paymentMethods: splitPaymentMethods(row.payment_methods),
    logoUrl: row.logo_url,
    isFounder: Boolean(row.is_founder),
    isVerified: Boolean(row.is_verified),
    profileScore: row.profile_score ?? 0,
    instagram: row.instagram ?? null,
    images: parseImages(row.images),
  };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "ML";
}

export function whatsappUrl(phone: string, message?: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "#";
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function matchesMinOrderFilter(
  value: number | null,
  filter: MinOrderFilterKey
): boolean {
  if (!filter) return true;
  if (value === null) return false;
  if (filter === "bajo") return value <= 50000;
  if (filter === "medio") return value > 50000 && value <= 150000;
  if (filter === "alto") return value > 150000;
  return true;
}

export function matchesSearchQuery(provider: Provider, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const haystack = [
    provider.name,
    provider.city,
    provider.province,
    provider.category,
    provider.description,
    provider.delivery,
    ...provider.paymentMethods,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function relevanceScore(provider: Provider, query: string): number {
  let score = provider.profileScore;
  if (provider.isVerified) score += 12;
  if (provider.isFounder) score += 8;

  const q = query.trim().toLowerCase();
  if (!q) return score;

  const name = provider.name.toLowerCase();
  const description = provider.description.toLowerCase();

  if (name === q) score += 120;
  else if (name.startsWith(q)) score += 90;
  else if (name.includes(q)) score += 70;

  if (provider.category.toLowerCase().includes(q)) score += 45;
  if (provider.province.toLowerCase().includes(q)) score += 40;
  if (provider.city.toLowerCase().includes(q)) score += 35;
  if (description.includes(q)) score += 25;
  if (provider.paymentMethods.some((item) => item.toLowerCase().includes(q))) {
    score += 15;
  }

  return score;
}

export function sortByRelevance(providers: Provider[], query: string): Provider[] {
  return [...providers].sort(
    (a, b) => relevanceScore(b, query) - relevanceScore(a, query)
  );
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, emoji, sort_order")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchActiveProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from("providers")
    .select(PROVIDER_LIST_FIELDS)
    .eq("status", "active")
    .order("company_name");

  if (error) throw error;
  return (data ?? []).map((row) => mapProvider(row as ProviderRow));
}

export async function fetchProviderBySlug(slug: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from("providers")
    .select(PROVIDER_DETAIL_FIELDS)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProvider(data as ProviderRow);
}
