import Link from "next/link";

type MayorlinkHeaderProps = {
  compact?: boolean;
};

export function MayorlinkHeader({ compact = false }: MayorlinkHeaderProps) {
  return (
    <header className="bg-black text-white">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 ${
          compact ? "py-3" : "py-4"
        } sm:px-6`}
      >
        <Link href="/" className="group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Mayorista B2B
          </p>
          <h1 className="text-2xl font-black tracking-tight group-hover:text-emerald-300 sm:text-3xl">
            MayorLink
          </h1>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-bold">
          <Link
            href="/busqueda"
            className="hidden text-white/90 hover:text-emerald-300 sm:inline"
          >
            Buscar
          </Link>
          <Link
            href="/busqueda"
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
          >
            Explorar
          </Link>
        </nav>
      </div>
    </header>
  );
}
