import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="text-9xl font-black text-gray-100 mb-4 leading-none">404</div>
        <h1 className="text-3xl font-black text-black mb-4">Pagina no encontrada</h1>
        <p className="text-gray-500 mb-10">La pagina que buscas no existe o fue movida.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-black text-white font-black px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-colors">
            Volver al inicio
          </Link>
          <Link href="/busqueda" className="border-2 border-black text-black font-black px-8 py-4 rounded-2xl hover:bg-black hover:text-white transition-colors">
            Buscar proveedores
          </Link>
        </div>
      </div>
    </div>
  );
}