"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MayorlinkHeader } from "@/components/mayorlink-header";
import { SearchProviderCard } from "@/components/search-provider-card";
import {
  fetchActiveProviders,
  fetchCategories,
  matchesMinOrderFilter,
  matchesSearchQuery,
  MIN_ORDER_FILTERS,
  sortByRelevance,
  type Category,
  type MinOrderFilterKey,
  type Provider,
} from "@/lib/providers";

function BusquedaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const provincia = searchParams.get("provincia") ?? "";
  const pedido = (searchParams.get("pedido") ?? "") as MinOrderFilterKey;

  const [searchInput, setSearchInput] = useState(q);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cats, provs] = await Promise.all([
          fetchCategories(),
          fetchActiveProviders(),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setProviders(provs);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const provinces = useMemo(() => {
    const unique = new Set(
      providers.map((p) => p.province).filter((value) => value.trim())
    );
    return Array.from(unique).sort();
  }, [providers]);

  const filteredProviders = useMemo(() => {
    let result = providers.filter((provider) => {
      if (categoria && provider.categorySlug !== categoria) return false;
      if (provincia && provider.province !== provincia) return false;
      if (!matchesMinOrderFilter(provider.minOrderValue, pedido)) return false;
      return matchesSearchQuery(provider, q);
    });
    return sortByRelevance(result, q);
  }, [providers, q, categoria, provincia, pedido]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `/busqueda?${query}` : "/busqueda");
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  }

  const activeCategoryName =
    categories.find((cat) => cat.slug === categoria)?.name ?? null;

  return (
    <div className="min-h-full bg-zinc-100">
      <MayorlinkHeader compact />

      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar proveedores, productos o ciudad..."
              className="flex-1 rounded-md border-2 border-zinc-300 px-4 py-3 text-base font-semibold outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-black text-white hover:bg-emerald-500"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide text-black">
              Filtros
            </h2>

            <div className="mt-5">
              <p className="text-xs font-black uppercase text-zinc-500">
                Categoria
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => updateParams({ categoria: null })}
                    className={`w-full rounded px-2 py-1.5 text-left text-sm font-bold ${
                      !categoria
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    Todas
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => updateParams({ categoria: cat.slug })}
                      className={`w-full rounded px-2 py-1.5 text-left text-sm font-bold ${
                        categoria === cat.slug
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {cat.emoji ? `${cat.emoji} ` : ""}
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <p className="text-xs font-black uppercase text-zinc-500">
                Provincia
              </p>
              <select
                value={provincia}
                onChange={(e) =>
                  updateParams({ provincia: e.target.value || null })
                }
                className="mt-2 w-full rounded-md border-2 border-zinc-300 px-2 py-2 text-sm font-semibold focus:border-emerald-600"
              >
                <option value="">Todas</option>
                {provinces.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <p className="text-xs font-black uppercase text-zinc-500">
                Pedido minimo
              </p>
              <ul className="mt-2 space-y-1">
                {MIN_ORDER_FILTERS.map((filter) => (
                  <li key={filter.key || "todos"}>
                    <button
                      type="button"
                      onClick={() =>
                        updateParams({ pedido: filter.key || null })
                      }
                      className={`w-full rounded px-2 py-1.5 text-left text-sm font-bold ${
                        pedido === filter.key
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {filter.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {(categoria || provincia || pedido || q) && (
              <button
                type="button"
                onClick={() =>
                  router.push("/busqueda")
                }
                className="mt-6 w-full rounded-md border-2 border-black py-2 text-sm font-black hover:bg-black hover:text-white"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-black">Resultados</h1>
              {activeCategoryName && (
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  Categoria: {activeCategoryName}
                </p>
              )}
              {q && (
                <p className="mt-1 text-sm font-semibold text-zinc-600">
                  Busqueda: {q}
                </p>
              )}
            </div>
            <p className="text-sm font-black text-zinc-700">
              {loading
                ? "Cargando..."
                : `${filteredProviders.length} resultado${
                    filteredProviders.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          {!loading && !error && (
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
              Orden: relevancia
            </p>
          )}

          {loading ? (
            <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
              <p className="font-bold text-zinc-600">Cargando proveedores...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-300 bg-white px-6 py-16 text-center">
              <p className="font-black text-black">Error al cargar</p>
              <p className="mt-2 text-sm text-zinc-600">{error}</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
              <p className="text-lg font-black text-black">
                No encontramos proveedores
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-600">
                Proba otros filtros o una busqueda distinta.
              </p>
              <Link
                href="/busqueda"
                className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-black text-white"
              >
                Ver todos
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredProviders.map((provider) => (
                <li key={provider.id}>
                  <SearchProviderCard provider={provider} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BusquedaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-zinc-100">
          <MayorlinkHeader compact />
          <div className="mx-auto max-w-7xl px-4 py-16 text-center font-bold">
            Cargando busqueda...
          </div>
        </div>
      }
    >
      <BusquedaContent />
    </Suspense>
  );
}
