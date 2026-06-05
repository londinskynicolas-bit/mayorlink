"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";

interface Mensaje {
  rol: "user" | "assistant";
  texto: string;
}

const RESPUESTAS: { patrones: string[]; respuesta: string }[] = [
  {
    patrones: ["registro", "registrar", "publicar empresa", "publicar mi empresa", "como publico", "agregar empresa"],
    respuesta: "Para publicar tu empresa en MayorLink es muy fácil y gratis:\n\n1️⃣ Tocá 'Registrarse' en el navbar o andá a /registro-proveedor\n2️⃣ Completá los datos de tu empresa (nombre, categoría, provincia)\n3️⃣ Agregá tu WhatsApp y redes sociales\n4️⃣ Cargá las condiciones mayoristas (pedido mínimo, formas de pago)\n5️⃣ Subí tu logo y fotos de productos\n\n✅ Tu perfil queda publicado al instante y los compradores pueden encontrarte.\n\nLos primeros 100 proveedores obtienen el badge de **Fundador** permanente. ¿Ya te registraste o necesitás ayuda con algún paso?"
  },
  {
    patrones: ["buscar proveedor", "busco proveedor", "encontrar proveedor", "como busco", "busqueda", "buscar"],
    respuesta: "Encontrar proveedores en MayorLink es muy simple:\n\n🔍 **Opción 1 — Buscador:** Escribí el producto o rubro en la barra de búsqueda de la home\n\n📂 **Opción 2 — Por categoría:** Tocá cualquier categoría (Indumentaria, Electronica, Hogar, etc) y filtrá por provincia\n\n📍 **Opción 3 — Por provincia:** En la home hay una sección para buscar por provincia directamente\n\nEn cada resultado podés ver el perfil completo con productos, precios y condiciones, y contactar directo por WhatsApp.\n\n¿Qué tipo de proveedor estás buscando? Te ayudo a encontrarlo."
  },
  {
    patrones: ["solicitud", "publicar solicitud", "necesito", "busco producto", "como funciona solicitud"],
    respuesta: "Las solicitudes de compra son el corazón de MayorLink 💪\n\n**¿Cómo funciona?**\n1️⃣ Andá a /solicitudes y tocá '+ Publicar solicitud'\n2️⃣ Describí lo que necesitás (ej: 'Busco 100 remeras de algodón')\n3️⃣ Elegí categoría, cantidad, ciudad y presupuesto\n4️⃣ Los proveedores de esa categoría ven tu solicitud\n5️⃣ Te envían propuestas con precio y tiempo de entrega\n6️⃣ Solo vos ves todas las propuestas — comparás y elegís\n\n✅ Cuando conseguís lo que buscabas, marcás la solicitud como resuelta.\n\n¿Querés publicar una solicitud ahora?"
  },
  {
    patrones: ["productos", "catalogo", "subir productos", "agregar productos", "fotos productos"],
    respuesta: "Para cargar tus productos en MayorLink:\n\n1️⃣ Entrá a tu panel (/panel)\n2️⃣ Tocá 'Mis productos'\n3️⃣ Tocá '+ Agregar producto'\n4️⃣ Completá: nombre, descripción, precios (unidad/docena/caja), material, talles y stock\n5️⃣ Subí hasta **6 fotos** por producto\n\n📦 Tus productos aparecen en tu perfil público y los compradores pueden consultarte directo por WhatsApp.\n\n¿Necesitás ayuda para cargar algún producto?"
  },
  {
    patrones: ["resena", "reseña", "calificacion", "puntaje", "estrellas", "opinion"],
    respuesta: "Las reseñas verificadas son uno de los diferenciales más importantes de MayorLink ⭐\n\n**Para dejar una reseña:**\n1️⃣ Entrá al perfil del proveedor\n2️⃣ Tocá 'Dejar reseña'\n3️⃣ Elegí de 1 a 5 estrellas\n4️⃣ Escribí tu experiencia\n\n✅ Las reseñas aparecen con el badge de **Verificada** porque el sistema confirma que sos un usuario real.\n\nEl promedio de estrellas aparece en el perfil del proveedor y en los resultados de búsqueda. ¿Querés dejar una reseña de algún proveedor?"
  },
  {
    patrones: ["favorito", "guardar proveedor", "lista", "guardados"],
    respuesta: "Podés guardar proveedores como favoritos para volver a contactarlos después 💛\n\n**¿Cómo funciona?**\n1️⃣ Entrá al perfil de cualquier proveedor\n2️⃣ Tocá el botón '🤍 Guardar'\n3️⃣ Se guarda como '❤️ Guardado'\n\nTus favoritos aparecen en tu panel de comprador (/panel-comprador) para acceder rápido.\n\n¿Ya guardaste algún proveedor?"
  },
  {
    patrones: ["panel", "estadisticas", "visitas", "whatsapp clicks", "metricas"],
    respuesta: "Tu panel de proveedor (/panel) te muestra métricas reales de tu negocio:\n\n📊 **Visitas** — cuántas personas entraron a tu perfil\n📱 **Clicks WhatsApp** — cuántos te contactaron\n📈 **Tasa de contacto** — qué % de visitantes te escribió\n⭐ **Reseñas** — promedio de estrellas\n✅ **Perfil completo** — qué tan completo está tu perfil\n\nLos perfiles más completos aparecen primero en los resultados. ¿Querés mejorar tu perfil?"
  },
  {
    patrones: ["gratis", "costo", "precio", "pago", "comision", "cobran"],
    respuesta: "MayorLink es **100% gratuito** 🎉\n\n✅ Registrar tu empresa: GRATIS\n✅ Publicar productos: GRATIS\n✅ Buscar proveedores: GRATIS\n✅ Publicar solicitudes: GRATIS\n✅ Contactar por WhatsApp: GRATIS\n✅ Sin comisiones por ventas\n✅ Sin contratos ni suscripciones\n\nSiempre va a ser gratis para los proveedores fundadores. ¿Tenés alguna duda más?"
  },
  {
    patrones: ["verificado", "verificacion", "badge", "fundador", "confianza"],
    respuesta: "MayorLink tiene dos badges de confianza:\n\n🏆 **Badge Fundador** — para los primeros 100 proveedores en registrarse. Es permanente y muestra que sos parte de los que construyeron la plataforma desde el inicio.\n\n✅ **Badge Verificado** — para proveedores que completaron el proceso de verificación. Genera más confianza en los compradores y aparecés destacado en los resultados.\n\n¿Querés saber cómo obtener alguno de estos badges?"
  },
  {
    patrones: ["whatsapp", "contactar", "contacto", "comunicar", "hablar"],
    respuesta: "El contacto en MayorLink es **directo y sin intermediarios** 📱\n\nCuando encontrás un proveedor que te interesa:\n1️⃣ Tocás el botón verde 'Contactar por WhatsApp'\n2️⃣ Se abre WhatsApp con el número del proveedor\n3️⃣ Si es desde un producto, el mensaje ya viene con el nombre del producto\n\n✅ Sin formularios, sin esperas, sin comisiones. El negocio lo cerrás vos directamente.\n\n¿Necesitás ayuda para encontrar el proveedor correcto?"
  },
];

const RESPUESTA_DEFAULT = "Hola! No entendí bien tu consulta 😅\n\nPodés preguntarme sobre:\n• Cómo registrar tu empresa\n• Cómo buscar proveedores\n• Cómo publicar solicitudes de compra\n• Cómo cargar productos\n• Precios y costos\n• Badges y verificación\n\n¿Sobre qué te puedo ayudar?";

function obtenerRespuesta(input: string): string {
  const texto = input.toLowerCase();
  for (const item of RESPUESTAS) {
    if (item.patrones.some(p => texto.includes(p))) {
      return item.respuesta;
    }
  }
  return RESPUESTA_DEFAULT;
}

export default function Asistente() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      rol: "assistant",
      texto: "Hola! Soy el Asistente Comercial de MayorLink 👋\n\nPuedo ayudarte a encontrar proveedores, publicar solicitudes de compra, registrar tu empresa o responder cualquier pregunta sobre la plataforma.\n\n¿En qué te puedo ayudar hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

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
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
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
        <div ref={bottomRef}/>
      </div>

      <div className="bg-white border-t-2 border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-3 flex-wrap">
            {["Como publico mi empresa?", "Como busco proveedores?", "Como funciona las solicitudes?", "Es gratis?"].map((s) => (
              <button key={s} onClick={() => { setInput(s); }} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-medium">
                {s}
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
            <button onClick={enviar} disabled={!input.trim()} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-3 rounded-xl transition-colors disabled:opacity-50">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}