"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PerfilProveedor() {
  const [proveedor, setProveedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const slug = window.location.pathname.split("/").pop();
    if (!slug) return;
    supabase.from("providers").select("*").eq("slug", slug).single()
      .then(({ data }) => {
        setProveedor(data);
        setCargando(false);
        if (data) {
          supabase.from("providers").update({ views_count: (data.views_count || 0) + 1 }).eq("slug", slug).then(() => {});
          supabase.from("products").select("*").eq("provider_slug", slug).eq("status", "active")
            .then(({ data: prods }) => setProductos(prods || []));
        }
      });
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 font-bold">Cargando...</div>
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-black text-black mb-4">Proveedor no encontrado</h1>
            <a href="/busqueda" className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl">Ir a busqueda</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-black text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <a href="/busqueda" className="text-emerald-400 text-sm font-bold hover:underline block mb-6">Volver a resultados</a>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-black text-black flex-shrink-0">
              {proveedor.company_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {proveedor.is_verified && <span className="text-xs bg-emerald-500 text-black font-black px-3 py-1 rounded-full">Verificado</span>}
                {proveedor.is_founder && <span className="text-xs bg-white text-black font-black px-3 py-1 rounded-full">Fundador</span>}
              </div>
              <h1 className="text-3xl font-black mb-1">{proveedor.company_name}</h1>
              <p className="text-gray-400 text-sm mb-1">{proveedor.city ? proveedor.city + ", " : ""}{proveedor.province}</p>
              {proveedor.views_count > 0 && (
                <p className="text-emerald-400 text-xs font-bold mb-4">{proveedor.views_count} personas vieron este perfil</p>
              )}
              <div className="flex gap-3 flex-wrap">
                {proveedor.whatsapp && (
                  <a href={"https://wa.me/" + proveedor.whatsapp} target="_blank" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors text-sm">
                    Contactar por WhatsApp
                  </a>
                )}
                {proveedor.instagram && (
                  <a href={"https://instagram.com/" + proveedor.instagram} target="_blank" className="border-2 border-gray-600 text-white font-black px-6 py-3 rounded-xl hover:border-white transition-colors text-sm">
                    Instagram
                  </a>
                )}
                {proveedor.email && (
                  <a href={"mailto:" + proveedor.email} className="border-2 border-gray-600 text-white font-black px-6 py-3 rounded-xl hover:border-white transition-colors text-sm">
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-6 mb-10">
          {proveedor.min_order && (
            <div className="border-2 border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Pedido minimo</div>
              <div className="text-xl font-black text-emerald-600">{proveedor.min_order}</div>
            </div>
          )}
          {proveedor.payment_methods && (
            <div className="border-2 border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Formas de pago</div>
              <div className="text-sm font-bold text-black">{proveedor.payment_methods}</div>
            </div>
          )}
          {proveedor.shipping_info && (
            <div className="border-2 border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Envios</div>
              <div className="text-sm font-bold text-black">{proveedor.shipping_info}</div>
            </div>
          )}
        </div>

        {proveedor.description && (
          <div className="mb-10">
            <h2 className="text-lg font-black text-black uppercase tracking-tight mb-3">Sobre la empresa</h2>
            <p className="text-gray-600 leading-relaxed">{proveedor.description}</p>
          </div>
        )}

        {productos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-black text-black uppercase tracking-tight mb-6">
              Catalogo de productos
              <span className="ml-2 text-sm font-normal text-gray-400 normal-case">{productos.length} productos</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {productos.map((p) => (
                <div key={p.id} className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-black transition-all flex flex-col">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full aspect-video object-cover"/>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center border-b border-gray-100">
                      <span className="text-xs text-gray-400 font-bold">Sin fotos</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-black text-black mb-1">{p.name}</h3>
                    {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {p.price_unit && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full">Unidad: {p.price_unit}</span>}
                      {p.price_dozen && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">Docena: {p.price_dozen}</span>}
                      {p.price_box && <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-full">Caja: {p.price_box}</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 flex-wrap mb-4">
                      {p.material && <span>Material: {p.material}</span>}
                      {p.measures && <span>· Talles: {p.measures}</span>}
                      {p.stock && <span>· Stock: {p.stock}</span>}
                    </div>
                    <div className="mt-auto">
                      {proveedor.whatsapp && (
                        <a href={"https://wa.me/" + proveedor.whatsapp + "?text=Hola, me interesa el producto: " + p.name} target="_blank" className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm py-3 rounded-xl text-center transition-colors">
                          Consultar por WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productos.length === 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-black text-black uppercase tracking-tight mb-4">Galeria</h2>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <span className="text-xs text-gray-400 font-bold">FOTO {n}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="bg-black px-6 py-12 text-center">
        <h2 className="text-2xl font-black text-white mb-2">Sos proveedor mayorista?</h2>
        <p className="text-gray-400 text-sm mb-6">Publica tu empresa gratis y llega a miles de comerciantes</p>
        <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-2xl transition-colors">
          Publicar mi empresa gratis
        </a>
      </section>
    </div>
  );
}