"use client";
import { useState, useRef, useEffect } from "react";

const RESPUESTAS: { patrones: string[]; respuesta: string }[] = [
  {
    patrones: ["registro", "registrar", "publicar empresa", "publicar mi empresa", "como publico", "agregar empresa"],
    respuesta: "Para publicar tu empresa es gratis y fácil:\n\n1️⃣ Tocá 'Registrarse' en el navbar\n2️⃣ Completá los datos de tu empresa\n3️⃣ Agregá productos con fotos\n4️⃣ Tu perfil queda publicado al instante\n\nLos primeros 100 proveedores obtienen el badge de Fundador 🏆"
  },
  {
    patrones: ["buscar proveedor", "busco proveedor", "encontrar proveedor", "como busco", "busqueda", "buscar"],
    respuesta: "Para buscar proveedores:\n\n🔍 Usá el buscador en la home\n📂 Filtrá por categoría y provincia\n📱 Contactá directo por WhatsApp\n\nAndá a /busqueda para ver todos los proveedores."
  },
  {
    patrones: ["solicitud", "publicar solicitud", "necesito", "como funciona solicitud"],
    respuesta: "Las solicitudes de compra son clave:\n\n1️⃣ Andá a /solicitudes\n2️⃣ Publicá lo que necesitás\n3️⃣ Los proveedores te envían propuestas\n4️⃣ Solo vos ves todas las propuestas\n5️⃣ Elegís la mejor oferta 💪"
  },
  {
    patrones: ["gratis", "costo", "precio", "pago", "comision"],
    respuesta: "MayorLink es 100% gratuito 🎉\n\n✅ Registrarte: GRATIS\n✅ Publicar productos: GRATIS\n✅ Buscar proveedores: GRATIS\n✅ Sin comisiones por ventas"
  },
  {
    patrones: ["productos", "catalogo", "subir productos", "fotos"],
    respuesta: "Para cargar productos:\n\n1️⃣ Entrá a tu panel\n2️⃣ Tocá 'Mis productos'\n3️⃣ Agregá nombre, precios y hasta 6 fotos\n4️⃣ Aparece en tu perfil público al instante 📦"
  },
  {
    patrones: ["resena", "reseña", "calificacion", "estrellas"],
    respuesta: "Las reseñas verificadas generan confianza ⭐\n\n1️⃣ Entrá al perfil del proveedor\n2️⃣ Tocá 'Dejar reseña'\n3️⃣ Elegí estrellas y escribí tu experiencia\n\nAparecen con badge de Verificada."
  },
  {
    patrones: ["panel", "estadisticas", "visitas", "metricas"],
    respuesta: "Tu panel (/panel) muestra:\n\n📊 Visitas a tu perfil\n📱 Clicks en WhatsApp\n📈 Tasa de contacto\n⭐ Promedio de reseñas\n✅ Completitud del perfil"
  },
  {
    patrones: ["whatsapp", "contactar", "contacto"],
    respuesta: "El contacto es directo y sin intermediarios 📱\n\nTocás 'Contactar por WhatsApp' en el perfil del proveedor y se abre WhatsApp directo. Sin formularios ni esperas."
  },
];

const RESPUESTA_DEFAULT = "No entendí tu consulta 😅\n\nPuedo ayudarte con:\n• Registrar tu empresa\n• Buscar proveedores\n• Publicar solicitudes\n• Cargar productos\n• Precios y costos\n\n¿Sobre qué necesitás ayuda?";

function obtenerRespuesta(input: string): string {
  const texto = input.toLowerCase();
  for (const item of RESPUESTAS) {
    if (item.patrones.some(p => texto.includes(p))) {
      return item.respuesta;
    }
  }
  return RESPUESTA_DEFAULT;
}

interface Mensaje {
  rol: "user" | "assistant";
  texto: string;
}

export default function AsistenteFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "assistant", texto: "Hola! 👋 Soy el Asistente de MayorLink.\n\n¿En qué te puedo ayudar?" }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  const enviar = () => {
    if (!input.trim()) return;
    const pregunta = input.trim();
    setInput("");
    const respuesta = obtenerRespuesta(pregunta);
    setMensajes(prev => [
      ...prev,
      { rol: "user", texto: pregunta },
      { rol: "assistant", texto: respuesta }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {abierto && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl w-80 flex flex-col overflow-hidden" style={{height: "450px"}}>
          <div className="bg-black px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-sm">🤖</div>
              <div>
                <div className="text-white font-black text-sm">Asistente MayorLink</div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-xs">En linea</span>
                </div>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-white text-lg leading-none">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.rol === "user"
                    ? "bg-black text-white rounded-tr-sm"
                    : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm"
                }`}>
                  {m.texto}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          <div className="border-t border-gray-100 p-3">
            <div className="flex gap-2 mb-2 flex-wrap">
              {["Buscar proveedores", "Registrar empresa", "Es gratis?"].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enviar()}
                placeholder="Escribi tu consulta..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-black"
              />
              <button onClick={enviar} disabled={!input.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setAbierto(!abierto)}
        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
      >
        {abierto ? "×" : "🤖"}
      </button>

      {!abierto && (
        <div className="bg-black text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg animate-bounce">
          ¿Necesitás ayuda?
        </div>
      )}
    </div>
  );
}