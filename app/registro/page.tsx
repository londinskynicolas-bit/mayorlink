"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generarSlug(nombre: string) {
  return nombre
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);
}

export default function Registro() {
  const { data: session } = useSession();
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    description: "",
    category: "",
    province: "",
    city: "",
    whatsapp: "",
    instagram: "",
    email: "",
    min_order: "",
    payment_methods: "",
    shipping_info: "",
  });

  const actualizar = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const siguiente = () => {
    if (paso === 1 && (!form.company_name || !form.province)) {
      setError("Nombre y provincia son obligatorios");
      return;
    }
    setError("");
    setPaso(paso + 1);
  };

  const enviar = async () => {
    setCargando(true);
    setError("");
    const slug = generarSlug(form.company_name);
    const emailFinal = session?.user?.email || form.email;
    const { error: err } = await supabase.from("providers").insert({
      slug,
      company_name: form.company_name,
      description: form.description,
      province: form.province,
      city: form.city,
      whatsapp: form.whatsapp,
      instagram: form.instagram,
      email: emailFinal,
      min_order: form.min_order,
      payment_methods: form.payment_methods,
      shipping_info: form.shipping_info,
      status: "active",
      profile_score: 50,
    });
    setCargando(false);
    if (err) {
      setError("Hubo un error al guardar. Intenta de nuevo.");
      return;
    }
    window.location.href = "/gracias?slug=" + slug;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-6 py-4 flex items-center justify-between">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-2xl font-black text-white tracking-tight">MayorLink</div>
        </a>
        <div className="text-sm text-gray-400">Registro de proveedor</div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black mb-2">Publica tu empresa gratis</h1>
          <p className="text-gray-500">Los primeros 100 proveedores obtienen el badge de Fundador permanente</p>
          {session?.user?.email && (
            <p className="text-emerald-600 text-sm font-bold mt-2">Registrando como: {session.user.email}</p>
          )}
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${paso >= n ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}>
                {n}
              </div>
              <span className="text-xs text-gray-400">{n === 1 ? "Tu empresa" : n === 2 ? "Contacto" : "Condiciones"}</span>
              {n < 3 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
          {paso === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-black mb-2">Datos de tu empresa</h2>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nombre de la empresa *</label>
                <input type="text" value={form.company_name} onChange={(e) => actualizar("company_name", e.target.value)} placeholder="Ej: Textil Central" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion de tu negocio</label>
                <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} placeholder="Que vendés, cuantos anos llevan, quienes son sus clientes..." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Categoria</label>
                  <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="">Seleccionar...</option>
                    <option>Indumentaria</option>
                    <option>Electronica</option>
                    <option>Alimentos</option>
                    <option>Ferreteria</option>
                    <option>Cosmetica</option>
                    <option>Hogar</option>
                    <option>Deportes</option>
                    <option>Calzado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Provincia *</label>
                  <select value={form.province} onChange={(e) => actualizar("province", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="">Seleccionar...</option>
                    <option>Buenos Aires</option>
                    <option>CABA</option>
                    <option>Cordoba</option>
                    <option>Santa Fe</option>
                    <option>Mendoza</option>
                    <option>Tucuman</option>
                    <option>Salta</option>
                    <option>Entre Rios</option>
                    <option>Neuquen</option>
                    <option>Rio Negro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Ciudad o barrio</label>
                <input type="text" value={form.city} onChange={(e) => actualizar("city", e.target.value)} placeholder="Ej: Once, Flores, Centro..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-black mb-2">Datos de contacto</h2>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => actualizar("whatsapp", e.target.value)} placeholder="Ej: 5491112345678" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                <p className="text-xs text-gray-400 mt-1">Sin espacios ni guiones, con codigo de pais</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Instagram</label>
                <input type="text" value={form.instagram} onChange={(e) => actualizar("instagram", e.target.value)} placeholder="tuempresa (sin @)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              {!session?.user?.email && (
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Email de contacto</label>
                  <input type="email" value={form.email} onChange={(e) => actualizar("email", e.target.value)} placeholder="contacto@tuempresa.com" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-black mb-2">Condiciones mayoristas</h2>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Pedido minimo</label>
                <input type="text" value={form.min_order} onChange={(e) => actualizar("min_order", e.target.value)} placeholder="Ej: $50.000 o 10 unidades" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Formas de pago</label>
                <input type="text" value={form.payment_methods} onChange={(e) => actualizar("payment_methods", e.target.value)} placeholder="Ej: Transferencia, efectivo, Mercado Pago" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Informacion de envios</label>
                <textarea value={form.shipping_info} onChange={(e) => actualizar("shipping_info", e.target.value)} placeholder="Ej: Envios a todo el pais por Andreani." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
          )}

          <div className="flex gap-3 mt-8">
            {paso > 1 && (
              <button onClick={() => setPaso(paso - 1)} className="flex-1 border-2 border-black text-black font-black py-3 rounded-xl hover:bg-gray-100 transition-colors">
                Atras
              </button>
            )}
            {paso < 3 ? (
              <button onClick={siguiente} className="flex-1 bg-black text-white font-black py-3 rounded-xl hover:bg-emerald-600 transition-colors">
                Continuar
              </button>
            ) : (
              <button onClick={enviar} disabled={cargando} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50">
                {cargando ? "Guardando..." : "Publicar mi empresa gratis"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}