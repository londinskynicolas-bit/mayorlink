"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Mensajes() {
  const { data: session, status } = useSession();
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(true);
  const [vistaMovil, setVistaMovil] = useState<"lista" | "chat">("lista");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") window.location.href = "/login";
    if (status === "authenticated" && session?.user?.email) {
      cargarConversaciones().then(() => {
        const params = new URLSearchParams(window.location.search);
        const convId = params.get("conv");
        const conEmail = params.get("con");
        if (convId && conEmail) {
          const conv = { id: convId, otroEmail: conEmail, ultimoMensaje: "", noLeidos: 0 };
          abrirConversacion(conv);
          setVistaMovil("chat");
        }
      });
    }
  }, [status, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const cargarConversaciones = async () => {
    const email = session?.user?.email;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_email.eq.${email},receiver_email.eq.${email}`)
      .order("created_at", { ascending: false });

    const convMap: { [key: string]: any } = {};
    (data || []).forEach(m => {
      const otroEmail = m.sender_email === email ? m.receiver_email : m.sender_email;
      const convId = m.conversation_id;
      if (!convMap[convId]) {
        convMap[convId] = { id: convId, otroEmail, ultimoMensaje: m.content, fecha: m.created_at, noLeidos: 0 };
      }
      if (!m.read && m.receiver_email === email) convMap[convId].noLeidos++;
    });

    setConversaciones(Object.values(convMap));
    setCargando(false);
  };

  const abrirConversacion = async (conv: any) => {
    setConversacionActiva(conv);
    setVistaMovil("chat");
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conv.id).order("created_at", { ascending: true });
    setMensajes(data || []);
    if (session?.user?.email) {
      await supabase.from("messages").update({ read: true }).eq("conversation_id", conv.id).eq("receiver_email", session.user.email);
    }
  };

  const enviar = async () => {
    if (!input.trim() || !conversacionActiva || !session?.user?.email) return;
    const mensaje = {
      sender_email: session.user.email,
      receiver_email: conversacionActiva.otroEmail,
      content: input.trim(),
      conversation_id: conversacionActiva.id,
      read: false,
    };
    const { data } = await supabase.from("messages").insert(mensaje).select().single();
    if (data) {
      setMensajes(prev => [...prev, data]);
      setConversaciones(prev => {
        const existe = prev.find(c => c.id === conversacionActiva.id);
        if (existe) return prev.map(c => c.id === conversacionActiva.id ? { ...c, ultimoMensaje: input.trim() } : c);
        return [{ ...conversacionActiva, ultimoMensaje: input.trim() }, ...prev];
      });
    }
    setInput("");
  };

  if (status === "loading" || cargando) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-4 md:py-8 flex-1 flex flex-col">
        <h1 className="text-2xl md:text-3xl font-black text-black mb-4 md:mb-6">Mensajes</h1>

        <div className="flex gap-4 flex-1" style={{minHeight: "500px"}}>

          {/* Lista de conversaciones */}
          <div className={`${vistaMovil === "chat" ? "hidden md:flex" : "flex"} md:flex w-full md:w-72 flex-shrink-0 bg-white border-2 border-gray-100 rounded-2xl overflow-hidden flex-col`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-black text-black text-sm uppercase tracking-wide">Conversaciones</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversaciones.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-400 text-sm font-bold">No hay conversaciones</p>
                  <p className="text-gray-400 text-xs mt-1">Entra al perfil de un proveedor y toca "Mensaje"</p>
                </div>
              ) : (
                conversaciones.map((conv) => (
                  <button key={conv.id} onClick={() => abrirConversacion(conv)} className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${conversacionActiva?.id === conv.id ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-black text-black text-sm truncate">{conv.otroEmail.split("@")[0]}</div>
                      {conv.noLeidos > 0 && (
                        <span className="bg-emerald-500 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">{conv.noLeidos}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{conv.ultimoMensaje}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat activo */}
          <div className={`${vistaMovil === "lista" ? "hidden md:flex" : "flex"} md:flex flex-1 bg-white border-2 border-gray-100 rounded-2xl overflow-hidden flex-col`}>
            {!conversacionActiva ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-400 font-bold text-sm">Selecciona una conversacion</p>
                  <p className="text-gray-400 text-xs mt-1">o inicia una desde el perfil de un proveedor</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => { setVistaMovil("lista"); setConversacionActiva(null); }} className="md:hidden text-gray-400 hover:text-black mr-1">
                    ←
                  </button>
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-black text-emerald-700 flex-shrink-0">
                    {conversacionActiva.otroEmail[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-black text-sm truncate">{conversacionActiva.otroEmail.split("@")[0]}</div>
                    <div className="text-xs text-gray-400 truncate">{conversacionActiva.otroEmail}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {mensajes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">Inicia la conversacion enviando un mensaje</p>
                    </div>
                  )}
                  {mensajes.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_email === session?.user?.email ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${m.sender_email === session?.user?.email ? "bg-black text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
                        {m.content}
                        <div className="text-xs mt-1 opacity-50">
                          {new Date(m.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef}/>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && enviar()}
                    placeholder="Escribi tu mensaje..."
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-black"
                  />
                  <button onClick={enviar} disabled={!input.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm">
                    →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}