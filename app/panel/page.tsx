"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Panel() {
  const { data: session, status } = useSession();
  const [proveedor, setProveedor] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated" && session?.user?.email) {
      supabase.from("providers").select("*").eq("email", session.user.email).single()
        .then(({ data }) => { setProveedor(data); setCargando(false); });
    }
  }, [status, session]);

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

  if (status === "loading" || cargando) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white font-bold">Cargando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <a href="/" className="text-2xl font-black text-white tracking-tight block">MayorLink</a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{session?.user?.email}</span>
          <button onClick={() => signOut()} className="text-gray-400 text-sm hover:text-white">Salir</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-black mb-8">Mi panel</h1>

        {!proveedor ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🏪</div>
            <h2 className="text-xl font-black text-black mb-2">Todavia no publicaste tu empresa</h2>
            <p className="text-gray-500 text-sm mb-6">Registra tu empresa y empieza a recibir consultas de comerciantes</p>
            <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl transition-colors">
              Publicar mi empresa gratis
            </a>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-emerald-500">{proveedor.views_count || 0}</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Visitas al perfil</div>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-black">{proveedor.profile_score || 0}%</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Perfil completado</div>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center">
                <div className="text-2xl font-black text-amber-500">{proveedor.is_founder ? "Fundador" : "Activo"}</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Estado</div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-black uppercase tracking-tight">Tu perfil</h2>
                <a href={"/proveedores/" + proveedor.slug} target="_blank" className="text-emerald-600 text-sm font-bold hover:underline">Ver perfil publico</a>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {proveedor.logo_url ? (
                    <img src={proveedor.logo_url} alt="logo" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"/>
                  ) : (
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-xl font-black text-emerald-700">
                      {proveedor.company_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <button onClick={() => logoRef.current?.click()} disabled={subiendoLogo} className="absolute -bottom-2 -right-2 w-7 h-7 bg-black text-white rounded-full text-xs flex items-center justify-center hover:bg-emerald-600 transition-colors">
                    {subiendoLogo ? "..." : "+"}
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" onChange={subirLogo} className="hidden"/>
                </div>
                <div>
                  <div className="font-black text-black text-lg">{proveedor.company_name}</div>
                  <div className="text-sm text-gray-400">{proveedor.city ? proveedor.city + ", " : ""}{proveedor.province}</div>
                  <div className="text-sm text-gray-400">{proveedor.email}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <a href="/mis-productos" className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-black transition-all text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="font-black text-black">Mis productos</div>
                <div className="text-xs text-gray-400 mt-1">Gestioná tu catalogo</div>
              </a>
              <a href={"/proveedores/" + proveedor.slug} target="_blank" className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-black transition-all text-center">
                <div className="text-3xl mb-2">👁</div>
                <div className="font-black text-black">Ver mi perfil</div>
                <div className="text-xs text-gray-400 mt-1">Como lo ven los compradores</div>
              </a>
            </div>

            <div className="flex gap-3">
              <a href="/registro-proveedor" className="border-2 border-black text-black font-black px-6 py-3 rounded-xl hover:bg-black hover:text-white transition-colors text-sm">
                Editar informacion
              </a>
              <button onClick={() => {
                const url = window.location.origin + "/proveedores/" + proveedor.slug;
                navigator.clipboard.writeText(url);
                alert("Link copiado: " + url);
              }} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors text-sm">
                Copiar link de mi perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}