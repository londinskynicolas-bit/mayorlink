"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MisProductos() {
  const { data: session, status } = useSession();
  const [proveedor, setProveedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_unit: "",
    price_dozen: "",
    price_box: "",
    category: "",
    material: "",
    measures: "",
    stock: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
    if (status === "authenticated" && session?.user?.email) {
      supabase
        .from("providers")
        .select("*")
        .eq("email", session.user.email)
        .single()
        .then(({ data }) => {
          setProveedor(data);
          if (data) {
            supabase
              .from("products")
              .select("*")
              .eq("provider_slug", data.slug)
              .order("created_at", { ascending: false })
              .then(({ data: prods }) => setProductos(prods || []));
          }
        });
    }
  }, [status, session]);

  const actualizar = (campo: string, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardarProducto = async () => {
    if (!form.name || !proveedor) return;
    setCargando(true);
    const { data, error } = await supabase.from("products").insert({
      provider_id: proveedor.id,
      provider_slug: proveedor.slug,
      name: form.name,
      description: form.description,
      price_unit: form.price_unit,
      price_dozen: form.price_dozen,
      price_box: form.price_box,
      category: form.category,
      material: form.material,
      measures: form.measures,
      stock: form.stock,
      status: "active",
    }).select().single();
    setCargando(false);
    if (!error && data) {
      setProductos((prev) => [data, ...prev]);
      setForm({ name: "", description: "", price_unit: "", price_dozen: "", price_box: "", category: "", material: "", measures: "", stock: "" });
      setMostrarForm(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;
  }

  if (!proveedor && status === "authenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-black text-black mb-4">Primero registra tu empresa</h2>
          <a href="/registro-proveedor" className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl">Registrar empresa</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-2xl font-black text-white tracking-tight">MayorLink</div>
        </a>
        <div className="flex items-center gap-4">
          <a href="/panel" className="text-gray-300 text-sm hover:text-white">Mi panel</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-black">Mis productos</h1>
            <p className="text-gray-500 text-sm mt-1">{proveedor?.company_name} · {productos.length} productos publicados</p>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors">
            + Agregar producto
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-black text-black mb-6">Nuevo producto</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nombre del producto *</label>
                <input type="text" value={form.name} onChange={(e) => actualizar("name", e.target.value)} placeholder="Ej: Remera basica manga corta" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} placeholder="Descripcion detallada del producto, caracteristicas, usos..." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Precio por unidad</label>
                  <input type="text" value={form.price_unit} onChange={(e) => actualizar("price_unit", e.target.value)} placeholder="Ej: $2.500" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Precio por docena</label>
                  <input type="text" value={form.price_dozen} onChange={(e) => actualizar("price_dozen", e.target.value)} placeholder="Ej: $25.000" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Precio por caja/bulto</label>
                  <input type="text" value={form.price_box} onChange={(e) => actualizar("price_box", e.target.value)} placeholder="Ej: $80.000" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Categoria</label>
                  <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                    <option value="">Seleccionar...</option>
                    <option>Indumentaria</option>
                    <option>Calzado</option>
                    <option>Electronica</option>
                    <option>Alimentos</option>
                    <option>Bebidas</option>
                    <option>Ferreteria</option>
                    <option>Cosmetica</option>
                    <option>Hogar</option>
                    <option>Deportes</option>
                    <option>Juguetes</option>
                    <option>Tecnologia</option>
                    <option>Otros</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Stock disponible</label>
                  <input type="text" value={form.stock} onChange={(e) => actualizar("stock", e.target.value)} placeholder="Ej: 500 unidades, stock permanente" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Material / Composicion</label>
                  <input type="text" value={form.material} onChange={(e) => actualizar("material", e.target.value)} placeholder="Ej: 100% algodon, poliester, cuero" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Medidas / Talles</label>
                  <input type="text" value={form.measures} onChange={(e) => actualizar("measures", e.target.value)} placeholder="Ej: S, M, L, XL o 36 al 46" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-800 mb-1">Fotos del producto</p>
                <p className="text-xs text-amber-600">La subida de fotos estara disponible en la proxima actualizacion. Por ahora carga la info del producto y despues agregamos las fotos.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMostrarForm(false)} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl hover:border-black transition-colors">
                  Cancelar
                </button>
                <button onClick={guardarProducto} disabled={cargando || !form.name} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50">
                  {cargando ? "Guardando..." : "Publicar producto"}
                </button>
              </div>
            </div>
          </div>
        )}

        {productos.length === 0 && !mostrarForm ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-black text-black mb-2">Todavia no publicaste productos</h2>
            <p className="text-gray-500 text-sm mb-6">Agrega tus productos para que los compradores puedan ver tu catalogo completo</p>
            <button onClick={() => setMostrarForm(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl transition-colors">
              Agregar primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {productos.map((p) => (
              <div key={p.id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-black transition-all">
                <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <span className="text-xs text-gray-400 font-bold">Sin fotos todavia</span>
                </div>
                <h3 className="font-black text-black mb-1">{p.name}</h3>
                {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2 flex-wrap mb-3">
                  {p.price_unit && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full">Unidad: {p.price_unit}</span>}
                  {p.price_dozen && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full">Docena: {p.price_dozen}</span>}
                  {p.price_box && <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded-full">Caja: {p.price_box}</span>}
                </div>
                <div className="flex gap-2 flex-wrap text-xs text-gray-400">
                  {p.material && <span>Material: {p.material}</span>}
                  {p.measures && <span>· Talles: {p.measures}</span>}
                  {p.stock && <span>· Stock: {p.stock}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}