"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { obtenerCamposPorCategoria, NO_APLICA } from "../../hooks/useEspecificaciones";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIAS = [
  "Indumentaria", "Calzado", "Electronica", "Alimentos", "Bebidas",
  "Ferreteria", "Cosmetica", "Hogar", "Deportes", "Juguetes",
  "Tecnologia", "Textil", "Packaging", "Automotriz", "Agro",
  "Salud", "Libreria", "Otros"
];

const CONDICIONES = ["Nuevo", "Reacondicionado", "Segunda mano"];

export default function MisProductos() {
  const { data: session, status } = useSession();
  const [proveedor, setProveedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [yaPublicado, setYaPublicado] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const [error, setError] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", description: "", category: "", condicion: "Nuevo", stock: "",
    precio_unidad: "", precio_docena: "", precio_caja: "", precio_pallet: "",
    cantidad_minima: "", tiempo_entrega: "",
  });
  const [specs, setSpecs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated" && session?.user?.email) {
      supabase.from("providers").select("*").eq("email", session.user.email)
        .order("created_at", { ascending: false }).limit(1)
        .then(({ data }) => {
          const prov = data && data.length > 0 ? data[0] : null;
          setProveedor(prov);
          if (prov) {
            supabase.from("products").select("*").eq("provider_slug", prov.slug)
              .order("created_at", { ascending: false })
              .then(({ data: prods }) => setProductos(prods || []));
          }
        });
    }
  }, [status, session]);

  const camposActuales = form.category ? obtenerCamposPorCategoria(form.category) : [];
  const todasLasSpecsCompletas = camposActuales.every(c => specs[c.key] && specs[c.key].trim() !== "");

  const actualizar = (campo: string, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (campo === "category") setSpecs({});
  };

  const actualizarSpec = (key: string, valor: string) => {
    setSpecs(prev => ({ ...prev, [key]: valor }));
  };

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorFoto("");
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 8) {
      setErrorFoto(`La imagen pesa ${sizeMB.toFixed(1)}MB. El máximo es 8MB.`);
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
        setErrorFoto(data.error || "No pudimos subir la imagen.");
        setSubiendoFoto(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFotos(prev => [...prev, data.url]);
    } catch {
      setErrorFoto("Problema de conexión. Verificá tu internet.");
    }
    setSubiendoFoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const siguiente = () => {
    setError("");
    if (paso === 1) {
      if (!form.name.trim()) { setError("El nombre del producto es obligatorio"); return; }
      if (!form.category) { setError("Seleccioná una categoría"); return; }
    }
    if (paso === 2 && !todasLasSpecsCompletas) {
      setError("Completá todas las especificaciones. Si alguna no aplica, seleccioná 'No aplica'."); return;
    }
    if (paso === 3) {
      if (!form.precio_unidad.trim() && !form.precio_docena.trim() && !form.precio_caja.trim()) {
        setError("Ingresá al menos un precio (unidad, docena o caja)"); return;
      }
    }
    setPaso(p => p + 1);
  };

  const guardar = async () => {
    if (yaPublicado || cargando || !proveedor) return;
    setError("");
    if (fotos.length === 0) { setError("Subí al menos una foto del producto"); return; }

    const specsFiltradas: { [key: string]: string } = {};
    Object.entries(specs).forEach(([key, value]) => {
      if (value && value !== NO_APLICA) specsFiltradas[key] = value;
    });

    setCargando(true);
    const { data, error: err } = await supabase.from("products").insert({
      provider_id: proveedor.id,
      provider_slug: proveedor.slug,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      condicion: form.condicion,
      stock: form.stock.trim(),
      price_unit: form.precio_unidad.trim(),
      price_dozen: form.precio_docena.trim(),
      price_box: form.precio_caja.trim(),
      price_pallet: form.precio_pallet.trim(),
      cantidad_minima: form.cantidad_minima.trim(),
      tiempo_entrega: form.tiempo_entrega.trim(),
      images: fotos,
      specs: specsFiltradas,
      status: "active",
    }).select().single();

    if (err) {
      setCargando(false);
      setError("No pudimos guardar el producto. Intentá de nuevo.");
      return;
    }

    setProductos(prev => [data, ...prev]);
    setForm({ name: "", description: "", category: "", condicion: "Nuevo", stock: "", precio_unidad: "", precio_docena: "", precio_caja: "", precio_pallet: "", cantidad_minima: "", tiempo_entrega: "" });
    setSpecs({});
    setFotos([]);
    setCargando(false);
    setYaPublicado(true);
    setMostrarForm(false);
    setPaso(1);
    setTimeout(() => setYaPublicado(false), 2000);
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setPaso(1);
    setError("");
    setFotos([]);
    setSpecs({});
    setForm({ name: "", description: "", category: "", condicion: "Nuevo", stock: "", precio_unidad: "", precio_docena: "", precio_caja: "", precio_pallet: "", cantidad_minima: "", tiempo_entrega: "" });
  };

  if (status === "loading") return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;

  if (!proveedor && status === "authenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-black text-black mb-4">Primero registrá tu empresa</h2>
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
        <a href="/panel" className="text-gray-300 text-sm hover:text-white">Mi panel</a>
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-black">Mis productos</h1>
            <p className="text-gray-500 text-xs mt-1">{proveedor?.company_name} · {productos.length} publicados</p>
          </div>
          {!mostrarForm && (
            <button onClick={() => setMostrarForm(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl transition-colors text-sm">
              + Agregar producto
            </button>
          )}
        </div>

        {mostrarForm && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-8 mb-6">
            {/* Indicador de pasos */}
            <div className="flex items-center gap-2 mb-6">
              {["Información", "Especificaciones", "Precios", "Fotos"].map((nombre, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${paso > i + 1 ? "bg-emerald-500 text-black" : paso === i + 1 ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}>
                    {paso > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${paso === i + 1 ? "font-black text-black" : "text-gray-400"}`}>{nombre}</span>
                  {i < 3 && <div className="w-4 h-px bg-gray-200 hidden sm:block"/>}
                </div>
              ))}
            </div>

            {/* Paso 1: Información básica */}
            {paso === 1 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-black text-black">Información del producto</h2>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Nombre del producto *</label>
                  <input type="text" value={form.name} onChange={e => actualizar("name", e.target.value)} placeholder="Ej: Remera básica manga corta de algodón" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"/>
                  <p className="text-xs text-gray-400 mt-1">Tip: Incluí marca, material y característica principal si es posible</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Categoría *</label>
                    <select value={form.category} onChange={e => actualizar("category", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                      <option value="">Seleccionar...</option>
                      {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Condición</label>
                    <select value={form.condicion} onChange={e => actualizar("condicion", e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-black">
                      {CONDICIONES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Descripción detallada</label>
                  <textarea value={form.description} onChange={e => actualizar("description", e.target.value)} placeholder="Describí el producto en detalle: características, usos, ventajas, qué lo diferencia. Cuanto más completo, más confianza genera en el comprador." rows={4} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"/>
                </div>
              </div>
            )}

            {/* Paso 2: Especificaciones */}
            {paso === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-black text-black">Especificaciones de {form.category}</h2>
                  <p className="text-sm text-gray-500 mt-1">Completá todos los campos. Si alguno no aplica a tu producto, seleccioná "No aplica".</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {camposActuales.map(campo => (
                    <div key={campo.key}>
                      <label className="text-sm font-bold text-gray-700 block mb-1">{campo.label} *</label>
                      {campo.tipo === "select" ? (
                        <select value={specs[campo.key] || ""} onChange={e => actualizarSpec(campo.key, e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
                          <option value="">Seleccionar...</option>
                          {campo.opciones?.map(op => <option key={op} value={op}>{op}</option>)}
                          {!campo.opciones?.includes("No aplica") && <option value={NO_APLICA}>No aplica</option>}
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={specs[campo.key] === NO_APLICA ? "" : (specs[campo.key] || "")}
                            onChange={e => actualizarSpec(campo.key, e.target.value)}
                            placeholder={campo.placeholder}
                            disabled={specs[campo.key] === NO_APLICA}
                            className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => actualizarSpec(campo.key, specs[campo.key] === NO_APLICA ? "" : NO_APLICA)}
                            className={"px-3 py-2 rounded-xl text-xs font-bold border-2 whitespace-nowrap transition-colors " + (specs[campo.key] === NO_APLICA ? "bg-black text-white border-black" : "border-gray-200 text-gray-500 hover:border-black")}
                          >
                            No aplica
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Precios y stock */}
            {paso === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-black text-black">Precios mayoristas y stock</h2>
                  <p className="text-sm text-gray-500 mt-1">Ingresá al menos un precio. Cuantos más precios por volumen, mejor.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Precio por unidad</label>
                    <input type="text" value={form.precio_unidad} onChange={e => actualizar("precio_unidad", e.target.value)} placeholder="Ej: $2.500" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Precio por docena</label>
                    <input type="text" value={form.precio_docena} onChange={e => actualizar("precio_docena", e.target.value)} placeholder="Ej: $25.000" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Precio por caja</label>
                    <input type="text" value={form.precio_caja} onChange={e => actualizar("precio_caja", e.target.value)} placeholder="Ej: $80.000" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Precio por pallet</label>
                    <input type="text" value={form.precio_pallet} onChange={e => actualizar("precio_pallet", e.target.value)} placeholder="Ej: $500.000" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Cantidad mínima de compra</label>
                    <input type="text" value={form.cantidad_minima} onChange={e => actualizar("cantidad_minima", e.target.value)} placeholder="Ej: 12 unidades" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Stock disponible</label>
                    <input type="text" value={form.stock} onChange={e => actualizar("stock", e.target.value)} placeholder="Ej: 500 unidades" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tiempo de entrega estimado</label>
                  <input type="text" value={form.tiempo_entrega} onChange={e => actualizar("tiempo_entrega", e.target.value)} placeholder="Ej: 3 a 5 días hábiles" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black"/>
                </div>
              </div>
            )}

            {/* Paso 4: Fotos */}
            {paso === 4 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-black text-black">Fotos del producto *</h2>
                  <p className="text-sm text-gray-500 mt-1">Subí hasta 6 fotos. Los productos con buenas fotos reciben hasta 3 veces más consultas.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    "Vista frontal principal",
                    "Vista lateral o trasera",
                    "Detalle del producto",
                    "Packaging / Embalaje",
                    "Foto en uso o contexto",
                    "Foto adicional",
                  ].map((guia, i) => (
                    <div key={i} className="aspect-square relative">
                      {fotos[i] ? (
                        <div className="relative w-full h-full">
                          <img src={fotos[i]} alt={`Foto ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200"/>
                          <button onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center">x</button>
                        </div>
                      ) : (
                        <button onClick={() => fileInputRef.current?.click()} disabled={subiendoFoto || fotos.length >= 6} className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-black transition-colors disabled:opacity-40 text-center p-2">
                          {subiendoFoto && fotos.length === i ? (
                            <span className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <>
                              <span className="text-xl text-gray-400">+</span>
                              <span className="text-xs text-gray-400 leading-tight">{guia}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errorFoto && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-medium">{errorFoto}</div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={subirFoto} className="hidden"/>
                <p className="text-xs text-gray-400">Formatos aceptados: JPG, PNG, WEBP. Máximo 8MB por imagen.</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
            )}

            <div className="flex gap-3 mt-6">
              {paso > 1 ? (
                <button onClick={() => { setPaso(p => p - 1); setError(""); }} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl text-sm hover:border-black transition-colors">
                  Atrás
                </button>
              ) : (
                <button onClick={cerrarForm} className="flex-1 border-2 border-gray-200 text-gray-600 font-black py-3 rounded-xl text-sm hover:border-black transition-colors">
                  Cancelar
                </button>
              )}
              {paso < 4 ? (
                <button onClick={siguiente} className="flex-1 bg-black text-white font-black py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm">
                  Continuar →
                </button>
              ) : (
                <button onClick={guardar} disabled={cargando || subiendoFoto} className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                  {cargando ? (
                    <><span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>Publicando...</>
                  ) : "Publicar producto"}
                </button>
              )}
            </div>
          </div>
        )}

        {productos.length === 0 && !mostrarForm ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">📦</div>
            <h2 className="text-lg font-black text-black mb-2">Todavía no publicaste productos</h2>
            <p className="text-gray-500 text-sm mb-4">Agregá tus productos para que los compradores vean tu catálogo</p>
            <button onClick={() => setMostrarForm(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors text-sm">
              Agregar primer producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productos.map(p => (
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