"use client";
import { useSession, signIn, signOut } from "next-auth/react";
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

  useEffect(() => {
    if (session?.user?.email) {
      supabase.from("providers").select("id").eq("email", session.user.email).single()
        .then(({ data }) => setEsProveedor(!!data));
      supabase.from("messages").select("id").eq("receiver_email", session.user.email).eq("read", false)
        .then(({ data }) => setMensajesNoLeidos(data?.length || 0));
    }
  }, [session]);

  return (
    <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <a href="/" className="block">
        <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Mayorista B2B</div>
        <div className="text-2xl font-black text-white tracking-tight">MayorLink</div>
      </a>
      <div className="flex items-center gap-4">
        <a href="/busqueda" className="text-gray-300 text-sm font-medium hover:text-white hidden md:block">Proveedores</a>
        <a href="/solicitudes" className="text-gray-300 text-sm font-medium hover:text-white hidden md:block">Solicitudes</a>
        {session ? (
          <div className="flex items-center gap-3">
            <a href="/mensajes" className="text-gray-300 text-sm font-medium hover:text-white relative hidden md:block">
              Mensajes
              {mensajesNoLeidos > 0 && (
                <span className="absolute -top-2 -right-3 bg-emerald-500 text-black text-xs font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {mensajesNoLeidos}
                </span>
              )}
            </a>
            <a href={esProveedor ? "/panel" : "/panel-comprador"} className="text-gray-300 text-sm font-medium hover:text-white">
              Mi panel
            </a>
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img src={session.user.image} alt="foto" className="w-8 h-8 rounded-full"/>
              )}
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
    </nav>
  );
}