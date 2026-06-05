"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { data: session } = useSession();
  const [busqueda, setBusqueda] = useState("");
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [esProveedor, setEsProveedor] = useState(false);

  useEffect(() => {
    supabase.from("providers").select("*").eq("status", "active").limit(4)
      .then(({ data }) => setProveedores(data || []));
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      supabase.from("providers").select("id").eq("email", session.user.email).single()
        .then(({ data }) => setEsProveedor(!!data));
    }
  }, [session]);

  const buscar = () => {
    if (busqueda.trim()) {
      window.location.href = "/busqueda?q=" + encodeURIComponent(busqueda);
    } else {
      window.location.href = "/busqueda";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-black text-white px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">Venta mayorista B2B en Argentina</div>
          <h1 className="text-6xl font-black leading-none mb-4 tracking-tight">
            Encontra proveedores<br />
            <span className="text-emerald-400">mayoristas</span><br />
            en todo el pais
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl">
            Busca por producto, rubro o provincia. Compara condiciones y contacta directo por WhatsApp.
          </p>
          <div className="flex gap-0 max-w-2xl bg-white rounded-xl overflow-hidden">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
              placeholder="Que producto buscas? Ej: indumentaria, electronica..."
              className="flex-1 px-5 py-4 text-gray-900 text-sm focus:outline-none"
            />
            <button onClick={buscar} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 text-sm transition-colors">
              Buscar
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            {["indumentaria", "electronica", "cosmetica", "ferreteria", "calzado"].map((t) => (
              <button key={t} onClick={() => { setBusqueda(t); window.location.href = "/busqueda?q=" + t; }} className="text-xs text-gray-500 hover:text-emerald-400 transition-colors underline">
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-500 px-6 py-5">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
          {[
            { num: "10.000+", label: "Proveedores" },
            { num: "50.000+", label: "Compradores" },
            { num: "20", label: "Categorias" },
            { num: "100%", label: "Gratis para buscar" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-black">{s.num}</div>
              <div className="text-xs font-bold text-black opacity-60 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Categorias</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { nombre: "Indumentaria", emoji: "👕" },
              { nombre: "Electronica", emoji: "📱" },
              { nombre: "Alimentos", emoji: "🥗" },
              { nombre: "Ferreteria", emoji: "🔧" },
              { nombre: "Cosmetica", emoji: "💄" },
              { nombre: "Hogar", emoji: "🛋️" },
              { nombre: "Deportes", emoji: "⚽" },
              { nombre: "Calzado", emoji: "👟" },
            ].map((cat) => (
              <a key={cat.nombre} href={"/busqueda?q=" + cat.nombre.toLowerCase()} className="bg-white border-2 border-gray-100 rounded-xl p-4 text-center hover:border-black transition-all cursor-pointer">
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="text-sm font-black text-black">{cat.nombre}</div>
                <div className="text-xs text-emerald-600 font-bold mt-1">Ver proveedores</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-black uppercase tracking-tight">Proveedores destacados</h2>
            <a href="/busqueda" className="text-emerald-600 text-sm font-black hover:underline">Ver todos</a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {proveedores.map((p) => (
              <div key={p.id} className="border-2 border-gray-100 rounded-2xl p-5 hover:border-black transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="logo" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-base font-black text-emerald-700">
                          {p.company_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-black text-sm">{p.company_name}</div>
                      <div className="text-xs text-gray-400">{p.city ? p.city + ", " : ""}{p.province}</div>
                    </div>
                  </div>
                  {p.is_founder && <span className="text-xs bg-amber-100 text-amber-700 font-black px-2 py-1 rounded-full">Fundador</span>}
                </div>
                {p.min_order && (
                  <div className="text-xs mb-3">
                    Pedido minimo: <span className="font-black text-emerald-600">{p.min_order}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {p.whatsapp && (
                    <a href={"https://wa.me/" + p.whatsapp} target="_blank" className="flex-1 bg-emerald-500 text-black font-black text-xs py-2 rounded-xl text-center hover:bg-emerald-400 transition-colors">
                      WhatsApp
                    </a>
                  )}
                  <a href={"/proveedores/" + p.slug} className="flex-1 border-2 border-black text-black font-black text-xs py-2 rounded-xl text-center hover:bg-black hover:text-white transition-colors">
                    Ver perfil
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-3">Sos proveedor mayorista?</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {session && esProveedor
            ? "Gestioná tu empresa, productos y solicitudes desde tu panel."
            : "Publica tu empresa gratis y empieza a recibir consultas de comerciantes de todo el pais."}
        </p>
        {session && esProveedor ? (
          <a href="/panel" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl text-lg transition-colors">
            Ir a mi panel
          </a>
        ) : (
          <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl text-lg transition-colors">
            Publicar mi empresa gratis
          </a>
        )}
        {!session && (
          <p className="text-gray-600 text-xs mt-4">Los primeros 100 proveedores obtienen el badge de Fundador permanente</p>
        )}
      </section>
    </div>
  );
}