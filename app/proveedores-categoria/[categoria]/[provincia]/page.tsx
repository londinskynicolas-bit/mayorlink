"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../../../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NOMBRES_PROVINCIA: { [key: string]: string } = {
  "buenos-aires": "Buenos Aires",
  "caba": "CABA",
  "cordoba": "Córdoba",
  "santa-fe": "Santa Fe",
  "mendoza": "Mendoza",
  "tucuman": "Tucumán",
  "salta": "Salta",
  "entre-rios": "Entre Ríos",
  "neuquen": "Neuquén",
  "rio-negro": "Río Negro",
  "chaco": "Chaco",
  "corrientes": "Corrientes",
  "misiones": "Misiones",
  "santiago-del-estero": "Santiago del Estero",
  "san-juan": "San Juan",
  "san-luis": "San Luis",
  "la-pampa": "La Pampa",
  "catamarca": "Catamarca",
  "la-rioja": "La Rioja",
  "jujuy": "Jujuy",
  "formosa": "Formosa",
  "chubut": "Chubut",
  "santa-cruz": "Santa Cruz",
  "tierra-del-fuego": "Tierra del Fuego",
  "todas": "toda Argentina",
};

export default function ProveedoresPorCategoria() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState("");
  const [provincia, setProvincia] = useState("");

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const cat = parts[parts.length - 2] || "";
    const prov = parts[parts.length - 1] || "";
    setCategoria(cat);
    setProvincia(prov);

    let query = supabase.from("providers").select("*").eq("status", "active").ilike("category", cat.replace(/-/g, " "));
    if (prov !== "todas") {
      const nombreProv = NOMBRES_PROVINCIA[prov] || prov;
      query = query.eq("province", nombreProv);
    }
    query.order("profile_score", { ascending: false }).then(({ data }) => {
      setProveedores(data || []);
      setCargando(false);
    });
  }, []);

  const nombreCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, " ");
  const nombreProvincia = NOMBRES_PROVINCIA[provincia] || provincia;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-black text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
            Directorio mayorista B2B
          </div>
          <h1 className="text-4xl font-black mb-3">
            Proveedores de {nombreCategoria} en {nombreProvincia}
          </h1>
          <p className="text-gray-400 text-lg">
            {cargando ? "Buscando..." : `${proveedores.length} proveedores mayoristas encontrados`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex gap-3 mb-8 flex-wrap">
          <a href={`/proveedores-categoria/${categoria}/todas`} className="text-sm text-emerald-600 font-bold hover:underline">
            Ver en toda Argentina
          </a>
          <span className="text-gray-300">·</span>
          <a href="/busqueda" className="text-sm text-gray-500 hover:text-black font-bold">
            Ver todas las categorias
          </a>
        </div>

        {cargando ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : proveedores.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-black text-black mb-2">
              No encontramos proveedores de {nombreCategoria} en {nombreProvincia}
            </h2>
            <p className="text-gray-500 text-sm mb-6">Proba buscar en toda Argentina</p>
            <a href={`/proveedores-categoria/${categoria}/todas`} className="inline-block bg-emerald-500 text-black font-black px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
              Ver en toda Argentina
            </a>
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

        <div className="mt-12 bg-black rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Sos proveedor de {nombreCategoria}?</h2>
          <p className="text-gray-400 text-sm mb-6">Aparece en esta pagina gratis y llega a compradores de {nombreProvincia}</p>
          <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-2xl transition-colors">
            Publicar mi empresa gratis
          </a>
        </div>
      </div>
    </div>
  );
}