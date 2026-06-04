"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <a href="/" className="block">
        <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
        <div className="text-2xl font-black text-white tracking-tight">MayorLink</div>
      </a>
      <div className="flex items-center gap-4">
        <a href="/busqueda" className="text-gray-300 text-sm font-medium hover:text-white hidden md:block">Explorar</a>
        {session ? (
          <div className="flex items-center gap-3">
            <a href="/panel" className="text-gray-300 text-sm font-medium hover:text-white">Mi panel</a>
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img src={session.user.image} alt="foto" className="w-8 h-8 rounded-full"/>
              )}
              <button onClick={() => signOut()} className="text-gray-400 text-xs hover:text-white">Salir</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => signIn("google")} className="text-gray-300 text-sm font-medium hover:text-white">
              Iniciar sesion
            </button>
            <a href="/registro" className="bg-emerald-500 text-black font-black text-sm px-5 py-2 rounded-full hover:bg-emerald-400 transition-colors">
              Publicar gratis
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}