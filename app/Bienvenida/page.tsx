"use client";

export default function Bienvenida() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-3">Mayorista B2B Argentina</div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Bienvenido a MayorLink</h1>
          <p className="text-gray-400 text-lg">El directorio de proveedores mayoristas mas completo del pais</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <a href="/busqueda" className="group bg-white rounded-3xl p-8 hover:bg-emerald-500 transition-all duration-200 cursor-pointer">
            <div className="text-5xl mb-6">🛒</div>
            <h2 className="text-2xl font-black text-black mb-3">Busco proveedores</h2>
            <p className="text-gray-500 group-hover:text-black text-sm mb-6">
              Soy comerciante, revendedor o emprendedor y quiero encontrar proveedores mayoristas confiables para mi negocio.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {["Busqueda gratis sin registro", "Contacto directo por WhatsApp", "Filtros por categoria y provincia", "Miles de proveedores verificados"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-black">
                  <span className="text-emerald-500 font-black">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-black text-white group-hover:bg-white group-hover:text-black font-black px-6 py-3 rounded-xl text-sm text-center transition-all">
              Explorar proveedores
            </div>
          </a>

          <a href="/registro-proveedor" className="group bg-emerald-500 rounded-3xl p-8 hover:bg-white transition-all duration-200 cursor-pointer">
            <div className="text-5xl mb-6">🏭</div>
            <h2 className="text-2xl font-black text-black mb-3">Soy proveedor</h2>
            <p className="text-black group-hover:text-gray-500 text-sm mb-6">
              Soy fabricante, importador o distribuidor y quiero publicar mi empresa para llegar a mas comerciantes.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {["Publicacion gratis para siempre", "Badge de Proveedor Fundador", "Panel con estadisticas de visitas", "Contactos directos de compradores"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-black group-hover:text-gray-600">
                  <span className="font-black">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-black text-white font-black px-6 py-3 rounded-xl text-sm text-center">
              Publicar mi empresa gratis
            </div>
          </a>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Ya tenes cuenta? <a href="/login" className="text-emerald-400 font-bold hover:underline">Iniciar sesion</a>
        </p>
      </div>
    </div>
  );
}