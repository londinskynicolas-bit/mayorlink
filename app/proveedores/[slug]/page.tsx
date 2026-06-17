"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PerfilProveedor() {
  const { data: session } = useSession();
  const [proveedor, setProveedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [resenas, setResenas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [esFavorito, setEsFavorito] = useState(false);
  const [toggleandoFav, setToggleandoFav] = useState(false);
  const [fotoActiva, setFotoActiva] = useState<{[key: string]: number}>({});

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
          supabase.from("reviews").select("*").eq("provider_slug", slug).order("created_at", { ascending: false })
            .then(({ data: revs }) => setResenas(revs || []));
        }
      });
  }, []);

  useEffect(() => {
    if (session?.user?.email && proveedor?.slug) {
      supabase.from("favorites").select("id").eq("buyer_email", session.user.email).eq("provider_slug", proveedor.slug).single()
        .then(({ data }) => setEsFavorito(!!data));
    }
  }, [session, proveedor]);

  // Si volvimos del login con intencion de abrir el chat, lo abrimos automaticamente
  useEffect(() => {
    if (session?.user?.email && proveedor?.email) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("abrir_chat") === "1") {
        const convId = [session.user.email, proveedor.email].sort().join("_");
        window.location.href = "/mensajes?conv=" + convId + "&con=" + proveedor.email;
      }
    }
  }, [session, proveedor]);

  const toggleFavorito = async () => {
    if (!session?.user?.email || !proveedor) return;
    setToggleandoFav(true);
    if (esFavorito) {
      await supabase.from("favorites").delete().eq("buyer_email", session.user.email).eq("provider_slug", proveedor.slug);
      setEsFavorito(false);
    } else {
      await supabase.from("favorites").insert({ buyer_email: session.user.email, provider_slug: proveedor.slug });
      setEsFavorito(true);
    }
    setToggleandoFav(false);
  };

  const registrarClickWhatsApp = async () => {
    if (!proveedor) return;
    await supabase.from("providers").update({
      whatsapp_clicks: (proveedor.whatsapp_clicks || 0) + 1
    }).eq("slug", proveedor.slug);
  };

  const iniciarChat = () => {
    if (!session) {
      sessionStorage.setItem("redirect_after_login", "/proveedores/" + proveedor.slug + "?abrir_chat=1");
      window.location.href = "/login";
      return;
    }
    const convId = [session.user?.email, proveedor.email].sort().join("_");
    window.location.href = "/mensajes?conv=" + convId + "&con=" + proveedor.email;
  };

  const promedioRating = resenas.length > 0
    ? (resenas.reduce((acc, r) => acc + r.rating, 0) / resenas.length).toFixed(1)
    : null;

  if (cargando) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;

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

  const nombreComprador = session?.user?.name || "un comprador";
  const msgPerfil = "Hola " + proveedor.company_name + "! Soy " + nombreComprador + " y vi tu perfil en MayorLink. Me interesa tu catalogo mayorista, podemos hablar?";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="bg-black text-white px-4 md:px-6 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <a href="/busqueda" className="text-emerald-400 text-sm font-bold hover:underline block mb-4">Volver</a>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0">
              {proveedor.logo_url ? (
                <img src={proveedor.logo_url} alt="logo" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-xl md:text-2xl font-black text-black">
                  {proveedor.company_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {proveedor.is_verified && <span className="text-xs bg-emerald-500 text-black font-black px-2 py-0.5 rounded-full">Verificado</span>}
                {proveedor.is_founder && <span className="text-xs bg-white text-black font-black px-2 py-0.5 rounded-full">Fundador</span>}
                {proveedor.category && <span className="text-xs bg-gray-700 text-gray-200 font-bold px-2 py-0.5 rounded-full capitalize">{proveedor.category}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-1 leading-tight">{proveedor.company_name}</h1>
              <p className="text-gray-400 text-sm mb-2">{proveedor.city ? proveedor.city + ", " : ""}{proveedor.province}</p>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {promedioRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 font-black text-sm">{promedioRating} estrellas</span>
                    <span className="text-gray-400 text-xs">({resenas.length})</span>
                  </div>
                )}
                {proveedor.views_count > 0 && <span className="text-emerald-400 text-xs font-bold">{proveedor.views_count} visitas</span>}
                {proveedor.whatsapp_clicks > 0 && <span className="text-emerald-400 text-xs font-bold">{proveedor.whatsapp_clicks} contactos WA</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {proveedor.whatsapp && (
                  <a href={"https://wa.me/" + proveedor.whatsapp + "?text=" + encodeURIComponent(msgPerfil)} target="_blank" onClick={registrarClickWhatsApp} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl transition-colors text-xs md:text-sm">
                    WhatsApp
                  </a>
                )}
                <button onClick={iniciarChat} className="border-2 border-gray-600 text-white font-black px-4 py-2 rounded-xl hover:border-emerald-400 hover:text-emerald-400 transition-colors text-xs md:text-sm">
                  Mensaje
                </button>
                {session && (
                  <button onClick={toggleFavorito} disabled={toggleandoFav} className={"border-2 font-black px-4 py-2 rounded-xl transition-colors text-xs md:text-sm " + (esFavorito ? "bg-yellow-400 border-yellow-400 text-black" : "border-gray-600 text-white hover:border-yellow-400")}>
                    {toggleandoFav ? "..." : esFavorito ? "Guardado" : "Guardar"}
                  </button>
                )}
                {proveedor.instagram && (
                  <a href={"https://instagram.com/" + proveedor.instagram} target="_blank" className="border-2 border-gray-600 text-white font-black px-4 py-2 rounded-xl hover:border-white transition-colors text-xs md:text-sm">
                    Instagram
                  </a>
                )}
                <a href={"/resena?proveedor=" + proveedor.slug} className="border-2 border-gray-600 text-white font-black px-4 py-2 rounded-xl hover:border-emerald-400 hover:text-emerald-400 transition-colors text-xs md:text-sm">
                  Resena
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {proveedor.min_order && (
            <div className="border-2 border-gray-100 rounded-2xl p-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Pedido minimo</div>
              <div className="text-lg font-black text-emerald-600">{proveedor.min_order}</div>
            </div>
          )}
          {proveedor.payment_methods && (
            <div className="border-2 border-gray-100 rounded-2xl p-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Formas de pago</div>
              <div className="text-sm font-bold text-black">{proveedor.payment_methods}</div>
            </div>
          )}
          {proveedor.shipping_info && (
            <div className="border-2 border-gray-100 rounded-2xl p-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Envios</div>
              <div className="text-sm font-bold text-black">{proveedor.shipping_info}</div>
            </div>
          )}
        </div>

        {proveedor.description && (
          <div className="mb-8">
            <h2 className="text-base font-black text-black uppercase tracking-tight mb-3">Sobre la empresa</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{proveedor.description}</p>
          </div>
        )}

        {productos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-black text-black uppercase tracking-tight mb-4">
              Catalogo
              <span className="ml-2 text-sm font-normal text-gray-400 normal-case">{productos.length} productos</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productos.map((p) => {
                const msgProducto = "Hola " + proveedor.company_name + "! Soy " + nombreComprador + " y vi tu perfil en MayorLink. Me interesa el producto: " + p.name + ". Podemos hablar?";
                return (
                  <div key={p.id} className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-black transition-all flex flex-col">
                    {p.images && p.images.length > 0 ? (
                      <div className="relative">
                        <img src={p.images[fotoActiva[p.id] || 0]} alt={p.name} className="w-full aspect-video object-cover"/>
                        {p.images.length > 1 && (
                          <>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                              {p.images.map((_: string, i: number) => (
                                <button key={i} onClick={() => setFotoActiva(prev => ({ ...prev, [p.id]: i }))} className={"w-2 h-2 rounded-full " + ((fotoActiva[p.id] || 0) === i ? "bg-white" : "bg-white opacity-50")}/>
                              ))}
                            </div>
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                              <button onClick={() => setFotoActiva(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 0) - 1) }))} className="w-7 h-7 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-xs">&lt;</button>
                              <button onClick={() => setFotoActiva(prev => ({ ...prev, [p.id]: Math.min(p.images.length - 1, (prev[p.id] || 0) + 1) }))} className="w-7 h-7 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-xs">&gt;</button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-bold">Sin fotos</span>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-black text-black mb-1 text-sm">{p.name}</h3>
                      {p.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>}
                      <div className="flex gap-2 flex-wrap mb-2">
                        {p.price_unit && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Unidad: {p.price_unit}</span>}
                        {p.price_dozen && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Docena: {p.price_dozen}</span>}
                        {p.price_box && <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Caja: {p.price_box}</span>}
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400 flex-wrap mb-3">
                        {p.material && <span>Mat: {p.material}</span>}
                        {p.measures && <span>· {p.measures}</span>}
                        {p.stock && <span>· Stock: {p.stock}</span>}
                      </div>
                      <div className="mt-auto">
                        {proveedor.whatsapp && (
                          <a href={"https://wa.me/" + proveedor.whatsapp + "?text=" + encodeURIComponent(msgProducto)} target="_blank" onClick={registrarClickWhatsApp} className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2 rounded-xl text-center transition-colors">
                            Consultar por WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-black uppercase tracking-tight">
              Resenas {promedioRating && <span className="text-yellow-500">{promedioRating}</span>}
              <span className="ml-2 text-sm font-normal text-gray-400 normal-case">({resenas.length})</span>
            </h2>
            <a href={"/resena?proveedor=" + proveedor.slug} className="text-emerald-600 text-xs font-bold hover:underline">Dejar resena</a>
          </div>
          {resenas.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm font-bold mb-3">Todavia no hay resenas</p>
              <a href={"/resena?proveedor=" + proveedor.slug} className="inline-block bg-emerald-500 text-black font-black px-5 py-2 rounded-xl text-sm hover:bg-emerald-400 transition-colors">
                Dejar resena
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {resenas.map((r) => (
                <div key={r.id} className="border-2 border-gray-100 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-black text-black text-sm">{r.reviewer_name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} className={n <= r.rating ? "text-yellow-400 text-sm" : "text-gray-200 text-sm"}>*</span>
                        ))}
                        {r.is_verified && <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Verificada</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("es-AR")}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="bg-black px-4 md:px-6 py-10 text-center">
        <h2 className="text-xl md:text-2xl font-black text-white mb-2">Sos proveedor mayorista?</h2>
        <p className="text-gray-400 text-sm mb-6">Publica tu empresa gratis y llega a miles de comerciantes</p>
        <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-2xl transition-colors">
          Publicar mi empresa gratis
        </a>
      </section>
    </div>
  );
}