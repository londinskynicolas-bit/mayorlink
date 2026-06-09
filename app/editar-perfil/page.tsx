"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import { PROVINCIAS_AR, CIUDADES_POR_PROVINCIA } from "../../hooks/useLocalidades";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIAS = [
  "Indumentaria", "Calzado", "Electronica", "Alimentos", "Bebidas",
  "Ferreteria", "Cosmetica", "Hogar", "Deportes", "Juguetes",
  "Tecnologia", "Textil", "Packaging", "Automotriz", "Agro",
  "Salud", "Libreria", "Otros"
];

const METODOS_PAGO = [
  "Transferencia bancaria", "Efectivo", "Mercado Pago",
  "Cheque", "Tarjeta de credito", "Cuenta corriente", "Cripto"
];

export default function EditarPerfil() {
  const { data: session, status } = useSession();
  const [proveedor, setProveedor] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [form, setForm] = useState({
    company_name: "", description: "", category: "", province: "",
    city: "", whatsapp: "", instagram: "", min_order: "",
    shipping_info: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated" && session?.user?.email) {
      supabase.from("providers").select("*").eq("email", session.user.email).single()
        .then(({ data }) => {
          if (!data) { window.location.href = "/registro-proveedor"; return; }
          setProveedor(data);
          setForm({
            company_name: data.company_name || "",
            description: data.description || "",
            category: data.category || "",
            province: data.province || "",
            city: data.city || "",
            whatsapp: data.whatsapp || "",
            instagram: data.instagram || "",
            min_order: data.min_order || "",
            shipping_info: data.shipping_info || "",
          });
          setMetodosPago(data.payment_methods ? data.payment_methods.split(", ") : []);
          if (data.province) {
            setCiudades(CIUDADES_POR_PROVINCIA[data.province] || []);
          }
        });
    }
  }, [status, session]);

  useEffect(() => {
    let s = 0;
    if (form.company_name) s += 15;
    if (form.description) s += 20;
    if (form.category) s += 10;
    if (form.province) s += 10;
    if (form.whatsapp) s += 15;
    if (form.instagram) s += 5;
    if (form.min_order) s += 10;
    if (metodosPago.length > 0) s += 10;
    if (form.shipping_info) s += 5;
    setScore(s);
  }, [form, metodosPago]);

  const actualizar = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (campo === "province") {
      setCiudades(CIUDADES_POR_PROVINCIA[valor] || []);
      setForm((prev) => ({ ...prev, province: valor, city: "" }));
    }
  };

  const togglePago = (metodo: string) => {
    setMetodosPago((prev) =>
      prev.includes(metodo) ? prev.filter((m) => m !== metodo) : [...prev, metodo]
    );
  };

  const guardar = async () => {
    if (!proveedor) return;
    setGuardando(true);
    await supabase.from("providers").update({
      company_name: form.company_name,
      description: form.description,
      category: form.category.toLowerCase(),
      province: form.province,
      city: form.city,
      whatsapp: form.whatsapp,
      instagram: form.instagram,
      min_order: form.min_order,
      payment_methods: metodosPago.join(", "),
      shipping_info: form.shipping_info,
      profile_score: score,
    }).eq("id", proveedor.id);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  if (status === "loading" || !proveedor) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-black">Editar perfil</h1>
            <p className="text-gray-500 text-sm mt-1">{proveedor.company_name}</p>
          </div>
          <a href="/panel" className="text-emerald-600 text-sm font-bold hover:underline">Volver al panel</a>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black text-black">Perfil completo</span>
            <span className={"text-sm font-black " + (score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500")}>{score}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={"h-2 rounded-full transition-all " + (score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500")} style={{width: score + "%"}}></div>
          </div>
          {score < 80 && (
            <p className="text-xs text-gray-500 mt-2">Completa tu perfil al 80% para aparecer primero en los resultados</p>
          )}
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-8 flex flex-col gap-5">

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Nombre de la empresa *</label>
            <input type="text" value={form.company_name} onChange={(e) => actualizar("company_name", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
            <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} rows={3} placeholder="Que vendés, años de experiencia, especialidad..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Categoria</label>
              <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Provincia</label>
              <select value={form.province} onChange={(e) => actualizar("province", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                <option value="">Seleccionar...</option>
                {PROVINCIAS_AR.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {ciudades.length > 0 && (
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Ciudad</label>
              <select value={form.city} onChange={(e) => actualizar("city", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                <option value="">Seleccionar ciudad...</option>
                {ciudades.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">WhatsApp</label>
              <input type="text" value={form.whatsapp} onChange={(e) => actualizar("whatsapp", e.target.value)} placeholder="5491112345678" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              <p className="text-xs text-gray-400 mt-1">Con codigo de pais (54)</p>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Instagram</label>
              <input type="text" value={form.instagram} onChange={(e) => actualizar("instagram", e.target.value)} placeholder="tuempresa (sin @)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Pedido minimo</label>
            <input type="text" value={form.min_order} onChange={(e) => actualizar("min_order", e.target.value)} placeholder="Ej: $50.000 o 12 unidades" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Formas de pago</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {METODOS_PAGO.map((m) => (
                <button key={m} type="button" onClick={() => togglePago(m)} className={"py-2 px-4 rounded-xl text-sm font-bold border-2 text-left transition-colors " + (metodosPago.includes(m) ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black")}>
                  {metodosPago.includes(m) ? "✓ " : ""}{m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Informacion de envios</label>
            <textarea value={form.shipping_info} onChange={(e) => actualizar("shipping_info", e.target.value)} rows={2} placeholder="Ej: Envios a todo el pais por Andreani." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
          </div>

          {guardado && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 text-center">
              <p className="text-emerald-700 font-black text-sm">Cambios guardados correctamente ✅</p>
            </div>
          )}

          <div className="flex gap-3">
            <a href="/panel" className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl text-sm text-center hover:border-black transition-colors">
              Cancelar
            </a>
            <button onClick={guardar} disabled={guardando} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}