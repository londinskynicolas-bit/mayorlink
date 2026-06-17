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
  { label: "Todas", value: "todas" },
  { label: "Indumentaria", value: "indumentaria" },
  { label: "Calzado", value: "calzado" },
  { label: "Electronica", value: "electronica" },
  { label: "Alimentos", value: "alimentos" },
  { label: "Bebidas", value: "bebidas" },
  { label: "Ferreteria", value: "ferreteria" },
  { label: "Cosmetica", value: "cosmetica" },
  { label: "Hogar", value: "hogar" },
  { label: "Deportes", value: "deportes" },
  { label: "Juguetes", value: "juguetes" },
  { label: "Tecnologia", value: "tecnologia" },
  { label: "Textil", value: "textil" },
  { label: "Otros", value: "otros" },
];

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Solicitudes() {
  const { data: session } = useSession();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [yaPublicado, setYaPublicado] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "", quantity: "",
    city: "", province: "", budget: "", required_date: "",
    buyer_name: "", buyer_email: "",
  });

  useEffect(() => {
    cargarSolicitudes();
  }, [categoriaFiltro]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    let query = supabase.from("requests").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (categoriaFiltro !== "todas") query = query.eq("category", categoriaFiltro);
    const { data } = await query;
    setSolicitudes(data || []);
    setCargando(false);
  };

  const actualizar = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const publicar = async () => {
    if (yaPublicado || guardando) return;
    setError("");

    if (!form.title.trim()) { setError("Conta que necesitas comprar"); return; }
    if (!form.category) { setError("Selecciona una categoria"); return; }

    const emailFinal = session?.user?.email || form.buyer_email;
    const nombreFinal = session?.user?.name || form.buyer_name;

    if (!session?.user?.email) {
      if (!nombreFinal.trim()) { setError("Ingresa tu nombre para que los proveedores sepan quien escribe"); return; }
      if (!validarEmail(form.buyer_email)) { setError("Ingresa un email valido para que los proveedores puedan contactarte"); return; }
    }

    setGuardando(true);
    const { error: err } = await supabase.from("requests").insert({
      buyer_email: emailFinal,
      buyer_name: nombreFinal,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.toLowerCase(),
      quantity: form.quantity.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      budget: form.budget.trim(),
      required_date: form.required_date.trim(),
      status: "active",
    });

    if (err) {
      setGuardando(false);
      setError("No pudimos publicar tu solicitud. Intenta de nuevo en un momento.");
      return;
    }

    setGuardando(false);
    setYaPublicado(true);
    setPublicado(true);
    cargarSolicitudes();
  };

  const tiempoAtras = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    if (horas < 1) return "hace menos de 1h";
    if (horas < 24) return `hace ${horas}h`;
    return `hace ${dias}d`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-black text-white px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Red comercial B2B</div>
            <h1 className="text-2xl md:text-4xl font-black mb-1">Solicitudes de compra</h1>
            <p className="text-gray-400 text-sm">Compradores buscando proveedores ahora mismo</p>
          </div>
          <button onClick={() => { setMostrarForm(!mostrarForm); setPublicado(false); setError(""); }} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 md:px-6 py-2 md:py-3 rounded-xl transition-colors text-sm whitespace-nowrap">
            + Publicar
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">

        {mostrarForm && !publicado && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-8 mb-6">
            <h2 className="text-lg font-black text-black mb-4">Nueva solicitud</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Que necesitas? *</label>
                <input type="text" value={form.title} onChange={(e) => actualizar("title", e.target.value)} placeholder="Ej: Busco 50 alfombras" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} placeholder="Detalles adicionales..." rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Categoria *</label>
                  <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS.filter(c => c.value !== "todas").map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Cantidad</label>
                  <input type="text" value={form.quantity} onChange={(e) => actualizar("quantity", e.target.value)} placeholder="Ej: 100 unidades" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Ciudad</label>
                  <input type="text" value={form.city} onChange={(e) => actualizar("city", e.target.value)} placeholder="Ej: Buenos Aires" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Presupuesto</label>
                  <input type="text" value={form.budget} onChange={(e) => actualizar("budget", e.target.value)} placeholder="Ej: $50.000" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>

              {!session?.user?.email && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-bold mb-3">Para que los proveedores puedan contactarte, dejanos tus datos:</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Tu nombre *</label>
                      <input type="text" value={form.buyer_name} onChange={(e) => actualizar("buyer_name", e.target.value)} placeholder="Ej: Juan Perez" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Tu email *</label>
                      <input type="email" value={form.buyer_email} onChange={(e) => actualizar("buyer_email", e.target.value)} placeholder="tu@email.com" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setMostrarForm(false); setError(""); }} disabled={guardando} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl hover:border-black transition-colors text-sm disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={publicar} disabled={guardando || yaPublicado} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                  {guardando ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Publicando...
                    </>
                  ) : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {publicado && (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-black text-black mb-1">Solicitud publicada</h3>
            <p className="text-gray-500 text-sm mb-4">Los proveedores van a poder ver tu solicitud y contactarte</p>
            <button onClick={() => {
              setMostrarForm(false);
              setPublicado(false);
              setYaPublicado(false);
              setForm({ title: "", description: "", category: "", quantity: "", city: "", province: "", budget: "", required_date: "", buyer_name: "", buyer_email: "" });
            }} className="bg-black text-white font-black px-6 py-2 rounded-xl text-sm">
              Ver solicitudes
            </button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIAS.map((cat) => (
            <button key={cat.value} onClick={() => setCategoriaFiltro(cat.value)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${categoriaFiltro === cat.value ? "bg-black text-white" : "bg-white border-2 border-gray-200 text-gray-600 hover:border-black"}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-lg font-black text-black mb-2">No hay solicitudes todavia</h2>
            <button onClick={() => setMostrarForm(true)} className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors text-sm">
              Publicar solicitud
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {solicitudes.map((s) => (
              <a key={s.id} href={"/solicitudes/" + s.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-black transition-all block">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full capitalize">{s.category}</span>
                      {s.required_date && <span className="text-xs bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-full">{s.required_date}</span>}
                    </div>
                    <h3 className="text-sm font-black text-black">{s.title}</h3>
                    {s.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <div className="text-xs text-gray-400">{tiempoAtras(s.created_at)}</div>
                    {s.proposals_count > 0 && (
                      <div className="text-xs bg-black text-white font-black px-2 py-0.5 rounded-full mt-1">{s.proposals_count} prop.</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {s.quantity && <span>📦 {s.quantity}</span>}
                  {s.city && <span>📍 {s.city}</span>}
                  {s.budget && <span>💰 {s.budget}</span>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}