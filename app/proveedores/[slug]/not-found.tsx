import Link from "next/link";
import { MayorlinkHeader } from "@/components/mayorlink-header";

export default function ProveedorNotFound() {
  return (
    <div className="min-h-full bg-zinc-100">
      <MayorlinkHeader compact />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-3xl font-black text-black">Proveedor no encontrado</h1>
        <p className="mt-3 font-semibold text-zinc-600">
          El perfil que buscas no existe o no esta activo.
        </p>
        <Link
          href="/busqueda"
          className="mt-6 inline-block rounded-md bg-emerald-600 px-5 py-3 font-black text-white"
        >
          Ir a busqueda
        </Link>
      </main>
    </div>
  );
}
