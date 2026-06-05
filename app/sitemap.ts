import { MetadataRoute } from "next";

const CATEGORIAS = [
  "indumentaria", "calzado", "electronica", "alimentos", "bebidas",
  "ferreteria", "cosmetica", "hogar", "deportes", "juguetes",
  "tecnologia", "textil", "otros"
];

const PROVINCIAS = [
  "buenos-aires", "caba", "cordoba", "santa-fe", "mendoza",
  "tucuman", "salta", "entre-rios", "neuquen", "rio-negro",
  "chaco", "corrientes", "misiones", "santiago-del-estero",
  "san-juan", "san-luis", "la-pampa", "catamarca", "la-rioja",
  "jujuy", "formosa", "chubut", "santa-cruz", "tierra-del-fuego"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mayorlink.vercel.app";

  const paginas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/busqueda`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/solicitudes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/bienvenida`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/para-proveedores`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/registro-proveedor`, changeFrequency: "monthly", priority: 0.7 },
  ];

  CATEGORIAS.forEach((cat) => {
    paginas.push({
      url: `${base}/proveedores-categoria/${cat}/todas`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    PROVINCIAS.forEach((prov) => {
      paginas.push({
        url: `${base}/proveedores-categoria/${cat}/${prov}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  });

  return paginas;
}