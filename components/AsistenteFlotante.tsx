"use client";
import { useState, useRef, useEffect } from "react";

interface Mensaje {
  rol: "user" | "assistant";
  texto: string;
}

const RESPUESTAS: { patrones: string[]; respuesta: string }[] = [
  {
    patrones: ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "hey", "que tal", "como estas"],
    respuesta: "Hola! Bienvenido a MayorLink 👋 Soy el asistente virtual y estoy acá para ayudarte con lo que necesites. ¿Sos comprador o proveedor?"
  },
  {
    patrones: ["que es mayorlink", "para que sirve", "como funciona", "que hace"],
    respuesta: "MayorLink es la red comercial B2B mayorista más completa de Argentina 🇦🇷\n\nConectamos compradores (comerciantes, revendedores, emprendedores) con proveedores mayoristas (fabricantes, importadores, distribuidores) de todo el país.\n\nPodés buscar proveedores por categoría y provincia, ver su catálogo completo y contactarlos directo por WhatsApp. Sin intermediarios, sin comisiones.\n\n¿Sos comprador o proveedor?"
  },
  {
    patrones: ["gratis", "costo", "precio", "cobran", "comision", "cuanto sale", "cuanto cuesta"],
    respuesta: "100% gratis 🎉 En serio, no hay letra chica.\n\n✅ Buscar proveedores: gratis\n✅ Registrar tu empresa: gratis\n✅ Publicar productos: gratis\n✅ Publicar solicitudes: gratis\n✅ Contactar por WhatsApp: gratis\n✅ Sin comisiones por ventas\n✅ Sin contratos ni suscripciones\n\n¿Hay algo más en lo que te pueda ayudar?"
  },
  {
    patrones: ["registrar", "registro", "como me registro", "crear cuenta", "darme de alta", "publicar empresa", "publicar mi empresa"],
    respuesta: "Registrarte es muy fácil y tarda menos de 5 minutos 😊\n\nSi sos **proveedor**:\n1️⃣ Tocá 'Registrarse' arriba a la derecha\n2️⃣ Completá los datos de tu empresa\n3️⃣ Agregá tu WhatsApp y productos\n4️⃣ Tu perfil queda publicado al instante\n\nSi sos **comprador**:\n1️⃣ Tocá 'Registrarse'\n2️⃣ Elegí 'Busco proveedores'\n3️⃣ Listo, ya podés buscar y contactar\n\n¿Sos proveedor o comprador?"
  },
  {
    patrones: ["buscar proveedor", "busco proveedor", "encontrar proveedor", "como busco", "donde busco", "ver proveedores"],
    respuesta: "Buscar proveedores en MayorLink es muy simple 🔍\n\n**Opción 1:** Usá el buscador en la home — escribí el producto o rubro que necesitás\n\n**Opción 2:** Filtrá por categoría (Indumentaria, Electronica, Hogar, etc) y provincia\n\n**Opción 3:** Entrá directo a /busqueda y explorá todos los proveedores\n\nEn cada resultado podés ver el perfil completo con productos, precios y condiciones, y contactar directo por WhatsApp 📱\n\n¿Qué tipo de proveedor estás buscando?"
  },
  {
    patrones: ["confiable", "seguro", "verificado", "como se que es real", "estafa", "fraude", "confiar"],
    respuesta: "Buena pregunta, la confianza es clave 🔒\n\nEn MayorLink tenés varias formas de verificar a un proveedor:\n\n⭐ **Reseñas verificadas** — opiniones reales de compradores que ya compraron\n✅ **Badge Verificado** — proveedores que pasaron nuestro proceso de verificación\n🏆 **Badge Fundador** — los primeros 100 proveedores de la plataforma\n📊 **Métricas públicas** — podés ver cuántas visitas y contactos tiene el proveedor\n\nAdemás, al contactar por WhatsApp podés pedir referencias, ver el negocio en persona o hacer un pedido de prueba antes de comprar en cantidad.\n\n¿Necesitás ayuda para evaluar algún proveedor?"
  },
  {
    patrones: ["negociar", "precio", "descuento", "oferta", "regatear", "precio especial"],
    respuesta: "¡Claro que sí! En MayorLink el contacto es directo 💪\n\nCuando encontrás un proveedor que te interesa, lo contactás por WhatsApp y ahí podés:\n\n💬 Preguntar por precios especiales para volumen\n📦 Negociar el pedido mínimo\n🚚 Consultar condiciones de envío\n💳 Acordar formas de pago\n\nTodo se negocia directamente entre vos y el proveedor, sin intermediarios. Esa es la ventaja de MayorLink — contacto real y directo.\n\n¿Querés que te ayude a encontrar proveedores de alguna categoría?"
  },
  {
    patrones: ["solicitud", "publicar solicitud", "pedir", "necesito", "busco producto", "como publico"],
    respuesta: "Las solicitudes de compra son una de las mejores funciones de MayorLink 📋\n\n¿Cómo funciona?\n1️⃣ Andá a la sección 'Solicitudes'\n2️⃣ Tocá '+ Publicar solicitud'\n3️⃣ Describí lo que necesitás (producto, cantidad, presupuesto)\n4️⃣ Los proveedores de esa categoría ven tu solicitud\n5️⃣ Te envían propuestas con precio y tiempo de entrega\n6️⃣ Solo vos ves todas las propuestas — comparás y elegís el mejor\n\nEs ideal cuando no encontrás lo que buscás o querés recibir varias cotizaciones al mismo tiempo 💡\n\n¿Querés publicar una solicitud ahora?"
  },
  {
    patrones: ["no encuentro", "no aparece", "no hay proveedores", "no hay resultados"],
    respuesta: "No te preocupes, tenemos una solución perfecta para eso 💡\n\nSi no encontrás proveedores de lo que buscás, publicá una **solicitud de compra**:\n\n1️⃣ Describís exactamente lo que necesitás\n2️⃣ Los proveedores de esa categoría te ven y te contactan\n3️⃣ Recibís propuestas directamente\n\nTambién podés probar buscar con términos más generales — por ejemplo, en vez de 'remera algodón talle M' probá con 'indumentaria' o 'textil'.\n\n¿Querés que te ayude a publicar una solicitud?"
  },
  {
    patrones: ["cuanto tarda", "tiempo de respuesta", "cuando responde", "rapido", "demora"],
    respuesta: "El tiempo de respuesta depende de cada proveedor 📱\n\nEn general, la mayoría responde en el mismo día — muchos en menos de una hora porque reciben el mensaje directo en su WhatsApp personal.\n\nAlgunos consejos para obtener respuesta más rápido:\n✅ Enviá el mensaje en horario comercial (9am - 6pm)\n✅ Sé específico con lo que necesitás\n✅ Mencioná la cantidad que buscás — los proveedores priorizan consultas concretas\n\n¿Estás teniendo problemas para contactar a algún proveedor?"
  },
  {
    patrones: ["cuanto cuesta publicar", "publicar gratis", "es gratis para proveedores", "como proveedor"],
    respuesta: "Publicar tu empresa en MayorLink es completamente gratis 🎉\n\nY no es gratis por un tiempo limitado — es gratis para siempre. No hay plan pago, no hay comisiones, no hay contratos.\n\nAdemás, si te registrás ahora podés obtener el **badge de Fundador** que es permanente y le muestra a los compradores que sos uno de los primeros proveedores de la plataforma 🏆\n\n¿Querés registrar tu empresa ahora?"
  },
  {
    patrones: ["aparecer primero", "destacar", "mas visitas", "mas consultas", "como mejoro", "ranking"],
    respuesta: "Para aparecer primero en los resultados, lo más importante es tener el perfil completo 📊\n\nNuestro algoritmo prioriza los perfiles con:\n✅ Logo subido\n✅ Descripción detallada\n✅ Categoría definida\n✅ WhatsApp cargado\n✅ Productos con fotos\n✅ Reseñas de compradores\n✅ Pedido mínimo y formas de pago informadas\n\nEn tu panel podés ver el % de completitud de tu perfil y exactamente qué te falta completar.\n\n¿Querés que te diga cómo mejorar tu perfil?"
  },
  {
    patrones: ["subir productos", "agregar productos", "cargar productos", "como subo"],
    respuesta: "Cargar productos es muy fácil y hacen una gran diferencia 📦\n\n1️⃣ Entrá a tu panel (/panel)\n2️⃣ Tocá 'Mis productos'\n3️⃣ Tocá '+ Agregar producto'\n4️⃣ Completá: nombre, descripción y precios (por unidad, docena o caja)\n5️⃣ Subí hasta **6 fotos** por producto\n6️⃣ Guardá y listo — aparece en tu perfil al instante\n\n💡 Tip: los proveedores con fotos reales reciben hasta 3 veces más consultas que los que no tienen.\n\n¿Necesitás ayuda con algún paso?"
  },
  {
    patrones: ["visitas", "estadisticas", "metricas", "cuanta gente", "mis numeros", "mi panel"],
    respuesta: "En tu panel de proveedor podés ver todas tus métricas en tiempo real 📊\n\n📈 **Visitas** — cuántas personas entraron a tu perfil\n📱 **Clicks en WhatsApp** — cuántos te contactaron\n📉 **Tasa de contacto** — qué % de visitantes te escribió\n⭐ **Reseñas** — promedio de estrellas\n✅ **Completitud** — qué tan completo está tu perfil\n\nEntrar a /panel para verlas. Los datos se actualizan en tiempo real.\n\n¿Querés saber cómo mejorar tus métricas?"
  },
  {
    patrones: ["badge", "fundador", "verificado", "que es el badge", "para que sirve el badge"],
    respuesta: "Los badges son señales de confianza que aparecen en tu perfil 🏆\n\n**Badge Fundador** 🏆\nPara los primeros 100 proveedores en registrarse. Es permanente y demuestra que sos parte de quienes construyeron la plataforma desde el inicio. Genera mucha confianza en los compradores.\n\n**Badge Verificado** ✅\nPara proveedores que completaron el proceso de verificación. Próximamente disponible.\n\nAmbos badges aparecen en los resultados de búsqueda y en tu perfil, ayudándote a destacar entre el resto.\n\n¿Querés registrarte para obtener el badge de Fundador?"
  },
  {
    patrones: ["editar perfil", "cambiar datos", "actualizar", "modificar", "editar mi"],
    respuesta: "Para editar tu perfil es muy simple ✏️\n\n1️⃣ Entrá a tu panel en /panel\n2️⃣ Tocá 'Editar perfil'\n3️⃣ Modificá lo que necesites\n4️⃣ Guardá los cambios\n\nPodés editar: nombre, descripción, categoría, provincia, ciudad, WhatsApp, Instagram, pedido mínimo, formas de pago e información de envíos.\n\nTambién podés subir o cambiar tu logo directamente desde el panel tocando el botón + en tu foto de perfil.\n\n¿Necesitás ayuda con algún dato específico?"
  },
  {
    patrones: ["provincias", "donde funciona", "todo el pais", "mi provincia", "disponible"],
    respuesta: "MayorLink funciona en **todo el país** 🇦🇷\n\nTenemos proveedores y compradores en las 24 provincias:\nBuenos Aires, CABA, Córdoba, Santa Fe, Mendoza, Tucumán, Salta, Entre Ríos, Neuquén, Río Negro, Chaco, Corrientes, Misiones, Santiago del Estero, San Juan, San Luis, La Pampa, Catamarca, La Rioja, Jujuy, Formosa, Chubut, Santa Cruz y Tierra del Fuego.\n\nPodés filtrar la búsqueda por provincia para encontrar proveedores cerca tuyo 📍\n\n¿De qué provincia sos?"
  },
  {
    patrones: ["app", "aplicacion", "android", "ios", "play store", "app store", "descargar"],
    respuesta: "Por ahora MayorLink es una web app — no hay app en las tiendas todavía 📱\n\nPero la buena noticia es que funciona perfecto desde el celular. Podés acceder desde el navegador de tu teléfono y se ve igual que una app nativa.\n\nEn el futuro vamos a lanzar la app oficial. Por ahora, accedé desde:\n👉 mayorlink.vercel.app\n\n¿Necesitás ayuda con algo más?"
  },
  {
    patrones: ["hablar con alguien", "contacto", "soporte", "ayuda", "problema", "no funciona", "error"],
    respuesta: "Lamentablemente todavía no tenemos soporte por chat en vivo, pero estamos trabajando en eso 🛠️\n\nPor ahora, si tenés algún problema:\n\n📧 Podés escribirnos a través del asistente — contame exactamente qué problema tenés y veo cómo ayudarte\n\n🔄 Si es un error técnico, intentá recargar la página o cerrar sesión y volver a entrar\n\n¿Cuál es el problema específico que estás teniendo? Veo si puedo resolverlo ahora mismo."
  },
  {
    patrones: ["favorito", "guardar", "lista", "guardados"],
    respuesta: "Podés guardar proveedores como favoritos para encontrarlos rápido después ❤️\n\n¿Cómo funciona?\n1️⃣ Entrá al perfil de cualquier proveedor\n2️⃣ Tocá el botón '🤍 Guardar'\n3️⃣ Queda guardado como '❤️ Guardado'\n\nTus favoritos aparecen en tu panel de comprador en /panel-comprador. Así podés tener una lista de proveedores de confianza para consultar cuando los necesités.\n\n¿Querés guardar algún proveedor ahora?"
  },
  {
    patrones: ["resena", "opinion", "calificacion", "puntaje", "estrella", "comentario"],
    respuesta: "Las reseñas son fundamentales para generar confianza en la plataforma ⭐\n\n**Para dejar una reseña:**\n1️⃣ Entrá al perfil del proveedor\n2️⃣ Tocá 'Dejar reseña'\n3️⃣ Elegí de 1 a 5 estrellas\n4️⃣ Escribí tu experiencia\n\nLas reseñas aparecen con el badge de **Verificada** porque confirmamos que sos un usuario real de la plataforma.\n\n**Para proveedores:** las reseñas son oro — ayudan a aparecer mejor en los resultados y generan más confianza. No dudes en pedirles a tus clientes que dejen una reseña.\n\n¿Querés dejar una reseña de algún proveedor?"
  },
  {
    patrones: ["mensaje", "chat", "hablar con proveedor", "contactar proveedor", "escribir"],
    respuesta: "Tenés dos formas de contactar a un proveedor en MayorLink 💬\n\n**Por WhatsApp** (recomendado)\nTocás el botón verde en el perfil del proveedor y se abre WhatsApp con un mensaje predeterminado. Es el método más rápido y el que más usan.\n\n**Por chat interno**\nTocás el botón 'Mensaje' en el perfil del proveedor. Te manda a /mensajes donde podés chatear dentro de la plataforma.\n\n¿Preferís contactar por WhatsApp o por el chat interno?"
  },
  {
    patrones: ["whatsapp", "numero", "telefono", "contacto directo"],
    respuesta: "El contacto por WhatsApp es el corazón de MayorLink 📱\n\nCuando tocás 'WhatsApp' en el perfil de un proveedor:\n✅ Se abre WhatsApp directo con el número del proveedor\n✅ El mensaje ya viene predeterminado con tu nombre y el nombre del proveedor\n✅ Sin intermediarios — hablás directo con quien toma las decisiones\n\nEso es lo que diferencia a MayorLink de otras plataformas: acá los datos de contacto son visibles y el trato es directo.\n\n¿Necesitás ayuda para contactar a algún proveedor?"
  },
];

const RESPUESTA_DEFAULT = "Hmm, no estoy seguro de entender bien tu consulta 😅\n\nPuedo ayudarte con:\n• Buscar o registrar proveedores\n• Publicar solicitudes de compra\n• Subir productos al catálogo\n• Entender cómo funciona la plataforma\n• Cualquier duda sobre MayorLink\n\n¿Sobre qué tema necesitás ayuda?";

function obtenerRespuesta(input: string): string {
  const texto = input.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  for (const item of RESPUESTAS) {
    if (item.patrones.some(p => texto.includes(p))) {
      return item.respuesta;
    }
  }
  return RESPUESTA_DEFAULT;
}

export default function AsistenteFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { rol: "assistant", texto: "Hola! Soy el asistente de MayorLink 👋\n\n¿En qué te puedo ayudar hoy?" }
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
        <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-2xl w-80 flex flex-col overflow-hidden" style={{height: "480px"}}>
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
            <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-white text-xl leading-none font-black">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {mensajes.map((m, i) => (
              <div key={i} className={"flex " + (m.rol === "user" ? "justify-end" : "justify-start")}>
                <div className={"max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap " + (m.rol === "user" ? "bg-black text-white rounded-tr-sm" : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-sm")}>
                  {m.texto}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          <div className="border-t border-gray-100 p-3">
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {["Buscar proveedores", "Registrar empresa", "Es gratis?", "Como funciona?"].map((s) => (
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
          Necesitas ayuda?
        </div>
      )}
    </div>
  );
}