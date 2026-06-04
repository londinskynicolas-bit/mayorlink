"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIAS = [
  "Todas", "Indumentaria", "Calzado", "Electronica", "Alimentos",
  "Bebidas", "Ferreteria", "Cosmetica", "Hogar", "Deportes",
  "Juguetes", "Tecnologia", "Otros"
];

export default function Solicitudes() {
  const { data: session } = useSession();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", quantity: "",
    city: "", province: "", budget: "", required_date: "",
  });

  useEffect(() => {
    cargarSolicitudes();
  }, [categoriaFiltro]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    let query = supabase.from("requests").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (categoriaFiltro !== "Todas") query = query.eq("category", categoriaFiltro);
    const { data } = await query;
    setSolicitudes(data || []);
    setCargando(false);
  };

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const publicar = async () => {
    if (!form.title || !form.category) return;
    setGuardando(true);
    const { error } = await supabase.from("requests").insert({
      buyer_email: session?.user?.email || "anonimo",
      buyer_name: session?.user?.name || "Comprador",
      title: form.title,
      description: form.description,
      category: form.category,
      quantity: form.quantity,
      city: form.city,
      province: form.province,
      budget: form.budget,
      required_date: form.required_date,
    });
    setGuardando(false);
    if (!error) {
      setForm({ title: "", description: "", category: "", quantity: "", city: "", province: "", budget: "", required_date: "" });
      setMostrarForm(false);
      cargarSolicitudes();
    }
  };

  const tiempoAtras = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    if (horas < 1) return "hace menos de 1 hora";
    if (horas < 24) return `hace ${horas} hora${horas > 1 ? "s" : ""}`;
    return `hace ${dias} dia${dias > 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-black text-white px-6 py-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">Red comercial B2B</div>
            <h1 className="text-4xl font-black mb-2">Solicitudes de compra</h1>
            <p className="text-gray-400">Compradores buscando proveedores ahora mismo</p>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors"
          >
            + Publicar solicitud
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {mostrarForm && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-black text-black mb-6">Nueva solicitud de compra</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Que necesitas? *</label>
                <input type="text" value={form.title} onChange={(e) => actualizar("title", e.target.value)} placeholder="Ej: Busco 50 alfombras persas · Necesito proveedor de sillas para evento" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion adicional</label>
                <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} placeholder="Detalles del producto, calidad requerida, condiciones especiales..." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Categoria *</label>
                  <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS.filter(c => c !== "Todas").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Cantidad</label>
                  <input type="text" value={form.quantity} onChange={(e) => actualizar("quantity", e.target.value)} placeholder="Ej: 100 unidades, 5 docenas" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Ciudad</label>
                  <input type="text" value={form.city} onChange={(e) => actualizar("city", e.target.value)} placeholder="Ej: Buenos Aires, Cordoba" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Presupuesto (opcional)</label>
                  <input type="text" value={form.budget} onChange={(e) => actualizar("budget", e.target.value)} placeholder="Ej: hasta $50.000" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Fecha requerida (opcional)</label>
                <input type="text" value={form.required_date} onChange={(e) => actualizar("required_date", e.target.value)} placeholder="Ej: antes del 30 de junio, urgente" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMostrarForm(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl hover:border-black transition-colors">
                  Cancelar
                </button>
                <button onClick={publicar} disabled={guardando || !form.title || !form.category} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50">
                  {guardando ? "Publicando..." : "Publicar solicitud"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIAS.map((cat) => (
            <button key={cat} onClick={() => setCategoriaFiltro(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${categoriaFiltro === cat ? "bg-black text-white" : "bg-white border-2 border-gray-200 text-gray-600 hover:border-black"}`}>
              {cat}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-black text-black mb-2">No hay solicitudes todavia</h2>
            <p className="text-gray-500 text-sm mb-6">Se el primero en publicar una necesidad de compra</p>
            <button onClick={() => setMostrarForm(true)} className="bg-emerald-500 text-black font-black px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
              Publicar solicitud
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {solicitudes.map((s) => (
              <a key={s.id} href={"/solicitudes/" + s.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-black transition-all block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-full">{s.category}</span>
                      {s.required_date && <span className="text-xs bg-red-100 text-red-700 font-black px-3 py-1 rounded-full">Fecha: {s.required_date}</span>}
                    </div>
                    <h3 className="text-lg font-black text-black mb-1">{s.title}</h3>
                    {s.description && <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-xs text-gray-400">{tiempoAtras(s.created_at)}</div>
                    {s.proposals_count > 0 && (
                      <div className="text-xs bg-black text-white font-black px-2 py-1 rounded-full mt-1">{s.proposals_count} propuesta{s.proposals_count > 1 ? "s" : ""}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  {s.quantity && <span>📦 {s.quantity}</span>}
                  {s.city && <span>📍 {s.city}</span>}
                  {s.budget && <span>💰 {s.budget}</span>}
                  <span>👤 {s.buyer_name}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}