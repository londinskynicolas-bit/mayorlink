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

export default function Busqueda() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [provincia, setProvincia] = useState("Todas");
  const [cargando, setCargando] = useState(true);

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
    setCargando(true);
    let query = supabase.from("providers").select("*").eq("status", "active");
    if (busqueda) {
      query = query.or(
        `company_name.ilike.%${busqueda}%,description.ilike.%${busqueda}%,city.ilike.%${busqueda}%,category.ilike.%${busqueda}%`
      );
    }
    if (categoria !== "Todas") {
      query = query.ilike("category", categoria);
    }
    if (provincia !== "Todas") {
      query = query.eq("province", provincia);
    }
    query.order("is_founder", { ascending: false }).then(({ data }) => {
      setProveedores(data || []);
      setCargando(false);
    });
  }, [busqueda, categoria, provincia]);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (busqueda) params.set("q", busqueda);
    window.history.pushState({}, "", "/busqueda?" + params.toString());
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={buscar} className="flex gap-3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por rubro, producto, empresa o ciudad..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl text-sm transition-colors">
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-8">
        <aside className="w-56 flex-shrink-0">
          <div className="mb-6">
            <div className="text-xs font-black text-black uppercase tracking-widest mb-3">Categoria</div>
            {categorias.map((cat) => (
              <button key={cat} onClick={() => setCategoria(cat)} className={`block w-full text-left px-3 py-2 text-sm rounded-lg mb-1 font-medium transition-colors ${categoria === cat ? "bg-emerald-500 text-black font-black" : "text-gray-600 hover:bg-gray-100"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="mb-6">
            <div className="text-xs font-black text-black uppercase tracking-widest mb-3">Provincia</div>
            <select value={provincia} onChange={(e) => setProvincia(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black">
              {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-black uppercase tracking-tight">
              Resultados
              <span className="ml-2 text-sm font-normal text-gray-400 normal-case">{proveedores.length} proveedores</span>
            </h1>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Orden: Relevancia</div>
          </div>

          {cargando ? (
            <div className="text-center py-20 text-gray-400">Cargando...</div>
          ) : proveedores.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-black text-gray-900">No encontramos proveedores</div>
              <p className="text-gray-400 text-sm mt-2">Proba con otro termino o quitá los filtros</p>
              <button onClick={() => { setBusqueda(""); setCategoria("Todas"); setProvincia("Todas"); }} className="mt-4 text-emerald-600 text-sm underline font-bold">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {proveedores.map((p) => (
                <div key={p.id} className="border-2 border-gray-100 rounded-2xl p-5 hover:border-black transition-all">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="logo" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-lg font-black text-emerald-700">
                          {p.company_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {p.is_verified && <span className="text-xs bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">Verificado</span>}
                            {p.is_founder && <span className="text-xs bg-black text-white font-black px-2 py-0.5 rounded-full">Fundador</span>}
                            {p.category && <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full capitalize">{p.category}</span>}
                          </div>
                          <div className="text-lg font-black text-black">{p.company_name}</div>
                          <div className="text-sm text-gray-500">{p.city ? p.city + ", " : ""}{p.province}</div>
                        </div>
                        {p.min_order && (
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Pedido minimo</div>
                            <div className="text-lg font-black text-emerald-600">{p.min_order}</div>
                          </div>
                        )}
                      </div>
                      {p.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
                      {p.payment_methods && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {p.payment_methods.split(",").map((m: string) => (
                            <span key={m} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{m.trim()}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <a href={"/proveedores/" + p.slug} className="border-2 border-black text-black font-black text-sm px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-colors">
                          Ver perfil completo
                        </a>
                        {p.whatsapp && (
                          <a href={"https://wa.me/" + p.whatsapp} target="_blank" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm px-6 py-2 rounded-xl transition-colors">
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}