"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession, signIn } from "next-auth/react";
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

const PEDIDO_MINIMO_PRECIO = [
  "Sin minimo", "$10.000", "$25.000", "$50.000",
  "$100.000", "$250.000", "$500.000", "A convenir"
];

const PEDIDO_MINIMO_CANTIDAD = [
  "Sin minimo", "1 unidad", "3 unidades", "6 unidades",
  "12 unidades", "24 unidades", "48 unidades", "A convenir"
];

function generarSlug(nombre: string) {
  const base = nombre.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 50);
  const sufijo = Math.random().toString(36).slice(2, 6);
  return base + "-" + sufijo;
}

function validarWhatsApp(numero: string) {
  const limpio = numero.replace(/\s|-/g, "");
  return /^54\d{10,11}$/.test(limpio);
}

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegistroProveedor() {
  const { data: session } = useSession();
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [yaEnviado, setYaEnviado] = useState(false);
  const [error, setError] = useState("");
  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [form, setForm] = useState({
    company_name: "", description: "", category: "",
    whatsapp: "", instagram: "", email: "",
    min_order_price: "", min_order_qty: "", shipping_info: "",
  });

  const ciudades = provinciaSeleccionada ? (CIUDADES_POR_PROVINCIA[provinciaSeleccionada] || []) : [];

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const togglePago = (metodo: string) => {
    setMetodosPago((prev) =>
      prev.includes(metodo) ? prev.filter((m) => m !== metodo) : [...prev, metodo]
    );
  };

  const siguiente = () => {
    if (paso === 1) {
      if (!form.company_name.trim()) { setError("El nombre de la empresa es obligatorio"); return; }
      if (!provinciaSeleccionada) { setError("Selecciona tu provincia"); return; }
    }
    if (paso === 2) {
      if (form.whatsapp && !validarWhatsApp(form.whatsapp)) {
        setError("El WhatsApp debe tener el formato 54 + codigo de area + numero, sin espacios. Ej: 5491112345678");
        return;
      }
      if (!session?.user?.email && !validarEmail(form.email)) {
        setError("Ingresa un email valido");
        return;
      }
    }
    setError("");
    setPaso(paso + 1);
  };

  const enviar = async () => {
    if (yaEnviado || cargando) return;
    if (form.whatsapp && !validarWhatsApp(form.whatsapp)) {
      setError("El WhatsApp tiene un formato invalido. Volve al paso 2 y revisalo.");
      return;
    }
    setCargando(true);
    setError("");
    const slug = generarSlug(form.company_name);
    const emailFinal = session?.user?.email || form.email;
    const minOrder = [form.min_order_price, form.min_order_qty].filter(Boolean).join(" / ");

    const { error: err } = await supabase.from("providers").insert({
      slug,
      company_name: form.company_name.trim(),
      description: form.description.trim(),
      category: form.category.toLowerCase(),
      province: provinciaSeleccionada,
      city: ciudadSeleccionada,
      whatsapp: form.whatsapp.replace(/\s|-/g, ""),
      instagram: form.instagram.trim(),
      email: emailFinal,
      min_order: minOrder,
      payment_methods: metodosPago.join(", "),
      shipping_info: form.shipping_info.trim(),
      status: "active",
      profile_score: 60,
    });

    if (err) {
      setCargando(false);
      setError("No pudimos guardar tu empresa. Revisa los datos e intenta de nuevo. Si el problema persiste, contactanos.");
      return;
    }

    setYaEnviado(true);
    window.location.href = "/gracias?slug=" + slug;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-4 md:px-6 py-4 flex items-center justify-between">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-xl font-black text-white tracking-tight">MayorLink</div>
        </a>
        <a href="/bienvenida" className="text-gray-400 text-sm hover:text-white">Volver</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black mb-1">Publica tu empresa gratis</h1>
          <p className="text-gray-500 text-sm">Los primeros 100 proveedores obtienen el badge de Fundador</p>
          {session?.user?.email && (
            <p className="text-emerald-600 text-xs font-bold mt-1">Registrando como: {session.user.email}</p>
          )}
        </div>

        <div className="flex gap-2 mb-6 items-center">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-black " + (paso >= n ? "bg-black text-white" : "bg-gray-200 text-gray-400")}>
                {n}
              </div>
              <span className="text-xs text-gray-400 hidden sm:block">{n === 1 ? "Empresa" : n === 2 ? "Contacto" : "Condiciones"}</span>
              {n < 3 && <div className="w-6 h-px bg-gray-200"/>}
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-8">
          {paso === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-black">Datos de tu empresa</h2>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nombre *</label>
                <input type="text" value={form.company_name} onChange={(e) => actualizar("company_name", e.target.value)} placeholder="Ej: Textil Central" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} placeholder="Que vendés, anos de experiencia..." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Categoria</label>
                <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Provincia *</label>
                <select
                  value={provinciaSeleccionada}
                  onChange={(e) => { setProvinciaSeleccionada(e.target.value); setCiudadSeleccionada(""); }}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black"
                >
                  <option value="">Seleccionar provincia...</option>
                  {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {provinciaSeleccionada && ciudades.length > 0 && (
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Ciudad</label>
                  <select
                    value={ciudadSeleccionada}
                    onChange={(e) => setCiudadSeleccionada(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black"
                  >
                    <option value="">Seleccionar ciudad...</option>
                    {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-black">Datos de contacto</h2>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => actualizar("whatsapp", e.target.value)} placeholder="5491112345678" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                <p className="text-xs text-gray-400 mt-1">Sin espacios, empieza con 54 + codigo de area + numero</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Instagram</label>
                <input type="text" value={form.instagram} onChange={(e) => actualizar("instagram", e.target.value)} placeholder="tuempresa (sin @)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              {!session?.user?.email && (
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => actualizar("email", e.target.value)} placeholder="contacto@tuempresa.com" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              )}
              {!session && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <p className="text-sm text-emerald-800 font-bold mb-2">Conecta con Google para gestionar tu perfil</p>
                  <button onClick={() => signIn("google")} className="bg-black text-white font-black px-4 py-2 rounded-xl text-sm">Conectar con Google</button>
                </div>
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-black">Condiciones mayoristas</h2>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Pedido minimo por precio</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PEDIDO_MINIMO_PRECIO.map((op) => (
                    <button key={op} type="button" onClick={() => actualizar("min_order_price", op)} className={"py-2 px-2 rounded-xl text-xs font-bold border-2 transition-colors " + (form.min_order_price === op ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black")}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Pedido minimo por cantidad</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PEDIDO_MINIMO_CANTIDAD.map((op) => (
                    <button key={op} type="button" onClick={() => actualizar("min_order_qty", op)} className={"py-2 px-2 rounded-xl text-xs font-bold border-2 transition-colors " + (form.min_order_qty === op ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black")}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Formas de pago</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {METODOS_PAGO.map((m) => (
                    <button key={m} type="button" onClick={() => togglePago(m)} className={"py-2 px-4 rounded-xl text-sm font-bold border-2 text-left transition-colors " + (metodosPago.includes(m) ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black")}>
                      {metodosPago.includes(m) ? "✓ " : ""}{m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Informacion de envios</label>
                <textarea value={form.shipping_info} onChange={(e) => actualizar("shipping_info", e.target.value)} placeholder="Ej: Envios a todo el pais por Andreani." rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
          )}

          <div className="flex gap-3 mt-6">
            {paso > 1 && (
              <button onClick={() => { setPaso(paso - 1); setError(""); }} disabled={cargando} className="flex-1 border-2 border-black text-black font-black py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm disabled:opacity-50">
                Atras
              </button>
            )}
            {paso < 3 ? (
              <button onClick={siguiente} className="flex-1 bg-black text-white font-black py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm">
                Continuar
              </button>
            ) : (
              <button onClick={enviar} disabled={cargando || yaEnviado} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                {cargando ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Publicando...
                  </>
                ) : "Publicar gratis"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}