export default function Gracias() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b-2 border-gray-900 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-2xl font-black tracking-tight">
          MAYOR<span className="text-emerald-500">LINK</span>
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Tu empresa ya esta en MayorLink
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Miles de comerciantes y revendedores van a poder encontrarte. 
          Sos parte de los primeros proveedores fundadores de la plataforma.
        </p>
        <div className="flex gap-4 justify-center">
          
            href="/"
            className="bg-gray-900 text-white font-black px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-colors"
          >
            Ver la plataforma
          </a>
          
            href="/busqueda"
            className="border-2 border-gray-900 text-gray-900 font-black px-8 py-4 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            Buscar proveedores
          </a>
        </div>
      </div>
    </div>
  );
}