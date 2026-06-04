"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Admin() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProveedores(data || []);
        setTotal(data?.length || 0);
        setCargando(false);
      });
  }, []);

  const toggleFounder = async (id: string, actual: boolean) => {
    await supabase.from("providers").update({ is_founder: !actual }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, is_founder: !actual } : p));
  };

  const toggleVerified = async (id: string, actual: boolean) => {
    await supabase.from("providers").update({ is_verified: !actual }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, is_verified: !actual } : p));
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-bold">Cargando...</div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-black">Panel de administracion</h1>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-4xl font-black text-emerald-500">{total}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Total proveedores</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-4xl font-black text-amber-500">{proveedores.filter(p => p.is_founder).length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Fundadores</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-4xl font-black text-blue-500">{proveedores.filter(p => p.is_verified).length}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Verificados</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center">
            <div className="text-4xl font-black text-black">{proveedores.reduce((acc, p) => acc + (p.views_count || 0), 0)}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide mt-1">Total visitas</div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-black uppercase tracking-tight">Todos los proveedores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Contacto</th>
                  <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Provincia</th>
                  <th className="text-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wide">Visitas</th>
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
                    <td className="px-6 py-4 text-sm text-gray-600">{p.city ? p.city + ", " : ""}{p.province}</td>
                    <td className="px-6 py-4 text-center font-black text-emerald-600">{p.views_count || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleFounder(p.id, p.is_founder)}
                        className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${p.is_founder ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-700"}`}
                      >
                        {p.is_founder ? "Fundador" : "No"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleVerified(p.id, p.is_verified)}
                        className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${p.is_verified ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-700"}`}
                      >
                        {p.is_verified ? "Verificado" : "No"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a href={"/proveedores/" + p.slug} target="_blank" className="text-emerald-600 text-xs font-bold hover:underline">
                        Ver
                      </a>
                    </td>
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