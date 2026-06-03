"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MayorlinkHeader } from "@/components/mayorlink-header";
import { fetchCategories, type Category } from "@/lib/providers";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      router.push("/busqueda");
      return;
    }
    router.push(`/busqueda?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="min-h-full bg-zinc-100">
      <MayorlinkHeader />

      <section className="bg-black px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Venta mayorista B2B en Argentina
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Encontra proveedores mayoristas como en un marketplace
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-semibold text-zinc-300">
            Busca por producto, rubro o provincia. Compara condiciones y
            contacta directo por WhatsApp.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Que producto o rubro buscas?"
              className="flex-1 rounded-md border-0 px-4 py-4 text-lg font-bold text-black outline-none ring-4 ring-emerald-600/40 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="rounded-md bg-emerald-500 px-8 py-4 text-lg font-black text-black hover:bg-emerald-400"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-2xl font-black text-black">Categorias</h3>
          <Link
            href="/busqueda"
            className="text-sm font-black text-emerald-700 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {loading ? (
          <p className="mt-8 font-bold text-zinc-600">Cargando categorias...</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/busqueda?categoria=${encodeURIComponent(category.slug)}`}
                  className="flex h-full flex-col rounded-lg border-2 border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-600 hover:shadow-md"
                >
                  {category.emoji ? (
                    <span className="text-3xl">{category.emoji}</span>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-lg font-black text-emerald-800">
                      {category.name.charAt(0)}
                    </span>
                  )}
                  <span className="mt-3 text-lg font-black text-black">
                    {category.name}
                  </span>
                  <span className="mt-2 text-sm font-bold text-emerald-700">
                    Ver proveedores
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="mt-14 rounded-lg border-2 border-black bg-white p-8">
          <h3 className="text-2xl font-black text-black">
            Para compradores mayoristas
          </h3>
          <ul className="mt-4 space-y-2 text-base font-semibold text-zinc-700">
            <li>Filtra por categoria, provincia y pedido minimo.</li>
            <li>Ordena resultados por relevancia.</li>
            <li>Accede al perfil completo de cada proveedor.</li>
          </ul>
          <Link
            href="/busqueda"
            className="mt-6 inline-block rounded-md bg-black px-6 py-3 font-black text-white hover:bg-zinc-800"
          >
            Explorar directorio
          </Link>
        </section>
      </main>

      <footer className="border-t-2 border-black bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm font-bold text-zinc-600 sm:px-6">
          MayorLink - Directorio mayorista B2B de Argentina
        </div>
      </footer>
    </div>
  );
}
