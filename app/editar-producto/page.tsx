"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditarProducto() {
  const { data: session, status } = useSession();
  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", description: "", price_unit: "", price_dozen: "",
    price_box: "", category: "", material: "", measures: "", stock: "",
  });
  const [fotos, setFotos] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id) { window.location.href = "/mis-productos"; return; }
      supabase.from("products").select("*").eq("id", id).single()
        .then(({ data }) => {
          if (data) {
            setProducto(data);
            setForm({
              name: data.name || "",
              description: data.description || "",
              price_unit: data.price_unit || "",
              price_dozen: data.price_dozen || "",
              price_box: data.price_box || "",
              category: data.category || "",
              material: data.material || "",
              measures: data.measures || "",
              stock: data.stock || "",
            });
            setFotos(data.images || []);
          }
          setCargando(false);
        });
    }
  }, [status]);

  const actualizar = (campo: string, valor: string) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoFoto(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setFotos((prev) => [...prev, data.url]);
    setSubiendoFoto(false);
  };

  const guardar = async () => {
    if (!producto) return;
    setGuardando(true);
    await supabase.from("products").update({
      name: form.name,
      description: form.description,
      price_unit: form.price_unit,
      price_dozen: form.price_dozen,
      price_box: form.price_box,
      category: form.category,
      material: form.material,
      measures: form.measures,
      stock: form.stock,
      images: fotos,
    }).eq("id", producto.id);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const eliminar = async () => {
    if (!producto) return;
    if (!confirm("Seguro que queres eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", producto.id);
    window.location.href = "/mis-productos";
  };

  if (cargando) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-2xl font-black text-white tracking-tight">MayorLink</div>
        </a>
        <a href="/mis-productos" className="text-gray-400 text-sm hover:text-white">Volver a mis productos</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-black">Editar producto</h1>
          <button onClick={eliminar} className="text-red-500 text-sm font-bold hover:underline">
            Eliminar producto
          </button>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Nombre del producto *</label>
            <input type="text" value={form.name} onChange={(e) => actualizar("name", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Descripcion</label>
            <textarea value={form.description} onChange={(e) => actualizar("description", e.target.value)} rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Fotos</label>
            <div className="flex gap-3 flex-wrap">
              {fotos.map((url, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={url} alt="foto" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"/>
                  <button onClick={() => setFotos((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full text-xs font-black flex items-center justify-center">x</button>
                </div>
              ))}
              {fotos.length < 6 && (
                <button onClick={() => fileInputRef.current?.click()} disabled={subiendoFoto} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black transition-colors">
                  {subiendoFoto ? <span className="text-xs">Subiendo...</span> : <><span className="text-2xl">+</span><span className="text-xs mt-1">Foto</span></>}
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={subirFoto} className="hidden"/>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Precio unidad</label>
              <input type="text" value={form.price_unit} onChange={(e) => actualizar("price_unit", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Precio docena</label>
              <input type="text" value={form.price_dozen} onChange={(e) => actualizar("price_dozen", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Precio caja</label>
              <input type="text" value={form.price_box} onChange={(e) => actualizar("price_box", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Categoria</label>
              <select value={form.category} onChange={(e) => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
                <option value="">Seleccionar...</option>
                <option>Indumentaria</option><option>Calzado</option><option>Electronica</option>
                <option>Alimentos</option><option>Bebidas</option><option>Ferreteria</option>
                <option>Cosmetica</option><option>Hogar</option><option>Deportes</option>
                <option>Juguetes</option><option>Tecnologia</option><option>Otros</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Stock</label>
              <input type="text" value={form.stock} onChange={(e) => actualizar("stock", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Material</label>
              <input type="text" value={form.material} onChange={(e) => actualizar("material", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Medidas / Talles</label>
              <input type="text" value={form.measures} onChange={(e) => actualizar("measures", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
            </div>
          </div>

          <button onClick={guardar} disabled={guardando} className={`w-full font-black py-4 rounded-xl transition-colors text-sm ${guardado ? "bg-emerald-500 text-black" : "bg-black text-white hover:bg-emerald-600"}`}>
            {guardado ? "Guardado correctamente" : guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}