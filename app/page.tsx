"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Supplier = {
  id: string;
  name: string;
  city: string;
  province: string;
  category: string;
  summary: string;
  description: string;
  phone: string;
  email: string;
  minOrder: string;
  delivery: string;
  products: string[];
};

type ProviderRow = {
  id: string;
  company_name: string;
  description: string | null;
  province: string | null;
  city: string | null;
  whatsapp: string | null;
  email: string | null;
  min_order: string | null;
  shipping_info: string | null;
  payment_methods: string | null;
  categories: { name: string } | { name: string }[] | null;
};

function categoryNameFromRow(
  categories: ProviderRow["categories"]
): string {
  if (!categories) return "General";
  if (Array.isArray(categories)) return categories[0]?.name ?? "General";
  return categories.name ?? "General";
}

function mapProvider(row: ProviderRow): Supplier {
  const description = row.description ?? "";
  const summary =
    description.length > 140
      ? `${description.slice(0, 140).trim()}...`
      : description;
  const products = row.payment_methods
    ? row.payment_methods.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return {
    id: row.id,
    name: row.company_name,
    city: row.city ?? "",
    province: row.province ?? "",
    category: categoryNameFromRow(row.categories),
    summary,
    description,
    phone: row.whatsapp ?? "",
    email: row.email ?? "",
    minOrder: row.min_order ?? "",
    delivery: row.shipping_info ?? "",
    products,
  };
}

function normalize(text: string): string {
  return text.toLowerCase();
}

function matchesQuery(supplier: Supplier, query: string): boolean {
  if (!query.trim()) return true;
  const q = normalize(query);
  const haystack = [
    supplier.name,
    supplier.city,
    supplier.province,
    supplier.category,
    supplier.summary,
    supplier.description,
    ...supplier.products,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      const [categoriesResult, providersResult] = await Promise.all([
        supabase.from("categories").select("name").order("sort_order"),
        supabase
          .from("providers")
          .select(
            "id, company_name, description, province, city, whatsapp, email, min_order, shipping_info, payment_methods, categories(name)"
          )
          .eq("status", "active")
          .order("company_name"),
      ]);

      if (cancelled) return;

      if (categoriesResult.error || providersResult.error) {
        setError(
          categoriesResult.error?.message ??
            providersResult.error?.message ??
            "No se pudieron cargar los datos"
        );
        setLoading(false);
        return;
      }

      const categoryNames = (categoriesResult.data ?? []).map(
        (row) => row.name as string
      );
      setCategories(["Todos", ...categoryNames]);
      setSuppliers(
        (providersResult.data ?? []).map((row) =>
          mapProvider(row as ProviderRow)
        )
      );
      setLoading(false);
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const categoryMatch =
        activeCategory === "Todos" || supplier.category === activeCategory;
      return categoryMatch && matchesQuery(supplier, query);
    });
  }, [query, activeCategory, suppliers]);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  const showEmptyFilters =
    !loading && !error && filteredSuppliers.length === 0;
  const showSupplierList =
    !loading && !error && filteredSuppliers.length > 0;

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Argentina
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              MayorLink
            </h1>
          </div>
          <p className="hidden text-sm text-zinc-600 sm:block">
            Directorio de proveedores mayoristas
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Encontra proveedores mayoristas en todo el pais
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Busca por rubro, ciudad o producto. Filtra por categoria y revisa
            condiciones de compra minima y entrega.
          </p>

          <label className="mt-8 block">
            <span className="sr-only">Buscar proveedores</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: golosinas, Cordoba, electronica..."
              disabled={loading}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base outline-none ring-emerald-600 transition focus:border-emerald-600 focus:bg-white focus:ring-2 disabled:opacity-60"
            />
          </label>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-zinc-700">Categorias</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    disabled={loading}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "border border-zinc-300 bg-white text-zinc-700 hover:border-emerald-600 hover:text-emerald-800"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-xl font-semibold text-zinc-900">
              Proveedores
            </h3>
            <p className="text-sm text-zinc-600">
              {loading
                ? "Cargando..."
                : `${filteredSuppliers.length} resultado${filteredSuppliers.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-zinc-600">Cargando proveedores...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-dashed border-red-300 bg-white px-6 py-12 text-center">
              <p className="font-medium text-zinc-800">
                No se pudieron cargar los proveedores
              </p>
              <p className="mt-2 text-sm text-zinc-600">{error}</p>
            </div>
          ) : showEmptyFilters ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
              <p className="font-medium text-zinc-800">
                No hay proveedores con esos filtros
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Proba otra busqueda o selecciona la categoria Todos.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("Todos");
                }}
                className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Limpiar filtros
              </button>
            </div>
          ) : showSupplierList ? (
            <ul className="grid gap-4">
              {filteredSuppliers.map((supplier) => {
                const isExpanded = expandedId === supplier.id;
                return (
                  <li
                    key={supplier.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                              {supplier.category}
                            </span>
                            <span className="text-sm text-zinc-500">
                              {supplier.city}, {supplier.province}
                            </span>
                          </div>
                          <h4 className="mt-2 text-lg font-semibold text-zinc-900">
                            {supplier.name}
                          </h4>
                          <p className="mt-1 text-zinc-600">{supplier.summary}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(supplier.id)}
                          aria-expanded={isExpanded}
                          className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-emerald-600 hover:text-emerald-800"
                        >
                          {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-5 border-t border-zinc-100 pt-5">
                          <p className="text-sm leading-relaxed text-zinc-700">
                            {supplier.description}
                          </p>
                          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Compra minima
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-zinc-900">
                                {supplier.minOrder || "Consultar"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Entrega
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-zinc-900">
                                {supplier.delivery || "Consultar"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Telefono
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-zinc-900">
                                {supplier.phone || "No disponible"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Email
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-emerald-800">
                                {supplier.email || "No disponible"}
                              </dd>
                            </div>
                          </dl>
                          {supplier.products.length > 0 && (
                            <div className="mt-5">
                              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Productos destacados
                              </p>
                              <ul className="mt-2 flex flex-wrap gap-2">
                                {supplier.products.map((product) => (
                                  <li
                                    key={product}
                                    className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                                  >
                                    {product}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      </main>

      <footer className="mt-16 border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-600 sm:px-6">
          MayorLink - Directorio informativo de proveedores mayoristas de
          Argentina
        </div>
      </footer>
    </div>
  );
}
