import Link from "next/link";
import type { Provider } from "@/lib/providers";
import { whatsappUrl } from "@/lib/providers";
import { ProviderAvatar } from "@/components/provider-avatar";
import { ProviderBadges } from "@/components/provider-badges";

type SearchProviderCardProps = {
  provider: Provider;
};

export function SearchProviderCard({ provider }: SearchProviderCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-600 hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:gap-6">
        <ProviderAvatar
          name={provider.name}
          logoUrl={provider.logoUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <ProviderBadges
                isVerified={provider.isVerified}
                isFounder={provider.isFounder}
              />
              <h2 className="mt-2 text-xl font-black text-black">
                <Link
                  href={`/proveedores/${provider.slug}`}
                  className="hover:text-emerald-700"
                >
                  {provider.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm font-semibold text-zinc-600">
                {provider.category} | {provider.city}, {provider.province}
              </p>
            </div>
            {provider.minOrder && (
              <p className="rounded-md bg-zinc-100 px-3 py-1 text-sm font-black text-black">
                Min: {provider.minOrder}
              </p>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-zinc-700">
            {provider.summary}
          </p>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-black uppercase text-zinc-500 text-[11px]">
                Envios
              </dt>
              <dd className="font-semibold text-zinc-800">
                {provider.delivery || "Consultar"}
              </dd>
            </div>
            <div>
              <dt className="font-black uppercase text-zinc-500 text-[11px]">
                Pagos
              </dt>
              <dd className="font-semibold text-zinc-800">
                {provider.paymentMethods.length > 0
                  ? provider.paymentMethods.join(" | ")
                  : "Consultar"}
              </dd>
            </div>
          </dl>

          {provider.paymentMethods.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {provider.paymentMethods.slice(0, 4).map((method) => (
                <li
                  key={method}
                  className="rounded-sm bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-900"
                >
                  {method}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/proveedores/${provider.slug}`}
              className="rounded-md border-2 border-black px-4 py-2 text-sm font-black text-black hover:bg-black hover:text-white"
            >
              Ver perfil completo
            </Link>
            {provider.phone && (
              <a
                href={whatsappUrl(
                  provider.phone,
                  `Hola ${provider.name}, consulto por compra mayorista desde MayorLink.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
