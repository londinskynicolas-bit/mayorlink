"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession, signIn } from "next-auth/react";
import Navbar from "../../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DejarResena() {
  const { data: session, status } = useSession();
  const [proveedor, setProveedor] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("proveedor");
    if (!slug) { window.location.href = "/busqueda"; return; }
    supabase.from("providers").select("*").eq("slug", slug).single()
      .then(({ data }) => { setProveedor(data); setCargando(false); });
  }, []);

  const enviar = async () => {
    if (!rating || !session) return;
    setGuardando(true);
    await supabase.from("reviews").insert({
      provider_slug: proveedor.slug,
      reviewer_email: session.user?.email,
      reviewer_name: session.user?.name || "Usuario",
      rating,
      comment,
      is_verified: true,
    });
    await supabase.from("providers").update({
      profile_score: Math.min(100, (proveedor.profile_score || 0) + 5)
    }).eq("slug", proveedor.slug);
    setGuardando(false);
    setEnviado(true);
  };

  if (cargando) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-400 font-bold">Cargando...</div></div>;

  if (!proveedor) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-black mb-4">Proveedor no encontrado</h1><a href="/busqueda" className="bg-emerald-500 text-black font-black px-6 py-3 rounded-xl">Ir a busqueda</a></div></div>;

  if (enviado) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-2xl font-black text-black mb-2">Gracias por tu resena</h2>
            <p className="text-gray-500 text-sm mb-6">Tu opinion ayuda a otros compradores a elegir proveedores confiables</p>
            <a href={"/proveedores/" + proveedor.slug} className="inline-block bg-emerald-500 text-black font-black px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
              Ver perfil de {proveedor.company_name}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              {proveedor.logo_url ? (
                <img src={proveedor.logo_url} alt="logo" className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700">
                  {proveedor.company_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-black">Dejar resena</h1>
              <p className="text-gray-500 text-sm">{proveedor.company_name} · {proveedor.city ? proveedor.city + ", " : ""}{proveedor.province}</p>
            </div>
          </div>

          {!session ? (
            <div className="text-center py-6">
              <p className="text-gray-600 font-bold mb-4">Necesitas iniciar sesion para dejar una resena</p>
              <button onClick={() => signIn("google")} className="bg-black text-white font-black px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors">
                Continuar con Google
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-3">Tu calificacion *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-4xl transition-transform hover:scale-110"
                    >
                      {n <= (hoverRating || rating) ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {rating === 1 && "Muy malo"}
                    {rating === 2 && "Malo"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bueno"}
                    {rating === 5 && "Excelente"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Tu experiencia</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Contanos como fue tu experiencia comprando a este proveedor. Calidad del producto, cumplimiento, comunicacion..."
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-700 font-bold">Resena verificada</p>
                <p className="text-xs text-emerald-600 mt-1">Tu resena va a aparecer con el badge de verificado porque estas logueado con tu cuenta</p>
              </div>

              <button
                onClick={enviar}
                disabled={guardando || rating === 0}
                className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {guardando ? "Publicando..." : "Publicar resena"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}