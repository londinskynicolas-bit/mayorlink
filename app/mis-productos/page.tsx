"use client";
import { useState, useEffect, useRef } from "react";
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
  const [yaPublicado, setYaPublicado] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const [error, setError] = useState("");
  const [fotosProducto, setFotosProducto] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", description: "", price_unit: "", price_dozen: "",
    price_box: "", category: "", material: "", measures: "", stock: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated" && session?.user?.email) {
      supabase.from("providers").select("*").eq("email", session.user.email).single()
        .then(({ data }) => {
          setProveedor(data);
          if (data) {
            supabase.from("products").select("*").eq("provider_slug", data.slug)
              .order("created_at", { ascending: false })
              .then(({ data: prods }) => setProductos(prods || []));
          }
        });
    }
  }, [status, session]);

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorFoto("");

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 8) {
      setErrorFoto(`La imagen pesa ${sizeMB.toFixed(1)}MB. El maximo es 8MB. Proba con otra foto o reducila desde tu celular.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSubiendoFoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorFoto(data.error || "No pudimos subir la imagen. Intenta de nuevo.");
        setSubiendoFoto(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFotosProducto((prev) => [...prev, data.url]);
    } catch {
      setErrorFoto("Hubo un problema de conexion. Verifica tu internet e intenta de nuevo.");
    }
    setSubiendoFoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const guardarProducto = async () => {
    if (yaPublicado || cargando) return;
    setError("");
    if (!form.name.trim()) { setError("El nombre del producto es obligatorio"); return; }
    if (!proveedor) return;

    setCargando(true);
    const { data, error: err } = await supabase.from("products").insert({
      provider_id: proveedor.id,
      provider_slug: proveedor.slug,
      name: form.name.trim(),
      description: form.description.trim(),
      price_unit: form.price_unit.trim(),
      price_dozen: form.price_dozen.trim(),
      price_box: form.price_box.trim(),
      category: form.category,
      material: form.material.trim(),
      measures: form.measures.trim(),
      stock: form.stock.trim(),
      images: fotosProducto,
      status: "active",
    }).select().single();

    if (err) {
      setCargando(false);
      setError("No pudimos guardar el producto. Intenta de nuevo en un momento.");
      return;
    }

    setProductos((prev) => [data, ...prev]);
    setForm({ name: "", description: "", price_unit: "", price_dozen: "", price_box: "", category: "", material: "", measures: "", stock: "" });
    setFotosProducto([]);
    setCargando(false);
    setYaPublicado(true);
    setMostrarForm(false);
    setTimeout(() => setYaPublicado(false), 1500);
  };

  if (status === "loading") return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;

  if (!proveedor && status === "authenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-black text-black mb-4">Primero registra tu empresa</h2>
          <a href="/registro-proveedor" className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl text-sm">Registrar empresa</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-xl font-black text-white tracking-tight">MayorLink</div>
        </a>
        <div className="flex items-center gap-3">
          <a href="/panel" className="text-gray-300 text-sm hover:text-white">Mi panel</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-black">Mis productos</h1>
            <p className="text-gray-500 text-xs mt-1">{proveedor?.company_name} · {productos.length} publicados</p>
          </div>
          <button onClick={() => { setMostrarForm(!mostrarForm); setError(""); }} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl transition-colors text-sm">
            + Agregar
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-8 mb-6">
            <h2 className="text-lg font-black text-black mb-4">Nuevo producto</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nombre *</label>
                <input type="text" value={form.name} onChange={(e) => actualizar("name", e.target.value)} placeholder="Ej: Remera basica manga corta" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} placeholder="Descripcion detallada..." rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Fotos (hasta 6, maximo 8MB cada una)</label>
                <div className="flex gap-2 flex-wrap">
                  {fotosProducto.map((url, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img src={url} alt="foto" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"/>
                      <button onClick={() => setFotosProducto((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center">x</button>
                    </div>
                  ))}
                  {fotosProducto.length < 6 && (
                    <button onClick={() => fileInputRef.current?.click()} disabled={subiendoFoto} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black transition-colors text-xs disabled:opacity-50">
                      {subiendoFoto ? (
                        <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <><span className="text-xl">+</span><span>Foto</span></>
                      )}
                    </button>
                  )}
                </div>
                {errorFoto && (
                  <div className="mt-2 bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">{errorFoto}</div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={subirFoto} className="hidden"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio unidad</label>
                  <input type="text" value={form.price_unit} onChange={(e) => actualizar("price_unit", e.target.value)} placeholder="$2.500" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio docena</label>
                  <input type="text" value={form.price_dozen} onChange={(e) => actualizar("price_dozen", e.target.value)} placeholder="$25.000" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio caja</label>
                  <input type="text" value={form.price_box} onChange={(e) => actualizar("price_box", e.target.value)} placeholder="$80.000" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Categoria</label>
                  <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black">
                    <option value="">Seleccionar...</option>
                    <option>Indumentaria</option><option>Calzado</option><option>Electronica</option>
                    <option>Alimentos</option><option>Bebidas</option><option>Ferreteria</option>
                    <option>Cosmetica</option><option>Hogar</option><option>Deportes</option>
                    <option>Juguetes</option><option>Tecnologia</option><option>Otros</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Stock</label>
                  <input type="text" value={form.stock} onChange={(e) => actualizar("stock", e.target.value)} placeholder="500 unidades" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Material</label>
                  <input type="text" value={form.material} onChange={(e) => actualizar("material", e.target.value)} placeholder="100% algodon" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Talles / Medidas</label>
                  <input type="text" value={form.measures} onChange={(e) => actualizar("measures", e.target.value)} placeholder="S, M, L, XL" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setMostrarForm(false); setFotosProducto([]); setError(""); }} disabled={cargando} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl text-sm disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={guardarProducto} disabled={cargando || subiendoFoto} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {cargando ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {productos.length === 0 && !mostrarForm ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">📦</div>
            <h2 className="text-lg font-black text-black mb-2">Todavia no publicaste productos</h2>
            <p className="text-gray-500 text-sm mb-4">Agrega tus productos para que los compradores vean tu catalogo</p>
            <button onClick={() => setMostrarForm(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors text-sm">
              Agregar primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productos.map((p) => (
              <div key={p.id} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-black transition-all">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover"/>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-bold">Sin fotos</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-black text-black mb-1 text-sm">{p.name}</h3>
                  {p.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {p.price_unit && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Unidad: {p.price_unit}</span>}
                    {p.price_dozen && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Docena: {p.price_dozen}</span>}
                    {p.price_box && <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Caja: {p.price_box}</span>}
                  </div>
                  <a href={"/editar-producto?id=" + p.id} className="block w-full border-2 border-black text-black font-black text-xs py-2 rounded-xl text-center hover:bg-black hover:text-white transition-colors">
                    Editar producto
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}