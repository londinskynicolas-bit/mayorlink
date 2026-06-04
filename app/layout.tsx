import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MayorLink | Directorio de proveedores mayoristas en Argentina",
  description: "Encontra fabricantes, importadores y distribuidores mayoristas en Argentina. Busca por categoria y provincia. Contacto directo por WhatsApp.",
  keywords: "proveedores mayoristas argentina, directorio mayoristas, fabricantes argentina, importadores mayoristas, distribuidores argentina",
  openGraph: {
    title: "MayorLink | Proveedores mayoristas en Argentina",
    description: "El directorio mas completo de proveedores mayoristas de Argentina. Busca, compara y contacta directo.",
    url: "https://mayorlink.vercel.app",
    siteName: "MayorLink",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}