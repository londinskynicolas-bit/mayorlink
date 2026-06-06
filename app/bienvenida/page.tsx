"use client";

export default function Bienvenida() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-3">Mayorista B2B Argentina</div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Bienvenido a MayorLink</h1>
          <p className="text-gray-400 text-sm">El directorio mayorista mas completo del pais</p>
        </div>

        <div className="flex flex-col gap-4">
          <a href="/busqueda" className="bg-white rounded-2xl p-5 hover:bg-emerald-500 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🛒</span>
              <div>
                <h2 className="text-lg font-black text-black">Busco proveedores</h2>
                <p className="text-gray-500 group-hover:text-black text-xs">Comerciante, revendedor o emprendedor</p>
              </div>
            </div>
            <div className="bg-black text-white font-black px-4 py-2 rounded-xl text-sm text-center">
              Explorar proveedores
            </div>
          </a>

          <a href="/registro-proveedor" className="bg-emerald-500 rounded-2xl p-5 hover:bg-white transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏭</span>
              <div>
                <h2 className="text-lg font-black text-black">Soy proveedor</h2>
                <p className="text-black group-hover:text-gray-500 text-xs">Fabricante, importador o distribuidor</p>
              </div>
            </div>
            <div className="bg-black text-white font-black px-4 py-2 rounded-xl text-sm text-center">
              Publicar mi empresa gratis
            </div>
          </a>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Ya tenes cuenta? <a href="/login" className="text-emerald-400 font-bold hover:underline">Iniciar sesion</a>
        </p>
      </div>
    </div>
  );
}
