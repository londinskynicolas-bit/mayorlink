import Navbar from "../../components/Navbar";

export default function ParaProveedores() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="bg-black text-white px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-emerald-500 text-black text-xs font-black px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            Para proveedores mayoristas
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6 tracking-tight">
            Llega a miles de<br />
            <span className="text-emerald-400">comerciantes y revendedores</span><br />
            de todo el pais
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Publica tu empresa gratis, muestra tus productos y recibe consultas directas por WhatsApp. Sin comisiones, sin intermediarios.
          </p>
          <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-10 py-5 rounded-2xl text-lg transition-colors">
            Publicar mi empresa gratis
          </a>
          <p className="text-gray-600 text-xs mt-4">
            Los primeros 100 proveedores obtienen el badge de Fundador permanente
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-emerald-500 px-6 py-6">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4 text-center">
          {[
            { num: "10.000+", label: "Compradores activos" },
            { num: "100%", label: "Gratis para publicar" },
            { num: "0%", label: "Comision por venta" },
            { num: "24/7", label: "Tu perfil visible" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-black">{s.num}</div>
              <div className="text-xs font-bold text-black opacity-60 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-black text-center mb-4 uppercase tracking-tight">
            Por que publicar en MayorLink
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            La plataforma B2B mayorista mas completa de Argentina
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { emoji: "📦", title: "Mostra tu catalogo completo", desc: "Publica todos tus productos con fotos, precios por unidad, docena y caja. Los compradores ven exactamente lo que ofreces." },
              { emoji: "💬", title: "Contacto directo por WhatsApp", desc: "Los compradores te contactan directo a tu WhatsApp. Sin formularios complicados, sin intermediarios. Vos manejás tu negocio." },
              { emoji: "📍", title: "Aparece en busquedas locales", desc: "Cuando alguien busca proveedores en tu ciudad o provincia, tu empresa aparece primero. SEO optimizado para Google." },
              { emoji: "⭐", title: "Badge de Proveedor Fundador", desc: "Los primeros 100 proveedores en registrarse obtienen el badge de Fundador permanente. Mayor visibilidad para siempre." },
              { emoji: "📊", title: "Estadisticas de tu perfil", desc: "Ve cuantas personas vieron tu empresa, cuantos hicieron clic en tu WhatsApp y como esta creciendo tu visibilidad." },
              { emoji: "🔒", title: "Verificacion de confianza", desc: "Obtene el badge de proveedor verificado y genera mas confianza en los compradores. Mas consultas, mas ventas." },
            ].map((b) => (
              <div key={b.title} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-black transition-all">
                <div className="text-3xl mb-4">{b.emoji}</div>
                <h3 className="font-black text-black mb-2 text-sm">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-black text-center mb-14 uppercase tracking-tight">
            Como funciona
          </h2>
          <div className="flex flex-col gap-6">
            {[
              { num: "1", title: "Registra tu empresa gratis", desc: "Completa el formulario con los datos de tu empresa, categoria, provincia y condiciones de venta. Tarda menos de 5 minutos." },
              { num: "2", title: "Publica tus productos", desc: "Agrega fotos reales, precios mayoristas y descripcion detallada de cada producto. Tu catalogo online disponible las 24 horas." },
              { num: "3", title: "Recibe consultas de compradores", desc: "Los comerciantes y revendedores de todo el pais van a poder encontrarte y contactarte directamente por WhatsApp." },
            ].map((paso) => (
              <div key={paso.num} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0">
                  {paso.num}
                </div>
                <div>
                  <h3 className="font-black text-black mb-1">{paso.title}</h3>
                  <p className="text-sm text-gray-500">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIEN ES */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-black text-center mb-14 uppercase tracking-tight">
            Para quien es MayorLink
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { emoji: "🏭", label: "Fabricantes" },
              { emoji: "🚢", label: "Importadores" },
              { emoji: "🏪", label: "Distribuidores" },
              { emoji: "🧵", label: "Productores" },
            ].map((t) => (
              <div key={t.label} className="border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-black transition-all">
                <div className="text-4xl mb-3">{t.emoji}</div>
                <div className="font-black text-black text-sm">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-black px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">
            Listo para sumar tu empresa?
          </h2>
          <p className="text-gray-400 mb-10">
            Gratis para siempre. Sin comisiones. Sin contratos. Solo mas clientes.
          </p>
          <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-10 py-5 rounded-2xl text-lg transition-colors">
            Publicar mi empresa gratis
          </a>
          <p className="text-gray-600 text-xs mt-6">
            Ya somos la red mayorista B2B mas grande de Argentina
          </p>
        </div>
      </section>
    </div>
  );
}