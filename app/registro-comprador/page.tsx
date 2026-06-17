"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession, signIn } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIAS = [
  "Indumentaria", "Calzado", "Electronica", "Alimentos", "Bebidas",
  "Ferreteria", "Cosmetica", "Hogar", "Deportes", "Juguetes",
  "Tecnologia", "Textil", "Otros"
];

const TIPOS_NEGOCIO = [
  "Tienda fisica", "E-commerce", "Revendedor", "Emprendimiento", "Mayorista", "Otro"
];

export default function RegistroComprador() {
  const { data: session } = useSession();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [categoriasInteres, setCategoriasInteres] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", business_type: "", email: "",
  });

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const toggleCategoria = (cat: string) => {
    setCategoriasInteres((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const enviar = async () => {
    if (!form.name) { setError("El nombre es obligatorio"); return; }
    setCargando(true);
    setError("");
    const emailFinal = session?.user?.email || form.email;
    const { error: err } = await supabase.from("buyers").insert({
      name: form.name,
      email: emailFinal,
      business_type: form.business_type,
      categories_interest: categoriasInteres,
    });
    setCargando(false);
    if (err) { setError("Hubo un error. Intenta de nuevo."); return; }
    window.location.href = "/panel-comprador";
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
          <h1 className="text-2xl font-black text-black mb-1">Registro de comprador</h1>
          <p className="text-gray-500 text-sm">Contanos un poco sobre tu negocio para mostrarte mejores resultados</p>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-8">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Tu nombre *</label>
              <input type="text" value={form.name} onChange={(e) => actualizar("name", e.target.value)} placeholder="Ej: Juan Perez" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Tipo de negocio</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIPOS_NEGOCIO.map((t) => (
                  <button key={t} type="button" onClick={() => actualizar("business_type", t)} className={"py-2 px-3 rounded-xl text-xs font-bold border-2 transition-colors " + (form.business_type === t ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Categorias de interes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIAS.map((c) => (
                  <button key={c} type="button" onClick={() => toggleCategoria(c)} className={"py-2 px-3 rounded-xl text-xs font-bold border-2 transition-colors " + (categoriasInteres.includes(c) ? "bg-emerald-500 text-black border-emerald-500" : "border-gray-200 text-gray-600 hover:border-black")}>
                    {categoriasInteres.includes(c) ? "✓ " : ""}{c}
                  </button>
                ))}
              </div>
            </div>

            {!session?.user?.email && (
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => actualizar("email", e.target.value)} placeholder="tu@email.com" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
            )}

            {!session && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800 font-bold mb-2">Conecta con Google para gestionar tu cuenta</p>
                <button onClick={() => signIn("google")} className="bg-black text-white font-black px-4 py-2 rounded-xl text-sm">
                  Conectar con Google
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
            )}

            <button onClick={enviar} disabled={cargando || !form.name} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {cargando ? "Guardando..." : "Empezar a buscar proveedores"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}