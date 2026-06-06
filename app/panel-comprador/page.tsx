"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession, signOut } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PanelComprador() {
  const { data: session, status } = useSession();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated" && session?.user?.email) {
      Promise.all([
        supabase.from("requests").select("*").eq("buyer_email", session.user.email).order("created_at", { ascending: false }),
        supabase.from("favorites").select("provider_slug").eq("buyer_email", session.user.email)
      ]).then(async ([{ data: reqs }, { data: favs }]) => {
        setSolicitudes(reqs || []);
        if (favs && favs.length > 0) {
          const slugs = favs.map(f => f.provider_slug);
          const { data: provs } = await supabase.from("providers").select("*").in("slug", slugs);
          setFavoritos(provs || []);
        }
        setCargando(false);
      });
    }
  }, [status, session]);

  const activas = solicitudes.filter(s => s.status === "active");
  const resueltas = solicitudes.filter(s => s.status === "resolved");

  if (status === "loading" || cargando) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white font-bold">Cargando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-4 md:px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <a href="/" className="text-xl font-black text-white tracking-tight block">MayorLink</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/panel" className="text-emerald-400 text-xs font-bold hover:underline hidden md:block">Panel proveedor</a>
          <button onClick={() => signOut()} className="text-gray-400 text-sm hover:text-white">Salir</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-black">Mi panel</h1>
          <a href="/solicitudes" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl text-sm transition-colors">
            + Solicitud
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-500">{activas.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Activas</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-black">{solicitudes.reduce((acc, s) => acc + (s.proposals_count || 0), 0)}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Propuestas</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-500">{favoritos.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Favoritos</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-gray-400">{resueltas.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Resueltas</div>
          </div>
        </div>

        {favoritos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-black text-black uppercase tracking-tight mb-3">Proveedores guardados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {favoritos.map((p) => (
                <a key={p.id} href={"/proveedores/" + p.slug} className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-black transition-all flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt="logo" className="w-full h-full object-cover"/>
                    ) : (
                      <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-sm font-black text-emerald-700">
                        {p.company_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-black text-sm truncate">{p.company_name}</div>
                    <div className="text-xs text-gray-400 capitalize truncate">{p.category} · {p.province}</div>
                  </div>
                  <span className="text-yellow-400">❤️</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {solicitudes.length === 0 ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-lg font-black text-black mb-2">Todavia no publicaste solicitudes</h2>
            <p className="text-gray-500 text-sm mb-4">Publica lo que necesitas y recibe propuestas</p>
            <a href="/solicitudes" className="inline-block bg-emerald-500 text-black font-black px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors text-sm">
              Publicar primera solicitud
            </a>
          </div>
        ) : (
          <div>
            {activas.length > 0 && (
              <div className="mb-6">
                <h2 className="text-base font-black text-black uppercase tracking-tight mb-3">Solicitudes activas</h2>
                <div className="flex flex-col gap-3">
                  {activas.map((s) => (
                    <a key={s.id} href={"/solicitudes/" + s.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:border-black transition-all block">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full capitalize mr-2">{s.category}</span>
                          <span className="font-black text-black text-sm">{s.title}</span>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <div className="text-lg font-black text-emerald-500">{s.proposals_count || 0}</div>
                          <div className="text-xs text-gray-400">prop.</div>
                        </div>
                      </div>
                      {s.city && <div className="text-xs text-gray-400 mt-1">📍 {s.city}</div>}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {resueltas.length > 0 && (
              <div>
                <h2 className="text-base font-black text-black uppercase tracking-tight mb-3">Resueltas</h2>
                <div className="flex flex-col gap-2">
                  {resueltas.map((s) => (
                    <div key={s.id} className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-black text-sm truncate">{s.title}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0">Resuelta</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}