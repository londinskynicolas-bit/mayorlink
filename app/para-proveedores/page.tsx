import Navbar from "../../components/Navbar";

export default function ParaProveedores() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-black text-white px-4 md:px-6 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-emerald-500 text-black text-xs font-black px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            Para proveedores mayoristas
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tight">
            Llega a miles de<br />
            <span className="text-emerald-400">comerciantes y revendedores</span><br />
            de todo el pais
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Publica tu empresa gratis, muestra tus productos y recibe consultas directas por WhatsApp. Sin comisiones, sin intermediarios.
          </p>
          <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl text-base md:text-lg transition-colors">
            Publicar mi empresa gratis
          </a>
          <p className="text-gray-600 text-xs mt-4">
            Los primeros 100 proveedores obtienen el badge de Fundador permanente
          </p>
        </div>
      </section>

      <section className="bg-emerald-500 px-4 md:px-6 py-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { num: "10.000+", label: "Compradores activos" },
            { num: "100%", label: "Gratis" },
            { num: "0%", label: "Comision" },
            { num: "24/7", label: "Perfil visible" },
          ].map((s) => (
            <div key={s.label} className="py-1">
              <div className="text-xl md:text-2xl font-black text-black">{s.num}</div>
              <div className="text-xs font-bold text-black opacity-60 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-black text-center mb-3 uppercase tracking-tight">
            Por que publicar en MayorLink
          </h2>
          <p className="text-gray-500 text-center mb-10 text-sm">La plataforma B2B mayorista mas completa de Argentina</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { emoji: "📦", title: "Mostra tu catalogo completo", desc: "Publica productos con fotos, precios por unidad, docena y caja." },
              { emoji: "💬", title: "Contacto directo por WhatsApp", desc: "Los compradores te contactan directo. Sin formularios, sin intermediarios." },
              { emoji: "📍", title: "Aparece en busquedas locales", desc: "Cuando alguien busca proveedores en tu ciudad, tu empresa aparece primero." },
              { emoji: "⭐", title: "Badge de Fundador", desc: "Los primeros 100 proveedores obtienen el badge permanente." },
              { emoji: "📊", title: "Estadisticas de tu perfil", desc: "Ve cuantas personas vieron tu empresa y cuantos te contactaron." },
              { emoji: "🔒", title: "Verificacion de confianza", desc: "Obtene el badge verificado y genera mas confianza en los compradores." },
            ].map((b) => (
              <div key={b.title} className="border-2 border-gray-100 rounded-2xl p-5 hover:border-black transition-all">
                <div className="text-2xl mb-3">{b.emoji}</div>
                <h3 className="font-black text-black mb-1 text-sm">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-black text-center mb-10 uppercase tracking-tight">
            Como funciona
          </h2>
          <div className="flex flex-col gap-5">
            {[
              { num: "1", title: "Registra tu empresa gratis", desc: "Completa el formulario con los datos de tu empresa. Tarda menos de 5 minutos." },
              { num: "2", title: "Publica tus productos", desc: "Agrega fotos reales, precios mayoristas y descripcion de cada producto." },
              { num: "3", title: "Recibe consultas de compradores", desc: "Los comerciantes de todo el pais van a encontrarte y contactarte por WhatsApp." },
            ].map((paso) => (
              <div key={paso.num} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0">
                  {paso.num}
                </div>
                <div>
                  <h3 className="font-black text-black mb-1 text-sm">{paso.title}</h3>
                  <p className="text-xs text-gray-500">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 py-10 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-black text-center mb-8 uppercase tracking-tight">Para quien es</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { emoji: "🏭", label: "Fabricantes" },
              { emoji: "🚢", label: "Importadores" },
              { emoji: "🏪", label: "Distribuidores" },
              { emoji: "🧵", label: "Productores" },
            ].map((t) => (
              <div key={t.label} className="border-2 border-gray-100 rounded-2xl p-4 text-center hover:border-black transition-all">
                <div className="text-3xl mb-2">{t.emoji}</div>
                <div className="font-black text-black text-sm">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 md:px-6 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            Listo para sumar tu empresa?
          </h2>
          <p className="text-gray-400 mb-8 text-sm md:text-base">
            Gratis para siempre. Sin comisiones. Sin contratos.
          </p>
          <a href="/registro-proveedor" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl text-base md:text-lg transition-colors">
            Publicar mi empresa gratis
          </a>
        </div>
      </section>
    </div>
  );
}