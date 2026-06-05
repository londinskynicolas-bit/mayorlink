"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DetalleSolicitud() {
  const { data: session } = useSession();
  const [solicitud, setSolicitud] = useState<any>(null);
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [miPropuesta, setMiPropuesta] = useState<any>(null);
  const [proveedor, setProveedor] = useState<any>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(false);
  const [form, setForm] = useState({
    message: "", price: "", delivery_time: "", extra_info: "",
  });

  useEffect(() => {
    const id = window.location.pathname.split("/").pop();
    if (!id) return;
    supabase.from("requests").select("*").eq("id", id).single()
      .then(({ data: sol }) => {
        setSolicitud(sol);
        setCargando(false);
        if (sol) {
          supabase.from("proposals").select("*").eq("request_id", id).order("created_at", { ascending: false })
            .then(({ data: props }) => setPropuestas(props || []));
        }
      });
    if (session?.user?.email) {
      supabase.from("providers").select("*").eq("email", session.user.email).single()
        .then(({ data }) => {
          setProveedor(data);
          if (data) {
            const id = window.location.pathname.split("/").pop();
            supabase.from("proposals").select("*").eq("request_id", id).eq("provider_slug", data.slug).single()
              .then(({ data: mp }) => setMiPropuesta(mp));
          }
        });
    }
  }, [session]);

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const enviarPropuesta = async () => {
    if (!form.message || !proveedor || !solicitud) return;
    setGuardando(true);
    await supabase.from("proposals").insert({
      request_id: solicitud.id,
      provider_id: proveedor.id,
      provider_slug: proveedor.slug,
      provider_name: proveedor.company_name,
      message: form.message,
      price: form.price,
      delivery_time: form.delivery_time,
      extra_info: form.extra_info,
    });
    await supabase.from("requests").update({ proposals_count: (solicitud.proposals_count || 0) + 1 }).eq("id", solicitud.id);
    setGuardando(false);
    setEnviado(true);
    setMostrarForm(false);
    setMiPropuesta({ ...form, provider_name: proveedor.company_name, provider_slug: proveedor.slug, created_at: new Date().toISOString() });
  };

  const cerrarSolicitud = async () => {
    if (!solicitud) return;
    if (!confirm("Confirmas que ya conseguiste lo que buscabas? La solicitud va a desaparecer del feed.")) return;
    setCerrando(true);
    await supabase.from("requests").update({ status: "resolved" }).eq("id", solicitud.id);
    setCerrando(false);
    window.location.href = "/solicitudes";
  };

  const tiempoAtras = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    if (horas < 1) return "hace menos de 1 hora";
    if (horas < 24) return `hace ${horas}h`;
    return `hace ${dias}d`;
  };

  if (cargando) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;
  if (!solicitud) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-black mb-4">Solicitud no encontrada</h1><a href="/solicitudes" className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl">Volver</a></div></div>;

  const esComprador = session?.user?.email === solicitud.buyer_email;
  const esProveedor = !!proveedor && !esComprador;
  const estaResuelta = solicitud.status === "resolved";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-black text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <a href="/solicitudes" className="text-emerald-400 text-sm font-bold hover:underline block mb-4">Volver a solicitudes</a>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs bg-emerald-500 text-black font-black px-3 py-1 rounded-full capitalize">{solicitud.category}</span>
                {solicitud.required_date && <span className="text-xs bg-red-500 text-white font-black px-3 py-1 rounded-full">Fecha: {solicitud.required_date}</span>}
                {estaResuelta && <span className="text-xs bg-gray-500 text-white font-black px-3 py-1 rounded-full">Resuelta</span>}
                <span className="text-xs text-gray-400">{tiempoAtras(solicitud.created_at)}</span>
              </div>
              <h1 className="text-3xl font-black mb-2">{solicitud.title}</h1>
              {solicitud.description && <p className="text-gray-400 mb-4">{solicitud.description}</p>}
              <div className="flex gap-6 text-sm text-gray-400">
                {solicitud.quantity && <span>📦 {solicitud.quantity}</span>}
                {solicitud.city && <span>📍 {solicitud.city}</span>}
                {solicitud.budget && <span>💰 Presupuesto: {solicitud.budget}</span>}
                <span>👤 {solicitud.buyer_name}</span>
              </div>
            </div>
            {esComprador && (
              <div className="text-right ml-6">
                <div className="text-3xl font-black text-emerald-400">{propuestas.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">propuestas recibidas</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {esComprador && !estaResuelta && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-black text-black text-sm">Ya conseguiste lo que buscabas?</p>
              <p className="text-gray-500 text-xs mt-1">Cerrá la solicitud para que los proveedores no sigan enviando propuestas</p>
            </div>
            <button onClick={cerrarSolicitud} disabled={cerrando} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50">
              {cerrando ? "Cerrando..." : "Marcar como resuelta"}
            </button>
          </div>
        )}

        {estaResuelta && (
          <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-4 mb-6 text-center">
            <p className="font-black text-gray-600 text-sm">Esta solicitud fue marcada como resuelta</p>
            <p className="text-gray-400 text-xs mt-1">El comprador ya encontro lo que buscaba</p>
          </div>
        )}

        {esProveedor && !estaResuelta && (
          <div className="mb-8">
            {!miPropuesta && !enviado && !mostrarForm && (
              <button onClick={() => setMostrarForm(true)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl text-lg transition-colors">
                Enviar mi propuesta
              </button>
            )}
            {mostrarForm && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
                <h2 className="text-xl font-black text-black mb-6">Tu propuesta</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Mensaje *</label>
                    <textarea value={form.message} onChange={(e) => actualizar("message", e.target.value)} placeholder="Contale al comprador como podes ayudarlo..." rows={4} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Precio ofrecido</label>
                      <input type="text" value={form.price} onChange={(e) => actualizar("price", e.target.value)} placeholder="Ej: $45.000 por 100 unidades" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Tiempo de entrega</label>
                      <input type="text" value={form.delivery_time} onChange={(e) => actualizar("delivery_time", e.target.value)} placeholder="Ej: 3 dias habiles" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Informacion adicional</label>
                    <input type="text" value={form.extra_info} onChange={(e) => actualizar("extra_info", e.target.value)} placeholder="Stock disponible, formas de pago, envio incluido..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setMostrarForm(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl hover:border-black transition-colors">Cancelar</button>
                    <button onClick={enviarPropuesta} disabled={guardando || !form.message} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50">
                      {guardando ? "Enviando..." : "Enviar propuesta"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {(miPropuesta || enviado) && (
              <div>
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-emerald-700 font-black text-sm">Tu propuesta fue enviada correctamente</p>
                </div>
                {miPropuesta && (
                  <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6">
                    <h3 className="font-black text-black mb-3 text-sm uppercase tracking-wide">Tu propuesta enviada</h3>
                    <p className="text-sm text-gray-700 mb-4">{miPropuesta.message}</p>
                    <div className="flex gap-3 flex-wrap text-xs">
                      {miPropuesta.price && <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">Precio: {miPropuesta.price}</span>}
                      {miPropuesta.delivery_time && <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">Entrega: {miPropuesta.delivery_time}</span>}
                      {miPropuesta.extra_info && <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">{miPropuesta.extra_info}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {esComprador && (
          <div>
            <h2 className="text-xl font-black text-black mb-6 uppercase tracking-tight">
              Propuestas recibidas
              <span className="ml-2 text-sm font-normal text-gray-400 normal-case">{propuestas.length} propuestas</span>
            </h2>
            {propuestas.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-gray-100 rounded-2xl">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-black text-gray-900">Todavia no hay propuestas</p>
                <p className="text-sm text-gray-400 mt-1">Los proveedores van a ver tu solicitud y responder pronto</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {propuestas.map((p, i) => (
                  <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-black transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-black text-black text-lg">{p.provider_name}</div>
                        <div className="text-xs text-gray-400">{tiempoAtras(p.created_at)}</div>
                      </div>
                      <a href={"/proveedores/" + p.provider_slug} target="_blank" className="text-xs text-emerald-600 font-bold hover:underline">Ver perfil</a>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{p.message}</p>
                    <div className="flex gap-3 flex-wrap text-xs mb-4">
                      {p.price && <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">Precio: {p.price}</span>}
                      {p.delivery_time && <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">Entrega: {p.delivery_time}</span>}
                      {p.extra_info && <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">{p.extra_info}</span>}
                    </div>
                    <a href={"/proveedores/" + p.provider_slug} target="_blank" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-2 rounded-xl text-sm transition-colors">
                      Contactar por WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!esComprador && !esProveedor && (
          <div className="text-center py-12 bg-white border-2 border-gray-100 rounded-2xl">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-black text-gray-900 mb-2">Registrate para responder esta solicitud</p>
            <a href="/registro-proveedor" className="inline-block bg-emerald-500 text-black font-black px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
              Registrar mi empresa
            </a>
          </div>
        )}
      </div>
    </div>
  );
}