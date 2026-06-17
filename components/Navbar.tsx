"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const { data: session } = useSession();
  const [esProveedor, setEsProveedor] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      supabase.from("providers").select("id").eq("email", session.user.email).single()
        .then(({ data }) => setEsProveedor(!!data));
      supabase.from("messages").select("id").eq("receiver_email", session.user.email).eq("read", false)
        .then(({ data }) => setMensajesNoLeidos(data?.length || 0));
    }
  }, [session]);

  return (
    <nav className="bg-black sticky top-0 z-50">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <a href="/" className="block">
          <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
          <div className="text-xl md:text-2xl font-black text-white tracking-tight">MayorLink</div>
        </a>

        <div className="hidden md:flex items-center gap-4">
          <a href="/busqueda" className="text-gray-300 text-sm font-medium hover:text-white">Proveedores</a>
          <a href="/solicitudes" className="text-gray-300 text-sm font-medium hover:text-white">Solicitudes</a>
          {session && (
            <a href="/mensajes" className="text-gray-300 text-sm font-medium hover:text-white relative">
              Mensajes
              {mensajesNoLeidos > 0 && (
                <span className="absolute -top-2 -right-3 bg-emerald-500 text-black text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {mensajesNoLeidos}
                </span>
              )}
            </a>
          )}
          {session ? (
            <div className="flex items-center gap-3">
              <a href={esProveedor ? "/panel" : "/panel-comprador"} className="text-gray-300 text-sm font-medium hover:text-white">Mi panel</a>
              <div className="flex items-center gap-2">
                {session.user?.image && <img src={session.user.image} alt="foto" className="w-8 h-8 rounded-full"/>}
                <button onClick={() => signOut()} className="text-gray-400 text-xs hover:text-white">Salir</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/bienvenida" className="text-gray-300 text-sm font-medium hover:text-white">Iniciar sesion</a>
              <a href="/bienvenida" className="bg-emerald-500 text-black font-black text-sm px-5 py-2 rounded-full hover:bg-emerald-400 transition-colors">
                Registrarse
              </a>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-white p-2">
            {menuAbierto ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="md:hidden bg-black border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
          <a href="/busqueda" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
            Buscar proveedores
          </a>
          <a href="/solicitudes" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
            Solicitudes de compra
          </a>
          {session ? (
            <>
              <a href="/mensajes" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800 flex items-center justify-between">
                <span>Mensajes</span>
                {mensajesNoLeidos > 0 && <span className="bg-emerald-500 text-black text-xs font-black px-2 py-0.5 rounded-full">{mensajesNoLeidos}</span>}
              </a>
              <a href={esProveedor ? "/panel" : "/panel-comprador"} onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
                Mi panel
              </a>
              {esProveedor && (
                <>
                  <a href="/mis-productos" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
                    Mis productos
                  </a>
                  <a href="/editar-perfil" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
                    Editar perfil
                  </a>
                </>
              )}
              <a href="/panel-comprador" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
                Panel de comprador
              </a>
              <button onClick={() => { signOut(); setMenuAbierto(false); }} className="text-red-400 text-sm font-medium hover:text-red-300 py-2 text-left">
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <a href="/bienvenida" onClick={() => setMenuAbierto(false)} className="text-gray-300 text-sm font-medium hover:text-white py-2 border-b border-gray-800">
                Iniciar sesion
              </a>
              <a href="/bienvenida" onClick={() => setMenuAbierto(false)} className="bg-emerald-500 text-black font-black text-sm px-5 py-3 rounded-xl text-center hover:bg-emerald-400 transition-colors">
                Registrarse gratis
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
