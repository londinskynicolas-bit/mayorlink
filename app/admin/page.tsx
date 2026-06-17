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
  const [tab, setTab] = useState<"proveedores" | "solicitudes" | "compradores">("proveedores");
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [compradores, setCompradores] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [editando, setEditando] = useState<string | null>(null);
  const [formEdit, setFormEdit] = useState<any>({});

  useEffect(() => {
    if (status === "unauthenticated") { window.location.href = "/"; return; }
    if (status === "authenticated") {
      if (!EMAILS_AUTORIZADOS.includes(session?.user?.email || "")) {
        window.location.href = "/";
        return;
      }
      cargarTodo();
    }
  }, [status, session]);

  const cargarTodo = async () => {
    const [{ data: provs }, { data: buyers }, { data: reqs }] = await Promise.all([
      supabase.from("providers").select("*").order("created_at", { ascending: false }),
      supabase.from("buyers").select("*").order("created_at", { ascending: false }),
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
    ]);
    setProveedores(provs || []);
    setCompradores(buyers || []);
    setSolicitudes(reqs || []);
    setCargando(false);
  };

  const toggleFounder = async (id: string, actual: boolean) => {
    await supabase.from("providers").update({ is_founder: !actual }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, is_founder: !actual } : p));
  };

  const toggleVerified = async (id: string, actual: boolean) => {
    await supabase.from("providers").update({ is_verified: !actual }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, is_verified: !actual } : p));
  };

  const toggleActivo = async (id: string, actual: string) => {
    const nuevoEstado = actual === "active" ? "inactive" : "active";
    await supabase.from("providers").update({ status: nuevoEstado }).eq("id", id);
    setProveedores((prev) => prev.map((p) => p.id === id ? { ...p, status: nuevoEstado } : p));
  };

  const eliminarProveedor = async (id: string, nombre: string) => {
    if (!confirm(`Eliminar permanentemente a "${nombre}"? Esta accion no se puede deshacer.`)) return;
    await supabase.from("products").delete().eq("provider_id", id);
    await supabase.from("reviews").delete().eq("provider_id", id);
    await supabase.from("favorites").delete().eq("provider_id", id);
    await supabase.from("providers").delete().eq("id", id);
    setProveedores((prev) => prev.filter((p) => p.id !== id));
  };

  const abrirEdicion = (p: any) => {
    setEditando(p.id);
    setFormEdit({
      company_name: p.company_name || "",
      description: p.description || "",
      category: p.category || "",
      province: p.province || "",
      city: p.city || "",
      whatsapp: p.whatsapp || "",
      instagram: p.instagram || "",
      email: p.email || "",
      min_order: p.min_order || "",
    });
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    await supabase.from("providers").update(formEdit).eq("id", editando);
    setProveedores((prev) => prev.map((p) => p.id === editando ? { ...p, ...formEdit } : p));
    setEditando(null);
  };

  const proveedoresFiltrados = proveedores.filter((p) => {
    const matchBusqueda = p.company_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.province?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "todos" ||
      (filtroEstado === "activos" && p.status === "active") ||
      (filtroEstado === "inactivos" && p.status !== "active");
    return matchBusqueda && matchEstado;
  });

  if (status === "loading" || cargando) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white font-bold">Cargando...</div></div>;
  }

  const totalVisitas = proveedores.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalClicksWA = proveedores.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);
  const solicitudesActivas = solicitudes.filter(s => s.status === "active").length;
  const proveedoresActivos = proveedores.filter(p => p.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Panel exclusivo</div>
          <a href="/" className="text-xl md:text-2xl font-black text-white tracking-tight block">MayorLink Admin</a>
        </div>
        <a href="/busqueda" className="text-gray-400 text-sm hover:text-white">Ver plataforma</a>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-black text-black mb-6">Panel de administracion</h1>

        <div className="grid grid-cols-3 md:grid-cols-7 gap-2 md:gap-3 mb-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-emerald-500">{proveedores.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Proveedores</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-emerald-600">{proveedoresActivos}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Activos</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-blue-500">{compradores.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Compradores</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-purple-500">{solicitudes.length}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Solicitudes</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-amber-500">{solicitudesActivas}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Activas</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-emerald-500">{totalVisitas}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Visitas</div>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 text-center">
            <div className="text-xl md:text-2xl font-black text-green-500">{totalClicksWA}</div>
            <div className="text-xs font-black text-gray-400 uppercase">Clicks WA</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(["proveedores", "solicitudes", "compradores"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 rounded-xl text-sm font-black capitalize transition-colors " + (tab === t ? "bg-black text-white" : "bg-white border-2 border-gray-200 text-gray-600")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "proveedores" && (
          <div>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, email o provincia..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black"
              />
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black">
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              {proveedoresFiltrados.length === 0 ? (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-10 text-center text-gray-400 font-bold">
                  No hay proveedores que coincidan con la busqueda
                </div>
              ) : (
                proveedoresFiltrados.map((p) => (
                  <div key={p.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4">
                    {editando === p.id ? (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input value={formEdit.company_name} onChange={(e) => setFormEdit({...formEdit, company_name: e.target.value})} placeholder="Nombre empresa" className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"/>
                          <input value={formEdit.category} onChange={(e) => setFormEdit({...formEdit, category: e.target.value})} placeholder="Categoria" className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"/>
                          <input value={formEdit.province} onChange={(e) => setFormEdit({...formEdit, province: e.target.value})} placeholder="Provincia" className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"/>
                          <input value={formEdit.city} onChange={(e) => setFormEdit({...formEdit, city: e.target.value})} placeholder="Ciudad" className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"/>
                          <input value={formEdit.whatsapp} onChange={(e) => setFormEdit({...formEdit, whatsapp: e.target.value})} placeholder="WhatsApp" className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"/>
                          <input value={formEdit.email} onChange={(e) => setFormEdit({...formEdit, email: e.target.value})} placeholder="Email" className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"/>
                        </div>
                        <textarea value={formEdit.description} onChange={(e) => setFormEdit({...formEdit, description: e.target.value})} placeholder="Descripcion" rows={2} className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"/>
                        <div className="flex gap-2">
                          <button onClick={() => setEditando(null)} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-2 rounded-xl text-sm">Cancelar</button>
                          <button onClick={guardarEdicion} className="flex-1 bg-emerald-500 text-black font-black py-2 rounded-xl text-sm">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={"text-xs font-black px-2 py-0.5 rounded-full " + (p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500")}>
                              {p.status === "active" ? "Activo" : "Inactivo"}
                            </span>
                            {p.is_founder && <span className="text-xs bg-amber-100 text-amber-700 font-black px-2 py-0.5 rounded-full">Fundador</span>}
                            {p.is_verified && <span className="text-xs bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full">Verificado</span>}
                          </div>
                          <div className="font-black text-black">{p.company_name}</div>
                          <div className="text-xs text-gray-400">{p.email} · {p.whatsapp}</div>
                          <div className="text-xs text-gray-400">{p.city ? p.city + ", " : ""}{p.province} · {p.category}</div>
                          <div className="text-xs text-gray-500 mt-1">{p.views_count || 0} visitas · {p.whatsapp_clicks || 0} clicks WA</div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => toggleFounder(p.id, p.is_founder)} className={"px-3 py-1.5 rounded-xl text-xs font-black transition-colors " + (p.is_founder ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-amber-100")}>
                            {p.is_founder ? "Quitar Fundador" : "Hacer Fundador"}
                          </button>
                          <button onClick={() => toggleVerified(p.id, p.is_verified)} className={"px-3 py-1.5 rounded-xl text-xs font-black transition-colors " + (p.is_verified ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-blue-100")}>
                            {p.is_verified ? "Quitar Verificado" : "Verificar"}
                          </button>
                          <button onClick={() => toggleActivo(p.id, p.status)} className={"px-3 py-1.5 rounded-xl text-xs font-black transition-colors " + (p.status === "active" ? "bg-gray-200 text-gray-600 hover:bg-red-100" : "bg-emerald-100 text-emerald-700")}>
                            {p.status === "active" ? "Desactivar" : "Activar"}
                          </button>
                          <button onClick={() => abrirEdicion(p)} className="px-3 py-1.5 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200">
                            Editar
                          </button>
                          <a href={"/proveedores/" + p.slug} target="_blank" className="px-3 py-1.5 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200">
                            Ver perfil
                          </a>
                          <button onClick={() => eliminarProveedor(p.id, p.company_name)} className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-600 hover:bg-red-100">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "solicitudes" && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase">Solicitud</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase">Comprador</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase">Categoria</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-400 uppercase">Propuestas</th>
                    <th className="text-center px-4 py-3 text-xs font-black text-gray-400 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm font-black text-black">{s.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.buyer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{s.category}</td>
                      <td className="px-4 py-3 text-center font-black text-emerald-600">{s.proposals_count || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={"text-xs font-black px-2 py-1 rounded-full " + (s.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                          {s.status === "active" ? "Activa" : "Resuelta"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "compradores" && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase">Tipo negocio</th>
                  </tr>
                </thead>
                <tbody>
                  {compradores.map((b) => (
                    <tr key={b.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm font-black text-black">{b.name || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.business_type || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}