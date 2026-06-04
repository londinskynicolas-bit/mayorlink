import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PerfilProveedor({ params }: any) {
  const slug = params.slug;

  const { data: proveedor } = await supabase
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!proveedor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-black mb-4">Proveedor no encontrado</h1>
          <a href="/busqueda" className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl">Ir a busqueda</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <a href="/" className="text-2xl font-black text-white tracking-tight block">MayorLink</a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/busqueda" className="text-gray-300 text-sm font-medium hover:text-white">Explorar</a>
          <a href="/registro" className="bg-emerald-500 text-black font-black text-sm px-5 py-2 rounded-full hover:bg-emerald-400 transition-colors">Publicar gratis</a>
        </div>
      </nav>

      <div className="bg-black text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <a href="/busqueda" className="text-emerald-400 text-sm font-bold hover:underline block mb-6">Volver a resultados</a>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-black text-black flex-shrink-0">
              {proveedor.company_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {proveedor.is_verified && <span className="text-xs bg-emerald-500 text-black font-black px-3 py-1 rounded-full">Verificado</span>}
                {proveedor.is_founder && <span className="text-xs bg-white text-black font-black px-3 py-1 rounded-full">Fundador</span>}
              </div>
              <h1 className="text-3xl font-black mb-1">{proveedor.company_name}</h1>
              <p className="text-gray-400 text-sm mb-4">{proveedor.city ? proveedor.city + ", " : ""}{proveedor.province}</p>
              <div className="flex gap-3 flex-wrap">
                {proveedor.whatsapp && (
                  <a href={"https://wa.me/" + proveedor.whatsapp} target="_blank" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors text-sm">
                    Contactar por WhatsApp
                  </a>
                )}
                {proveedor.instagram && (
                  <a href={"https://instagram.com/" + proveedor.instagram} target="_blank" className="border-2 border-gray-600 text-white font-black px-6 py-3 rounded-xl hover:border-white transition-colors text-sm">
                    Instagram
                  </a>
                )}
                {proveedor.email && (
                  <a href={"mailto:" + proveedor.email} className="border-2 border-gray-600 text-white font-black px-6 py-3 rounded-xl hover:border-white transition-colors text-sm">
                    Email
                  </a>
                )}
              </div>
            </div>
            {proveedor.views_count > 0 && (
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-400">{proveedor.views_count}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">visitas este mes</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-6 mb-10">
          {proveedor.min_order && (
            <div className="border-2 border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Pedido minimo</div>
              <div className="text-xl font-black text-emerald-600">{proveedor.min_order}</div>
            </div>
          )}
          {proveedor.payment_methods && (
            <div className="border-2 border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Formas de pago</div>
              <div className="text-sm font-bold text-black">{proveedor.payment_methods}</div>
            </div>
          )}
          {proveedor.shipping_info && (
            <div className="border-2 border-gray-100 rounded-2xl p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Envios</div>
              <div className="text-sm font-bold text-black">{proveedor.shipping_info}</div>
            </div>
          )}
        </div>

        {proveedor.description && (
          <div className="mb-10">
            <h2 className="text-lg font-black text-black uppercase tracking-tight mb-3">Sobre la empresa</h2>
            <p className="text-gray-600 leading-relaxed">{proveedor.description}</p>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-lg font-black text-black uppercase tracking-tight mb-4">Galeria</h2>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <span className="text-xs text-gray-400 font-bold">FOTO {n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-black px-6 py-12 text-center">
        <h2 className="text-2xl font-black text-white mb-2">Sos proveedor mayorista?</h2>
        <p className="text-gray-400 text-sm mb-6">Publica tu empresa gratis y llega a miles de comerciantes</p>
        <a href="/registro" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-2xl transition-colors">
          Publicar mi empresa gratis
        </a>
      </section>
    </div>
  );
}