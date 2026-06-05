"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EMAILS_AUTORIZADOS = [
  "decoandhome61@gmail.com",
  "londinskynicolas@gmail.com",
];

export default function Admin() {
  const { data: session, status } = useSession();
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [compradores, setCompradores] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    }
    if (status === "authenticated") {
      if (!EMAILS_AUTORIZADOS.includes(session?.user?.email || "")) {
        window.location.href = "/";
        return;
      }
      Promise.all([
        supabase.from("providers").select("*").order("created_at", { ascending: false }),
        supabase.from("buyers").select("*").order("created_at", { ascending: false }),
        supabase.from("requests").select("*").order("created_at", { ascending: false }),
      ]).then(([{ data: provs }, { data: buyers }, { data: reqs }]) => {
        setProveedores(provs || []);
        setCompradores(buyers || []);
        setSolicitudes(reqs || []);
        setCargando(false);
      });
    }
  }, [status, session]);

  const toggleFounder = async (id: string, actual: boolean) => {
    await supabase.from("providers").update({ is_founder: !actual }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, is_founder: !actual } : p));
  };

  const toggleVerified = async (id: string, actual: boolean) => {
    await supabase.from("providers").update({ is_verified: !actual }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, is_verified: !actual } : p));
  };

  if (status === "loading" || cargando) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white font-bold">Cargando...</div></div>;
  }

  const totalVisitas = proveedores.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalClicksWA = proveedores.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
  const solicitudesActivas = solicitudes.filter(s => s.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Admin</div>
          <a href="/" className="text-2xl font-black text-white tracking-tight block">MayorLink</a>
        </div>
        <div className="flex gap-4">
          <a href="/busqueda" className="text-gray-400 text-sm hover:text-white">Ver plataforma</a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-black mb-8">Panel de administracion</h1>

        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-emerald-500">{proveedores.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Proveedores</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-blue-500">{compradores.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Compradores</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-purple-500">{solicitudes.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Solicitudes</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-amber-500">{solicitudesActivas}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Activas</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-emerald-500">{totalVisitas}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Visitas</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-green-500">{totalClicksWA}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Clicks WA</div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-black uppercase tracking-tight">Proveedores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Contacto</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Categoria</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Provincia</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Visitas</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">WA</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Fundador</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Verificado</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Perfil</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-black text-black">{p.company_name}</div>
                      <div className="text-xs text-gray-400">{p.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{p.email}</div>
                      <div className="text-xs text-gray-400">{p.whatsapp}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.category || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.city ? p.city + ", " : ""}{p.province}</td>
                    <td className="px-6 py-4 text-center font-black text-emerald-600">{p.views_count || 0}</td>
                    <td className="px-6 py-4 text-center font-black text-green-600">{p.whatsapp_clicks || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleFounder(p.id, p.is_founder)} className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${p.is_founder ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-700"}`}>
                        {p.is_founder ? "Fundador" : "No"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleVerified(p.id, p.is_verified)} className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${p.is_verified ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-700"}`}>
                        {p.is_verified ? "Verificado" : "No"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a href={"/proveedores/" + p.slug} target="_blank" className="text-emerald-600 text-xs font-bold hover:underline">Ver</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-black uppercase tracking-tight">Solicitudes activas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Solicitud</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Comprador</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Categoria</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Propuestas</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-black text-black text-sm">{s.title}</div>
                      {s.city && <div className="text-xs text-gray-400">📍 {s.city}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.buyer_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{s.category}</td>
                    <td className="px-6 py-4 text-center font-black text-emerald-600">{s.proposals_count || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.status === "active" ? "Activa" : "Resuelta"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-black uppercase tracking-tight">Compradores registrados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Tipo negocio</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Categorias</th>
                </tr>
              </thead>
              <tbody>
                {compradores.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-black text-black text-sm">{b.name || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.business_type || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.categories_interest?.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}