"use client";

import { useMemo, useState } from "react";

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

const CATEGORIES = [
  "Todos",
  "Alimentos",
  "Bebidas",
  "Limpieza",
  "Electronica",
  "Textil",
  "Construccion",
  "Farmacia",
] as const;

const SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Distribuidora Norte SA",
    city: "Rosario",
    province: "Santa Fe",
    category: "Alimentos",
    summary: "Golosinas, snacks y conservas para kioscos y almacenes.",
    description:
      "Operamos desde 1998 con stock permanente y despacho en 24 hs al interior de Santa Fe y CABA.",
    phone: "+54 341 555 0101",
    email: "ventas@distnortesa.com.ar",
    minOrder: "$ 85.000",
    delivery: "CABA, GBA y Santa Fe",
    products: ["Golosinas", "Galletitas", "Conservas", "Snacks salados"],
  },
  {
    id: "2",
    name: "Mayorista del Sur",
    city: "La Plata",
    province: "Buenos Aires",
    category: "Bebidas",
    summary: "Aguas, gaseosas y cervezas artesanales a precio mayorista.",
    description:
      "Representamos marcas nacionales e importadas. Factura A y condiciones para revendedores.",
    phone: "+54 221 555 0202",
    email: "pedidos@mayoristadelsur.com.ar",
    minOrder: "$ 120.000",
    delivery: "GBA sur y CABA",
    products: ["Agua mineral", "Gaseosas", "Cerveza artesanal", "Energizantes"],
  },
  {
    id: "3",
    name: "CleanMax Mayorista",
    city: "Cordoba",
    province: "Cordoba",
    category: "Limpieza",
    summary: "Insumos de limpieza e higiene para comercios y hoteles.",
    description:
      "Catalogo de mas de 400 SKU. Descuentos por volumen y asesoramiento para locales gastronomicos.",
    phone: "+54 351 555 0303",
    email: "info@cleanmax.com.ar",
    minOrder: "$ 45.000",
    delivery: "Todo el pais via transporte",
    products: ["Detergentes", "Desinfectantes", "Papel higienico", "Bolsas"],
  },
  {
    id: "4",
    name: "TechWholesale AR",
    city: "Buenos Aires",
    province: "CABA",
    category: "Electronica",
    summary: "Accesorios, cables y perifericos para retailers.",
    description:
      "Importador directo. Garantia oficial y reposicion semanal de productos de alta rotacion.",
    phone: "+54 11 555 0404",
    email: "comercial@techwholesale.ar",
    minOrder: "$ 200.000",
    delivery: "CABA, GBA y envios al interior",
    products: ["Cargadores", "Auriculares", "Cables USB", "Fundas"],
  },
  {
    id: "5",
    name: "Textiles Pampa",
    city: "Mar del Plata",
    province: "Buenos Aires",
    category: "Textil",
    summary: "Remeras, buzos y uniformes por pack cerrado.",
    description:
      "Fabricacion local. Talles surtidos y estampado bajo pedido para empresas y clubes.",
    phone: "+54 223 555 0505",
    email: "ventas@textilespampa.com.ar",
    minOrder: "12 unidades por modelo",
    delivery: "Buenos Aires y envios nacionales",
    products: ["Remeras", "Buzos", "Camperas", "Uniformes"],
  },
  {
    id: "6",
    name: "Materiales Rio",
    city: "Mendoza",
    province: "Mendoza",
    category: "Construccion",
    summary: "Herramientas, ferreteria liviana y pinturas.",
    description:
      "Atendemos corralones y ferreterias de la region cuyana con lista de precios actualizada mensual.",
    phone: "+54 261 555 0606",
    email: "pedidos@materialesrio.com.ar",
    minOrder: "$ 150.000",
    delivery: "Mendoza, San Juan y San Luis",
    products: ["Pinturas", "Tornilleria", "Herramientas manuales", "EPI"],
  },
  {
    id: "7",
    name: "Salud Mayor",
    city: "Tucuman",
    province: "Tucuman",
    category: "Farmacia",
    summary: "OTC, perfumeria y cuidado personal para farmacias.",
    description:
      "Distribuidor habilitado ANMAT. Entregas programadas y credito para clientes habilitados.",
    phone: "+54 381 555 0707",
    email: "farmacia@saludmayor.com.ar",
    minOrder: "$ 95.000",
    delivery: "NOA y NEA",
    products: ["Analgesicos OTC", "Vitaminas", "Perfumeria", "Panales"],
  },
  {
    id: "8",
    name: "Almacen Central",
    city: "Neuquen",
    province: "Neuquen",
    category: "Alimentos",
    summary: "Abarrotes, legumbres y aceites para supermercados chicos.",
    description:
      "Red logistica propia en Patagonia norte. Integracion con sistemas de pedido por Excel o API.",
    phone: "+54 299 555 0808",
    email: "ventas@almacencentral.com.ar",
    minOrder: "$ 70.000",
    delivery: "Neuquen, Rio Negro sur",
    products: ["Legumbres", "Aceites", "Harinas", "Condimentos"],
  },
];

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

  const filteredSuppliers = useMemo(() => {
    return SUPPLIERS.filter((supplier) => {
      const categoryMatch =
        activeCategory === "Todos" || supplier.category === activeCategory;
      return categoryMatch && matchesQuery(supplier, query);
    });
  }, [query, activeCategory]);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

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
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base outline-none ring-emerald-600 transition focus:border-emerald-600 focus:bg-white focus:ring-2"
            />
          </label>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-zinc-700">Categorias</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
              {filteredSuppliers.length} resultado
              {filteredSuppliers.length === 1 ? "" : "s"}
            </p>
          </div>

          {filteredSuppliers.length === 0 ? (
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
          ) : (
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
                                {supplier.minOrder}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Entrega
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-zinc-900">
                                {supplier.delivery}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Telefono
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-zinc-900">
                                {supplier.phone}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Email
                              </dt>
                              <dd className="mt-1 text-sm font-medium text-emerald-800">
                                {supplier.email}
                              </dd>
                            </div>
                          </dl>
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
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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
