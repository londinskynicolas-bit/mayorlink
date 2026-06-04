"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession, signIn } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIAS = [
  { nombre: "Indumentaria", emoji: "👕" },
  { nombre: "Calzado", emoji: "👟" },
  { nombre: "Electronica", emoji: "📱" },
  { nombre: "Alimentos", emoji: "🥗" },
  { nombre: "Bebidas", emoji: "🥤" },
  { nombre: "Ferreteria", emoji: "🔧" },
  { nombre: "Cosmetica", emoji: "💄" },
  { nombre: "Hogar", emoji: "🛋️" },
  { nombre: "Deportes", emoji: "⚽" },
  { nombre: "Juguetes", emoji: "🧸" },
  { nombre: "Tecnologia", emoji: "💻" },
  { nombre: "Salud", emoji: "💊" },
];

const TIPO_NEGOCIO = [
  "Tienda fisica", "Tienda online", "Revendedor", "Emprendedor",
  "Distribuidor", "Importador", "Otro"
];

export default function RegistroComprador() {
  const { data: session } = useSession();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tipoNegocio, setTipoNegocio] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  const toggleCategoria = (cat: string) => {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const enviar = async () => {
    if (!session && !email) {
      alert("Ingresa tu email o conecta con Google");
      return;
    }
    setCargando(true);
    const emailFinal = session?.user?.email || email;
    const nombreFinal = session?.user?.name || nombre;
    await supabase.from("buyers").insert({
      email: emailFinal,
      name: nombreFinal,
      business_type: tipoNegocio,
      categories_interest: categorias,
      province: "",
    });
    setCargando(false);
    setListo(true);
  };

  if (listo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-black mb-2">Listo, ya estas adentro</h2>
          <p className="text-gray-500 text-sm mb-6">Te vamos a mostrar los mejores proveedores de tus categorias</p>
          <a href="/busqueda" className="block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl transition-colors">
            Explorar proveedores
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-6 py-4 flex items-center justify-between">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-2xl font-black text-white tracking-tight">MayorLink</div>
        </a>
        <a href="/bienvenida" className="text-gray-400 text-sm hover:text-white">Volver</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black mb-2">Crear mi cuenta de comprador</h1>
          <p className="text-gray-500">Gratis. Te mostramos los mejores proveedores segun tus intereses.</p>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 flex flex-col gap-6">

          {!session ? (
            <div>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-emerald-800 font-bold mb-2">Conecta con Google para una experiencia personalizada</p>
                <button onClick={() => signIn("google")} className="bg-black text-white font-black px-4 py-2 rounded-xl text-sm hover:bg-emerald-600 transition-colors">
                  Continuar con Google
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Tu nombre</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Garcia" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Tu email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@email.com" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              {session.user?.image && <img src={session.user.image} alt="foto" className="w-10 h-10 rounded-full"/>}
              <div>
                <div className="font-black text-black">{session.user?.name}</div>
                <div className="text-xs text-gray-500">{session.user?.email}</div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Tipo de negocio</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPO_NEGOCIO.map((t) => (
                <button key={t} type="button" onClick={() => setTipoNegocio(t)} className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-colors ${tipoNegocio === t ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Que categorias te interesan?</label>
            <p className="text-xs text-gray-400 mb-3">Selecciona todas las que apliquen — te mostraremos proveedores de esas categorias primero</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map((cat) => (
                <button key={cat.nombre} type="button" onClick={() => toggleCategoria(cat.nombre)} className={`py-3 px-3 rounded-xl text-xs font-bold border-2 transition-colors flex items-center gap-2 ${categorias.includes(cat.nombre) ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black"}`}>
                  <span>{cat.emoji}</span>
                  <span>{cat.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={enviar} disabled={cargando} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 text-lg">
            {cargando ? "Guardando..." : "Empezar a explorar proveedores"}
          </button>
        </div>
      </div>
    </div>
  );
}