import { useState, useEffect } from "react";

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  nombre: string;
}

export function useProvincias() {
  const [provincias, setProvincias] = useState<Provincia[]>([]);

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias?orden=nombre&max=100")
      .then(res => res.json())
      .then(data => setProvincias(data.provincias || []));
  }, []);

  return { provincias };
}

export function useMunicipios(provinciaNombre: string) {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  useEffect(() => {
    if (!provinciaNombre) { setMunicipios([]); return; }
    fetch("https://apis.datos.gob.ar/georef/api/municipios?provincia=" + encodeURIComponent(provinciaNombre) + "&orden=nombre&max=500")
      .then(res => res.json())
      .then(data => setMunicipios(data.municipios || []));
  }, [provinciaNombre]);

  return { municipios };
}
