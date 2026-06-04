"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut",
  "Cordoba", "Corrientes", "Entre Rios", "Formosa", "Jujuy",
  "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquen",
  "Rio Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucuman"
];

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
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const logoRef = useRef<HTMLInputElement>(null);
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
            email: data.email || "",
            min_order: data.min_order || "",
            shipping_info: data.shipping_info || "",
          });
          if (data.payment_methods) {
            setMetodosPago(data.payment_methods.split(", ").filter(Boolean));
          }
          setCargando(false);
        });
    }
  }, [status, session]);

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const togglePago = (metodo: string) => {
    setMetodosPago((prev) =>
      prev.includes(metodo) ? prev.filter((m) => m !== metodo) : [...prev, metodo]
    );
  };

  const subirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !proveedor) return;
    setSubiendoLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      await supabase.from("providers").update({ logo_url: data.url }).eq("id", proveedor.id);
      setProveedor((prev: any) => ({ ...prev, logo_url: data.url }));
    }
    setSubiendoLogo(false);
  };

  const guardar = async () => {
    if (!proveedor) return;
    setGuardando(true);
    await supabase.from("providers").update({
      company_name: form.company_name,
      description: form.description,
      category: form.category,
      province: form.province,
      city: form.city,
      whatsapp: form.whatsapp,
      instagram: form.instagram,
      email: form.email,
      min_order: form.min_order,
      payment_methods: metodosPago.join(", "),
      shipping_info: form.shipping_info,
      profile_score: calcularScore(),
    }).eq("id", proveedor.id);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const calcularScore = () => {
    let score = 0;
    if (form.company_name) score += 15;
    if (form.description) score += 20;
    if (form.category) score += 10;
    if (form.province) score += 10;
    if (form.whatsapp) score += 15;
    if (form.instagram) score += 5;
    if (form.min_order) score += 10;
    if (metodosPago.length > 0) score += 10;
    if (form.shipping_info) score += 5;
    if (proveedor?.logo_url) score += 10;
    return Math.min(score, 100);
  };

  if (cargando) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black">Editar perfil</h1>
            <p className="text-gray-500 text-sm mt-1">Completitud del perfil: <span className="font-black text-emerald-600">{calcularScore()}%</span></p>
          </div>
          <a href="/panel" className="text-gray-500 text-sm hover:text-black">Volver al panel</a>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 flex flex-col gap-6">

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">Logo de la empresa</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200">
                {proveedor?.logo_url ? (
                  <img src={proveedor.logo_url} alt="logo" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700">
                    {form.company_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <button onClick={() => logoRef.current?.click()} disabled={subiendoLogo} className="border-2 border-gray-200 text-gray-600 font-black px-4 py-2 rounded-xl text-sm hover:border-black transition-colors">
                {subiendoLogo ? "Subiendo..." : "Cambiar logo"}
              </button>
              <input ref={logoRef} type="file" accept="image/*" onChange={subirLogo} className="hidden"/>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Nombre de la empresa *</label>
            <input type="text" value={form.company_name} onChange={(e) => actualizar("company_name", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
            <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} rows={4} placeholder="Que vendés, cuantos anos de experiencia, quienes son tus clientes..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Categoria principal *</label>
              <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Provincia *</label>
              <select value={form.province} onChange={(e) => actualizar("province", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                <option value="">Seleccionar...</option>
                {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Ciudad o barrio</label>
            <input type="text" value={form.city} onChange={(e) => actualizar("city", e.target.value)} placeholder="Ej: Once, Flores, Centro..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">WhatsApp</label>
              <input type="text" value={form.whatsapp} onChange={(e) => actualizar("whatsapp", e.target.value)} placeholder="5491112345678" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              <p className="text-xs text-gray-400 mt-1">Sin espacios, con codigo de pais</p>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Instagram</label>
              <input type="text" value={form.instagram} onChange={(e) => actualizar("instagram", e.target.value)} placeholder="tuempresa (sin @)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Pedido minimo</label>
            <input type="text" value={form.min_order} onChange={(e) => actualizar("min_order", e.target.value)} placeholder="Ej: $50.000 o 10 unidades" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Formas de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.map((m) => (
                <button key={m} type="button" onClick={() => togglePago(m)} className={`py-2 px-4 rounded-xl text-sm font-bold border-2 text-left transition-colors ${metodosPago.includes(m) ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black"}`}>
                  {metodosPago.includes(m) ? "✓ " : ""}{m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Informacion de envios</label>
            <textarea value={form.shipping_info} onChange={(e) => actualizar("shipping_info", e.target.value)} rows={2} placeholder="Ej: Envios a todo el pais por Andreani. Retiro en local disponible." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
          </div>

          <button onClick={guardar} disabled={guardando} className={`w-full font-black py-4 rounded-xl transition-colors ${guardado ? "bg-emerald-500 text-black" : "bg-black text-white hover:bg-emerald-600"}`}>
            {guardado ? "Guardado correctamente" : guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}