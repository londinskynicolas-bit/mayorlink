import Link from "next/link";
import { notFound } from "next/navigation";
import { MayorlinkHeader } from "@/components/mayorlink-header";
import { ProviderAvatar } from "@/components/provider-avatar";
import { ProviderBadges } from "@/components/provider-badges";
import { fetchProviderBySlug, whatsappUrl } from "@/lib/providers";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProveedorPage({ params }: PageProps) {
  const { slug } = await params;
  const provider = await fetchProviderBySlug(slug);

  if (!provider) {
    notFound();
  }

  const galleryItems =
    provider.images.length > 0
      ? provider.images
      : [null, null, null, null];

  return (
    <div className="min-h-full bg-zinc-100">
      <MayorlinkHeader compact />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link
          href="/busqueda"
          className="text-sm font-black text-emerald-700 hover:underline"
        >
          Volver a resultados
        </Link>

        <section className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="bg-black px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <ProviderAvatar
                name={provider.name}
                logoUrl={provider.logoUrl}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <ProviderBadges
                  isVerified={provider.isVerified}
                  isFounder={provider.isFounder}
                />
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {provider.name}
                </h1>
                <p className="mt-2 text-base font-bold text-emerald-300">
                  {provider.category} | {provider.city}, {provider.province}
                </p>
              </div>
            </div>

            {provider.phone && (
              <a
                href={whatsappUrl(
                  provider.phone,
                  `Hola ${provider.name}, quiero consultar por compra mayorista desde MayorLink.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-emerald-500 px-6 py-4 text-lg font-black text-white hover:bg-emerald-400 sm:max-w-md"
              >
                Contactar por WhatsApp
              </a>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-black text-black">Galeria</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryItems.map((image, index) => (
                <div
                  key={`gallery-${index}`}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`${provider.name} ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase text-zinc-400">
                      Foto {index + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-black text-black">Descripcion</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-zinc-700">
              {provider.description || "Sin descripcion disponible."}
            </p>

            <h2 className="mt-8 text-lg font-black text-black">
              Condiciones de compra
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border-2 border-zinc-200 p-4">
                <dt className="text-xs font-black uppercase text-zinc-500">
                  Pedido minimo
                </dt>
                <dd className="mt-2 text-lg font-black text-black">
                  {provider.minOrder || "Consultar"}
                </dd>
              </div>
              <div className="rounded-lg border-2 border-zinc-200 p-4">
                <dt className="text-xs font-black uppercase text-zinc-500">
                  Formas de pago
                </dt>
                <dd className="mt-2 text-sm font-bold text-zinc-800">
                  {provider.paymentMethods.length > 0
                    ? provider.paymentMethods.join(", ")
                    : "Consultar"}
                </dd>
              </div>
              <div className="rounded-lg border-2 border-zinc-200 p-4">
                <dt className="text-xs font-black uppercase text-zinc-500">
                  Envios
                </dt>
                <dd className="mt-2 text-sm font-bold text-zinc-800">
                  {provider.delivery || "Consultar"}
                </dd>
              </div>
            </dl>

            <h2 className="mt-8 text-lg font-black text-black">Contacto</h2>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-zinc-800">
              <li>
                <span className="font-black text-black">WhatsApp: </span>
                {provider.phone || "No disponible"}
              </li>
              <li>
                <span className="font-black text-black">Email: </span>
                {provider.email || "No disponible"}
              </li>
              {provider.instagram && (
                <li>
                  <span className="font-black text-black">Instagram: </span>
                  @{provider.instagram.replace(/^@/, "")}
                </li>
              )}
              <li>
                <span className="font-black text-black">Ubicacion: </span>
                {provider.city}, {provider.province}
              </li>
              <li>
                <span className="font-black text-black">Categoria: </span>
                {provider.category}
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
