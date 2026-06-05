"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";

interface Mensaje {
  rol: "user" | "assistant";
  texto: string;
}

export default function Asistente() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      rol: "assistant",
      texto: "Hola! Soy el Asistente Comercial de MayorLink 👋\n\nPuedo ayudarte a encontrar proveedores, publicar solicitudes de compra, registrar tu empresa o responder cualquier pregunta sobre la plataforma.\n\n¿En qué te puedo ayudar hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async () => {
    if (!input.trim() || cargando) return;
    const pregunta = input.trim();
    setInput("");
    setMensajes(prev => [...prev, { rol: "user", texto: pregunta }]);
    setCargando(true);

    try {
      const historial = mensajes.map(m => ({
        role: m.rol === "user" ? "user" : "assistant",
        content: m.texto
      }));

      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensajes: [...historial, { role: "user", content: pregunta }]
        })
      });

      const data = await res.json();
      const respuesta = data.respuesta || "Lo siento, no pude procesar tu consulta.";
      setMensajes(prev => [...prev, { rol: "assistant", texto: respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { rol: "assistant", texto: "Hubo un error de conexión. Intentalo de nuevo." }]);
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="bg-black text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <div>
              <h1 className="text-2xl font-black">Asistente Comercial</h1>
              <p className="text-gray-400 text-sm">Experto en MayorLink — te ayuda a comprar y vender mejor</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-emerald-400 text-xs font-bold">En linea</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-4 overflow-y-auto">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
            {m.rol === "assistant" && (
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-lg px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.rol === "user"
                ? "bg-black text-white rounded-tr-sm"
                : "bg-white border-2 border-gray-100 text-gray-800 rounded-tl-sm"
            }`}>
              {m.texto}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-sm mr-3 flex-shrink-0">🤖</div>
            <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-tl-sm px-5 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="bg-white border-t-2 border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 mb-3 flex-wrap">
            {["Como publico mi empresa?", "Como busco proveedores?", "Como funciona las solicitudes?"].map((sugerencia) => (
              <button key={sugerencia} onClick={() => setInput(sugerencia)} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-medium">
                {sugerencia}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Escribi tu consulta..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <button onClick={enviar} disabled={cargando || !input.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}