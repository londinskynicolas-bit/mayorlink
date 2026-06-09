"use client";
import { useState, useRef, useEffect } from "react";

interface Mensaje {
  rol: "user" | "assistant";
  texto: string;
}

const RESPUESTAS: { patrones: string[]; respuesta: string }[] = [
  {
    patrones: ["hola", "buenas", "buen dia", "buenas tardes", "buenas noches", "hey", "que tal", "como estas", "buenos dias"],
    respuesta: "Hola! Bienvenido a MayorLink 👋\n\nSoy el asistente virtual y estoy aca para ayudarte con lo que necesites. Podes buscar proveedores, registrar tu empresa, publicar solicitudes o consultar cualquier duda.\n\n¿Sos comprador o proveedor?"
  },
  {
    patrones: ["soy comprador", "comprador", "busco proveedores", "quiero comprar", "necesito comprar", "soy comerciante", "soy revendedor"],
    respuesta: "Perfecto, bienvenido comprador! 🛒\n\nEn MayorLink podes:\n\n🔍 **Buscar proveedores** por categoria y provincia en /busqueda\n📋 **Publicar solicitudes** — conta lo que necesitas y recibis propuestas de proveedores\n❤️ **Guardar favoritos** — guarda los proveedores que mas te gusten\n💬 **Contactar directo** — por WhatsApp o chat interno\n📊 **Ver tu panel** — gestioná tus solicitudes y propuestas en /panel-comprador\n\nTodo gratis. ¿Por donde queres empezar?"
  },
  {
    patrones: ["soy proveedor", "proveedor", "tengo empresa", "quiero vender", "vendo", "soy fabricante", "soy importador", "soy distribuidor"],
    respuesta: "Excelente, bienvenido proveedor! 🏭\n\nEn MayorLink podes publicar tu empresa gratis y empezar a recibir consultas de comerciantes de todo el pais.\n\nRegistrarte tarda menos de 5 minutos:\n1️⃣ Toca 'Registrarse' arriba a la derecha\n2️⃣ Completa los datos de tu empresa (nombre, categoria, provincia)\n3️⃣ Agrega tu WhatsApp y condiciones mayoristas\n4️⃣ Subi productos con fotos\n5️⃣ Tu perfil queda publicado al instante\n\nEn tu panel podes ver visitas, clicks en WhatsApp, propuestas recibidas y mucho mas 📊\n\n🏆 Los primeros 100 proveedores obtienen el badge de Fundador permanente. ¿Empezamos?"
  },
  {
    patrones: ["que es mayorlink", "para que sirve", "como funciona esto", "que hace mayorlink", "que es esto"],
    respuesta: "MayorLink es la red comercial B2B mayorista mas completa de Argentina 🇦🇷\n\nConectamos compradores (comerciantes, revendedores, emprendedores) con proveedores mayoristas (fabricantes, importadores, distribuidores) de todo el pais.\n\n¿Como funciona?\n🔍 Los compradores buscan por categoria y provincia\n📱 Contactan directo por WhatsApp sin intermediarios\n📋 Publican solicitudes y reciben propuestas\n🏭 Los proveedores muestran su catalogo completo con fotos y precios\n\nSin comisiones, sin contratos, 100% gratis.\n\n¿Sos comprador o proveedor?"
  },
  {
    patrones: ["gratis", "costo", "precio", "cobran", "comision", "cuanto sale", "cuanto cuesta", "hay que pagar"],
    respuesta: "100% gratis 🎉 En serio, no hay letra chica.\n\n✅ Buscar proveedores: GRATIS\n✅ Registrar tu empresa: GRATIS\n✅ Publicar productos: GRATIS\n✅ Publicar solicitudes: GRATIS\n✅ Contactar por WhatsApp: GRATIS\n✅ Sin comisiones por ventas\n✅ Sin contratos ni suscripciones\n\nSiempre va a ser gratis para los proveedores fundadores. ¿Hay algo mas en lo que te pueda ayudar?"
  },
  {
    patrones: ["registrar", "registro", "como me registro", "crear cuenta", "darme de alta", "publicar empresa", "publicar mi empresa", "como publico"],
    respuesta: "Registrarte es muy facil y tarda menos de 5 minutos 😊\n\nSi sos **proveedor**:\n1️⃣ Toca 'Registrarse' arriba a la derecha\n2️⃣ Completa 3 pasos: datos de empresa, contacto y condiciones\n3️⃣ Elegi tu provincia y ciudad\n4️⃣ Agrega productos con fotos\n5️⃣ Tu perfil queda publicado al instante\n\nSi sos **comprador**:\n1️⃣ Toca 'Registrarse'\n2️⃣ Elegi 'Busco proveedores'\n3️⃣ Listo, ya podes buscar y contactar\n\n¿Sos proveedor o comprador?"
  },
  {
    patrones: ["buscar proveedor", "busco proveedor", "encontrar proveedor", "como busco", "donde busco", "ver proveedores", "como encuentro"],
    respuesta: "Buscar proveedores en MayorLink es muy simple 🔍\n\n**Opcion 1:** Usa el buscador en la home — escribi el producto o rubro que necesitas\n\n**Opcion 2:** Filtra por categoria (Indumentaria, Electronica, Hogar, etc) y provincia en /busqueda\n\n**Opcion 3:** Toca cualquier categoria en la home y te lleva directo a los proveedores de ese rubro\n\n**Opcion 4:** Busca por provincia — en la home hay una seccion para encontrar proveedores cerca tuyo 📍\n\nEn cada resultado podes ver el perfil completo con productos, precios y condiciones, y contactar directo por WhatsApp.\n\n¿Que tipo de proveedor estas buscando?"
  },
  {
    patrones: ["confiable", "seguro", "verificado", "como se que es real", "estafa", "fraude", "confiar", "es de confianza"],
    respuesta: "Buena pregunta, la confianza es clave 🔒\n\nEn MayorLink tenes varias formas de verificar a un proveedor:\n\n⭐ **Reseñas verificadas** — opiniones reales de compradores que ya compraron\n✅ **Badge Verificado** — proveedores que pasaron nuestro proceso de verificacion\n🏆 **Badge Fundador** — los primeros 100 proveedores de la plataforma\n📊 **Metricas publicas** — podes ver cuantas visitas y contactos tiene el proveedor\n💬 **Chat interno** — podes hablar con el proveedor antes de comprar\n\nAdemas, al contactar por WhatsApp podes pedir referencias o hacer un pedido de prueba antes de comprar en cantidad.\n\n¿Necesitas ayuda para evaluar algun proveedor?"
  },
  {
    patrones: ["negociar", "descuento", "oferta", "regatear", "precio especial", "mejor precio"],
    respuesta: "Claro que si! En MayorLink el contacto es directo 💪\n\nCuando encontras un proveedor que te interesa, lo contactas por WhatsApp y ahi podes:\n\n💬 Preguntar por precios especiales para volumen\n📦 Negociar el pedido minimo\n🚚 Consultar condiciones de envio\n💳 Acordar formas de pago\n🤝 Cerrar el trato como mas te convenga\n\nTodo se negocia directamente entre vos y el proveedor, sin intermediarios. Esa es la ventaja de MayorLink.\n\n¿Queres que te ayude a encontrar proveedores de alguna categoria?"
  },
  {
    patrones: ["solicitud", "publicar solicitud", "como publico una solicitud", "pedir cotizacion", "necesito productos", "busco productos"],
    respuesta: "Las solicitudes de compra son una de las mejores funciones de MayorLink 📋\n\n¿Como funciona?\n1️⃣ Anda a /solicitudes\n2️⃣ Toca '+ Publicar solicitud'\n3️⃣ Describe lo que necesitas (producto, cantidad, presupuesto)\n4️⃣ Los proveedores de esa categoria ven tu solicitud\n5️⃣ Te envian propuestas privadas con precio y tiempo de entrega\n6️⃣ Solo vos ves todas las propuestas — comparas y eleges el mejor\n7️⃣ Cuando conseguis lo que buscabas, marcas la solicitud como resuelta\n\nEs ideal cuando no encontras lo que buscas o queres recibir varias cotizaciones al mismo tiempo 💡\n\n¿Queres publicar una solicitud ahora?"
  },
  {
    patrones: ["no encuentro", "no aparece", "no hay proveedores", "no hay resultados", "no encuentro lo que busco"],
    respuesta: "No te preocupes, tenemos una solucion perfecta para eso 💡\n\nSi no encontras proveedores de lo que buscas, publica una **solicitud de compra**:\n\n1️⃣ Describes exactamente lo que necesitas\n2️⃣ Los proveedores de esa categoria te ven y te contactan\n3️⃣ Recibes propuestas directamente\n\nTambien podes probar buscar con terminos mas generales — por ejemplo, en vez de 'remera algodon talle M' proba con 'indumentaria' o 'textil'.\n\n¿Queres que te ayude a publicar una solicitud?"
  },
  {
    patrones: ["cuanto tarda", "tiempo de respuesta", "cuando responde", "rapido", "demora", "tarda en responder"],
    respuesta: "El tiempo de respuesta depende de cada proveedor 📱\n\nEn general, la mayoria responde el mismo dia — muchos en menos de una hora porque reciben el mensaje directo en su WhatsApp personal.\n\nAlgunos consejos para obtener respuesta mas rapido:\n✅ Envia el mensaje en horario comercial (9am - 6pm)\n✅ Se especifico con lo que necesitas\n✅ Menciona la cantidad que buscas — los proveedores priorizan consultas concretas\n\n¿Estas teniendo problemas para contactar a algun proveedor?"
  },
  {
    patrones: ["aparecer primero", "destacar", "mas visitas", "mas consultas", "como mejoro mi perfil", "ranking", "posicion"],
    respuesta: "Para aparecer primero en los resultados, lo mas importante es tener el perfil completo 📊\n\nNuestro sistema prioriza los perfiles con:\n✅ Logo subido\n✅ Descripcion detallada\n✅ Categoria definida\n✅ WhatsApp cargado\n✅ Productos con fotos reales\n✅ Reseñas de compradores\n✅ Pedido minimo y formas de pago informadas\n✅ Informacion de envios\n\nEn tu panel (/panel) podes ver el % de completitud de tu perfil y exactamente que te falta completar.\n\n¿Queres que te explique como mejorar algun punto especifico?"
  },
  {
    patrones: ["subir productos", "agregar productos", "cargar productos", "como subo mis productos", "como agrego"],
    respuesta: "Cargar productos hace una gran diferencia en la cantidad de consultas que recibes 📦\n\n1️⃣ Entra a tu panel en /panel\n2️⃣ Toca 'Mis productos'\n3️⃣ Toca '+ Agregar'\n4️⃣ Completa: nombre, descripcion y precios (por unidad, docena o caja)\n5️⃣ Agrega material, talles y stock si aplica\n6️⃣ Subi hasta **6 fotos** por producto\n7️⃣ Guarda — aparece en tu perfil al instante\n\n💡 Tip: los proveedores con fotos reales reciben hasta 3 veces mas consultas.\n\n¿Necesitas ayuda con algun paso?"
  },
  {
    patrones: ["visitas", "estadisticas", "metricas", "cuanta gente", "mis numeros", "ver mis datos", "clicks"],
    respuesta: "En tu panel de proveedor podes ver todas tus metricas en tiempo real 📊\n\n📈 **Visitas** — cuantas personas entraron a tu perfil\n📱 **Clicks en WhatsApp** — cuantos te contactaron\n📉 **Tasa de contacto** — que % de visitantes te escribio\n⭐ **Reseñas** — promedio de estrellas\n✅ **Completitud** — que tan completo esta tu perfil\n\nEntra a /panel para verlas. Los datos se actualizan en tiempo real.\n\n¿Queres saber como mejorar tus metricas?"
  },
  {
    patrones: ["badge", "fundador", "verificado", "que es el badge", "para que sirve el badge", "insignia"],
    respuesta: "Los badges son señales de confianza que aparecen en tu perfil 🏆\n\n**Badge Fundador** 🏆\nPara los primeros 100 proveedores en registrarse. Es permanente y demuestra que sos parte de quienes construyeron la plataforma desde el inicio. Genera mucha confianza en los compradores.\n\n**Badge Verificado** ✅\nPara proveedores que completaron el proceso de verificacion de identidad.\n\nAmbos badges aparecen en los resultados de busqueda y en tu perfil, ayudandote a destacar entre el resto.\n\n¿Queres registrarte para obtener el badge de Fundador antes de que se agoten los 100 lugares?"
  },
  {
    patrones: ["editar perfil", "cambiar datos", "actualizar perfil", "modificar", "editar mi perfil", "cambiar informacion"],
    respuesta: "Para editar tu perfil es muy simple ✏️\n\n1️⃣ Entra a tu panel en /panel\n2️⃣ Toca 'Editar perfil'\n3️⃣ Modifica lo que necesites\n4️⃣ Guarda los cambios\n\nPodes editar: nombre, descripcion, categoria, provincia, ciudad, WhatsApp, Instagram, pedido minimo, formas de pago e informacion de envios.\n\nTambien podes subir o cambiar tu logo directamente desde el panel tocando el boton + en tu foto de perfil.\n\n¿Necesitas ayuda con algun dato especifico?"
  },
  {
    patrones: ["provincias", "donde funciona", "todo el pais", "mi provincia", "disponible en", "funciona en"],
    respuesta: "MayorLink funciona en **todo el pais** 🇦🇷\n\nTenemos proveedores y compradores en las 24 provincias de Argentina. Podes filtrar la busqueda por provincia para encontrar proveedores cerca tuyo 📍\n\nTambien podes buscar por categoria + provincia directamente, por ejemplo: 'Indumentaria en Buenos Aires' o 'Electronica en Cordoba'.\n\n¿De que provincia sos?"
  },
  {
    patrones: ["app", "aplicacion", "android", "ios", "play store", "app store", "descargar", "bajar la app"],
    respuesta: "Por ahora MayorLink es una web app — todavia no hay app en las tiendas 📱\n\nPero la buena noticia es que funciona perfecto desde el celular. Podes acceder desde el navegador de tu telefono y se ve igual que una app nativa — rapido, responsive y sin descargar nada.\n\nEn el futuro vamos a lanzar la app oficial. Por ahora, accede desde:\n👉 mayorlink.vercel.app\n\n¿Necesitas ayuda con algo mas?"
  },
  {
    patrones: ["hablar con alguien", "soporte", "ayuda humana", "problema tecnico", "no funciona", "error en la pagina"],
    respuesta: "Lamentablemente todavia no tenemos soporte por chat en vivo, pero estamos trabajando en eso 🛠️\n\nSi tenes algun problema tecnico:\n🔄 Intenta recargar la pagina\n🔄 Cerrá sesion y volvé a entrar\n🔄 Proba desde otro navegador\n\nSi el problema persiste, contame exactamente que esta pasando y veo como ayudarte desde aca.\n\n¿Cual es el problema especifico que estas teniendo?"
  },
  {
    patrones: ["favorito", "guardar proveedor", "lista de favoritos", "guardados", "como guardo"],
    respuesta: "Podes guardar proveedores como favoritos para encontrarlos rapido despues ❤️\n\n¿Como funciona?\n1️⃣ Entra al perfil de cualquier proveedor\n2️⃣ Toca el boton '🤍 Guardar'\n3️⃣ Queda guardado como '❤️ Guardado'\n\nTus favoritos aparecen en tu panel de comprador en /panel-comprador. Asi podes tener una lista de proveedores de confianza para consultar cuando los necesites.\n\n¿Ya guardaste algun proveedor?"
  },
  {
    patrones: ["resena", "opinion", "calificacion", "puntaje", "estrella", "comentario", "como dejo una resena"],
    respuesta: "Las reseñas son fundamentales para generar confianza ⭐\n\n**Para dejar una reseña:**\n1️⃣ Entra al perfil del proveedor\n2️⃣ Toca 'Reseña' en los botones de contacto\n3️⃣ Elegi de 1 a 5 estrellas\n4️⃣ Escribi tu experiencia\n\nLas reseñas aparecen con el badge de **Verificada** porque confirmamos que sos un usuario real de la plataforma.\n\n**Para proveedores:** no dudes en pedirles a tus clientes que dejen una reseña — ayudan mucho a aparecer mejor en los resultados.\n\n¿Queres dejar una reseña de algun proveedor?"
  },
  {
    patrones: ["mensaje", "chat", "hablar con proveedor", "enviar mensaje", "como mando un mensaje"],
    respuesta: "Tenes dos formas de contactar a un proveedor en MayorLink 💬\n\n**Por WhatsApp** (recomendado)\nTocas el boton verde en el perfil del proveedor. Se abre WhatsApp con un mensaje predeterminado que incluye tu nombre y el nombre del proveedor. Es el metodo mas rapido.\n\n**Por chat interno**\nTocas el boton '💬 Mensaje' en el perfil. Te manda a /mensajes donde podes chatear dentro de la plataforma y ver el historial de conversaciones.\n\n¿Preferis contactar por WhatsApp o por el chat interno?"
  },
  {
    patrones: ["whatsapp", "numero de whatsapp", "contacto directo", "como contacto"],
    respuesta: "El contacto por WhatsApp es el corazon de MayorLink 📱\n\nCuando tocas 'WhatsApp' en el perfil de un proveedor:\n✅ Se abre WhatsApp directo con el numero del proveedor\n✅ El mensaje ya viene predeterminado con tu nombre y el nombre del proveedor\n✅ Sin intermediarios — hablas directo con quien toma las decisiones\n\nEso es lo que diferencia a MayorLink de otras plataformas: los datos de contacto son visibles y el trato es directo y sin comisiones.\n\n¿Necesitas ayuda para contactar a algun proveedor?"
  },
  {
    patrones: ["panel", "mi panel", "donde veo mis datos", "gestion", "administrar"],
    respuesta: "En MayorLink tenes dos paneles segun tu rol 📊\n\n**Panel Proveedor** (/panel)\n• Metricas reales: visitas, clicks WA, tasa de contacto\n• Gestion de productos\n• Edicion de perfil\n• Score de completitud\n• Acceso al panel comprador\n\n**Panel Comprador** (/panel-comprador)\n• Solicitudes activas y propuestas recibidas\n• Proveedores favoritos guardados\n• Historial de actividad\n\nCualquier usuario puede usar los dos paneles — podes ser proveedor y comprador al mismo tiempo.\n\n¿Cual de los dos paneles necesitas?"
  },
  {
    patrones: ["como funciona el chat", "mensajes internos", "ver mensajes", "notificaciones"],
    respuesta: "El chat interno de MayorLink funciona asi 💬\n\n1️⃣ Entra al perfil de un proveedor\n2️⃣ Toca el boton '💬 Mensaje'\n3️⃣ Te lleva directo a la conversacion en /mensajes\n4️⃣ Escribi tu mensaje y mandalo\n\nCuando tenes mensajes sin leer, aparece un numero en el navbar sobre 'Mensajes' para que no te pierdas nada.\n\nEl historial de todas tus conversaciones queda guardado en /mensajes.\n\n¿Necesitas ayuda con algo mas?"
  },
];

const RESPUESTA_DEFAULT = "Hmm, no estoy seguro de entender bien tu consulta 😅\n\nPuedo ayudarte con:\n• Buscar o registrar proveedores\n• Publicar solicitudes de compra\n• Subir productos al catalogo\n• Entender como funciona la plataforma\n• Favoritos, reseñas, panel y metricas\n\nEscribime tu pregunta de otra forma y veo como ayudarte!";

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
    { rol: "assistant", texto: "Hola! Soy el asistente de MayorLink 👋\n\nPuedo ayudarte a buscar proveedores, registrar tu empresa, publicar solicitudes o responder cualquier consulta sobre la plataforma.\n\n¿En que te puedo ayudar hoy?" }
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