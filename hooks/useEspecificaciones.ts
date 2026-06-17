export interface CampoEspec {
    key: string;
    label: string;
    placeholder: string;
    tipo: "texto" | "select";
    opciones?: string[];
  }
  
  export const ESPECIFICACIONES_POR_CATEGORIA: { [key: string]: CampoEspec[] } = {
    "Indumentaria": [
      { key: "talles", label: "Talles disponibles", placeholder: "Ej: S, M, L, XL", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: 100% algodon", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Negro, blanco, gris", tipo: "texto" },
      { key: "genero", label: "Genero", placeholder: "", tipo: "select", opciones: ["Hombre", "Mujer", "Unisex", "Nino/a"] },
      { key: "temporada", label: "Temporada", placeholder: "", tipo: "select", opciones: ["Verano", "Invierno", "Todo el ano"] },
    ],
    "Calzado": [
      { key: "talles", label: "Talles disponibles", placeholder: "Ej: 38 al 44", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Cuero sintetico", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Negro, blanco", tipo: "texto" },
      { key: "genero", label: "Genero", placeholder: "", tipo: "select", opciones: ["Hombre", "Mujer", "Unisex", "Nino/a"] },
      { key: "tipo_suela", label: "Tipo de suela", placeholder: "Ej: Goma, PVC", tipo: "texto" },
    ],
    "Hogar": [
      { key: "medidas", label: "Alto x Ancho x Profundo (cm)", placeholder: "Ej: 80 x 120 x 45", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Madera maciza", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Roble, blanco", tipo: "texto" },
      { key: "armado", label: "Viene armado?", placeholder: "", tipo: "select", opciones: ["Viene armado", "Hay que armarlo", "Armado opcional con cargo extra"] },
      { key: "garantia", label: "Garantia", placeholder: "Ej: 6 meses", tipo: "texto" },
    ],
    "Electronica": [
      { key: "marca", label: "Marca", placeholder: "Ej: Samsung", tipo: "texto" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: Galaxy A54", tipo: "texto" },
      { key: "garantia", label: "Garantia", placeholder: "Ej: 12 meses", tipo: "texto" },
      { key: "voltaje", label: "Voltaje", placeholder: "Ej: 220V", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Negro", tipo: "texto" },
    ],
    "Tecnologia": [
      { key: "marca", label: "Marca", placeholder: "Ej: HP", tipo: "texto" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: Pavilion 15", tipo: "texto" },
      { key: "garantia", label: "Garantia", placeholder: "Ej: 12 meses", tipo: "texto" },
      { key: "voltaje", label: "Voltaje", placeholder: "Ej: 220V", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Negro", tipo: "texto" },
    ],
    "Alimentos": [
      { key: "peso_volumen", label: "Peso o volumen por unidad", placeholder: "Ej: 500g, 1L", tipo: "texto" },
      { key: "vencimiento_minimo", label: "Vencimiento minimo al despachar", placeholder: "Ej: 6 meses", tipo: "texto" },
      { key: "conservacion", label: "Conservacion", placeholder: "", tipo: "select", opciones: ["Ambiente", "Refrigerado", "Congelado"] },
      { key: "apto_especial", label: "Apto celiacos / vegano / etc", placeholder: "Ej: Apto celiacos", tipo: "texto" },
    ],
    "Bebidas": [
      { key: "peso_volumen", label: "Volumen por unidad", placeholder: "Ej: 1L, 500ml", tipo: "texto" },
      { key: "vencimiento_minimo", label: "Vencimiento minimo al despachar", placeholder: "Ej: 12 meses", tipo: "texto" },
      { key: "conservacion", label: "Conservacion", placeholder: "", tipo: "select", opciones: ["Ambiente", "Refrigerado"] },
      { key: "apto_especial", label: "Caracteristica especial", placeholder: "Ej: Sin alcohol", tipo: "texto" },
    ],
    "Ferreteria": [
      { key: "medidas", label: "Medidas", placeholder: "Ej: 30cm x 5mm", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Acero inoxidable", tipo: "texto" },
      { key: "marca", label: "Marca", placeholder: "Ej: Stanley", tipo: "texto" },
      { key: "garantia", label: "Garantia", placeholder: "Ej: 3 meses", tipo: "texto" },
    ],
    "Cosmetica": [
      { key: "volumen", label: "Volumen o contenido", placeholder: "Ej: 250ml", tipo: "texto" },
      { key: "tipo_piel", label: "Tipo de piel", placeholder: "", tipo: "select", opciones: ["Todo tipo de piel", "Piel grasa", "Piel seca", "Piel mixta", "Piel sensible"] },
      { key: "fragancia", label: "Fragancia", placeholder: "Ej: Sin fragancia, floral", tipo: "texto" },
      { key: "vencimiento", label: "Vencimiento", placeholder: "Ej: 24 meses desde fabricacion", tipo: "texto" },
    ],
    "Deportes": [
      { key: "talles", label: "Talles disponibles", placeholder: "Ej: S, M, L", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Poliester", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Azul, negro", tipo: "texto" },
      { key: "deporte", label: "Deporte especifico", placeholder: "Ej: Futbol, running", tipo: "texto" },
    ],
    "Juguetes": [
      { key: "edad_recomendada", label: "Edad recomendada", placeholder: "Ej: +3 anos", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Plastico ABS", tipo: "texto" },
      { key: "pilas", label: "Requiere pilas?", placeholder: "", tipo: "select", opciones: ["Si, incluidas", "Si, no incluidas", "No requiere"] },
    ],
    "Textil": [
      { key: "medidas", label: "Medidas", placeholder: "Ej: 2 x 2 metros", tipo: "texto" },
      { key: "material", label: "Material o composicion", placeholder: "Ej: 100% algodon", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Blanco, beige", tipo: "texto" },
    ],
    "Packaging": [
      { key: "medidas", label: "Medidas", placeholder: "Ej: 20 x 15 x 10 cm", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Carton corrugado", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Marron, blanco", tipo: "texto" },
    ],
    "Automotriz": [
      { key: "marca_compatible", label: "Marca/modelo compatible", placeholder: "Ej: Volkswagen Gol", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Aluminio", tipo: "texto" },
      { key: "garantia", label: "Garantia", placeholder: "Ej: 6 meses", tipo: "texto" },
    ],
    "Agro": [
      { key: "presentacion", label: "Presentacion", placeholder: "Ej: Bolsa 25kg", tipo: "texto" },
      { key: "uso", label: "Uso recomendado", placeholder: "Ej: Cultivo de soja", tipo: "texto" },
    ],
    "Salud": [
      { key: "presentacion", label: "Presentacion", placeholder: "Ej: Caja x 30 unidades", tipo: "texto" },
      { key: "vencimiento", label: "Vencimiento minimo", placeholder: "Ej: 12 meses", tipo: "texto" },
    ],
    "Libreria": [
      { key: "medidas", label: "Medidas", placeholder: "Ej: A4, A5", tipo: "texto" },
      { key: "material", label: "Material", placeholder: "Ej: Papel obra", tipo: "texto" },
    ],
    "Otros": [
      { key: "material", label: "Material", placeholder: "Ej: Plastico, metal", tipo: "texto" },
      { key: "medidas", label: "Medidas", placeholder: "Ej: 20 x 30 cm", tipo: "texto" },
      { key: "color", label: "Color", placeholder: "Ej: Negro", tipo: "texto" },
      { key: "garantia", label: "Garantia", placeholder: "Ej: 3 meses", tipo: "texto" },
    ],
  };
  
  export const NO_APLICA = "No aplica";
  
  export function obtenerCamposPorCategoria(categoria: string): CampoEspec[] {
    return ESPECIFICACIONES_POR_CATEGORIA[categoria] || ESPECIFICACIONES_POR_CATEGORIA["Otros"];
  }