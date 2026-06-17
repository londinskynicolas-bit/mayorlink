"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Gracias() {
  const [proveedor, setProveedor] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (slug) {
      supabase.from("providers").select("*").eq("slug", slug).single()
        .then(({ data }) => setProveedor(data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3">
          Tu empresa ya esta publicada!
        </h1>
        {proveedor && (
          <p className="text-emerald-400 font-bold mb-6">{proveedor.company_name}</p>
        )}
        <p className="text-gray-400 text-sm mb-8">
          Ahora los compradores de todo el pais pueden encontrarte y contactarte directo por WhatsApp.
        </p>

        <div className="flex flex-col gap-3">
          {proveedor && (
            <a href={"/proveedores/" + proveedor.slug} target="_blank" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-sm transition-colors">
              Ver mi perfil publico
            </a>
          )}
          <a href="/mis-productos" className="border-2 border-white text-white font-black py-3 rounded-xl text-sm hover:bg-white hover:text-black transition-colors">
            Agregar mis productos
          </a>
          <a href="/panel" className="text-gray-400 text-sm hover:text-white">
            Ir a mi panel
          </a>
        </div>

        <div className="mt-8 bg-gray-900 rounded-2xl p-4">
          <p className="text-amber-400 text-xs font-black mb-1">💡 Tip</p>
          <p className="text-gray-400 text-xs">
            Los perfiles con productos y fotos reciben hasta 3 veces mas consultas. Completa tu catalogo ahora.
          </p>
        </div>
      </div>
    </div>
  );
}