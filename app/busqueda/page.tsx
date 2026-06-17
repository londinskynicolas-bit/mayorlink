"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const categorias = ["Todas", "Indumentaria", "Calzado", "Electronica", "Alimentos", "Bebidas", "Ferreteria", "Cosmetica", "Hogar", "Deportes", "Juguetes", "Tecnologia", "Textil", "Otros"];

const PROVINCIAS = [
  "Todas", "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut",
  "Cordoba", "Corrientes", "Entre Rios", "Formosa", "Jujuy",
  "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquen",
  "Rio Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucuman"
];

const POR_PAGINA = 20;

export default function Busqueda() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [provincia, setProvincia] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      const cat = params.get("categoria") || "Todas";
      setBusqueda(q);
      setCategoria(cat);
    }
  }, []);

  useEffect(() => {
    setPagina(0);
    buscarProveedores(0, false);
  }, [busqueda, categoria, provincia]);

  const construirQuery = () => {
    let query = supabase.from("providers").select("*", { count: "exact" }).eq("status", "active");
    if (busqueda) {
      query = query.or(`company_name.ilike.%${busqueda}%,description.ilike.%${busqueda}%,city.ilike.%${busqueda}%,category.ilike.%${busqueda}%`);
    }
    if (categoria !== "Todas") {
      query = query.ilike("category", categoria);
    }
    if (provincia !== "Todas") {
      query = query.eq("province", provincia);
    }
    return query;
  };

  const buscarProveedores = async (pag: number, agregar: boolean) => {
    if (agregar) setCargandoMas(true); else setCargando(true);

    const desde = pag * POR_PAGINA;
    const hasta = desde + POR_PAGINA - 1;

    const { data, count } = await construirQuery()
      .order("is_founder", { ascending: false })
      .range(desde, hasta);

    setTotalResultados(count || 0);
    if (agregar) {
      setProveedores((prev) => [...prev, ...(data || [])]);
    } else {
      setProveedores(data || []);
    }
    setCargando(false);
    setCargandoMas(false);
  };

  const verMas = () => {
    const siguiente = pagina + 1;
    setPagina(siguiente);
    buscarProveedores(siguiente, true);
  };

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (busqueda) params.set("q", busqueda);
    window.history.pushState({}, "", "/busqueda?" + params.toString());
  };

  const hayMas = proveedores.length < totalResultados;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={buscar} className="flex gap-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar proveedores..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 md:px-8 py-3 rounded-xl text-sm transition-colors whitespace-nowrap">
              Buscar
            </button>
          </form>

          <button onClick={() => setFiltrosAbiertos(!filtrosAbiertos)} className="md:hidden mt-3 flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
            Filtros {categoria !== "Todas" || provincia !== "Todas" ? "• activos" : ""}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex gap-6">

        <aside className={`${filtrosAbiertos ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0`}>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-4 md:mb-0 md:bg-transparent md:border-0 md:p-0">
            <div className="mb-4">
              <div className="text-xs font-black text-black uppercase tracking-widest mb-2">Categoria</div>
              <div className="flex flex-wrap gap-2 md:flex-col md:gap-0">
                {categorias.map((cat) => (
                  <button key={cat} onClick={() => { setCategoria(cat); setFiltrosAbiertos(false); }} className={`px-3 py-1.5 md:py-2 text-xs md:text-sm rounded-full md:rounded-lg md:w-full md:text-left mb-0 md:mb-1 font-medium transition-colors ${categoria === cat ? "bg-emerald-500 text-black font-black" : "bg-gray-100 md:bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-black text-black uppercase tracking-widest mb-2">Provincia</div>
              <select value={provincia} onChange={(e) => { setProvincia(e.target.value); setFiltrosAbiertos(false); }} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black">
                {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg md:text-xl font-black text-black uppercase tracking-tight">
              Resultados
              <span className="ml-2 text-sm font-normal text-gray-400 normal-case">{totalResultados} proveedores</span>
            </h1>
          </div>

          {cargando ? (
            <div className="text-center py-20 text-gray-400">Cargando...</div>
          ) : proveedores.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-black text-gray-900">No encontramos proveedores</div>
              <button onClick={() => { setBusqueda(""); setCategoria("Todas"); setProvincia("Todas"); }} className="mt-4 text-emerald-600 text-sm underline font-bold">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {proveedores.map((p) => (
                  <div key={p.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-black transition-all">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="logo" className="w-full h-full object-cover"/>
                        ) : (
                          <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-lg font-black text-emerald-700">
                            {p.company_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 mb-1 flex-wrap">
                              {p.is_verified && <span className="text-xs bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">Verificado</span>}
                              {p.is_founder && <span className="text-xs bg-black text-white font-black px-2 py-0.5 rounded-full">Fundador</span>}
                              {p.category && <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full capitalize">{p.category}</span>}
                            </div>
                            <div className="text-base font-black text-black truncate">{p.company_name}</div>
                            <div className="text-xs text-gray-500">{p.city ? p.city + ", " : ""}{p.province}</div>
                          </div>
                          {p.min_order && (
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-400">Min</div>
                              <div className="text-sm font-black text-emerald-600">{p.min_order}</div>
                            </div>
                          )}
                        </div>
                        {p.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{p.description}</p>}
                        <div className="flex gap-2">
                          <a href={"/proveedores/" + p.slug} className="flex-1 border-2 border-black text-black font-black text-xs py-2 rounded-xl text-center hover:bg-black hover:text-white transition-colors">
                            Ver perfil
                          </a>
                          {p.whatsapp && (
                            <a href={"https://wa.me/" + p.whatsapp} target="_blank" className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2 rounded-xl text-center transition-colors">
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hayMas && (
                <div className="text-center mt-6">
                  <button onClick={verMas} disabled={cargandoMas} className="bg-white border-2 border-black text-black font-black px-8 py-3 rounded-xl hover:bg-black hover:text-white transition-colors text-sm disabled:opacity-50 inline-flex items-center gap-2">
                    {cargandoMas ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        Cargando...
                      </>
                    ) : `Ver mas (${totalResultados - proveedores.length} restantes)`}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}