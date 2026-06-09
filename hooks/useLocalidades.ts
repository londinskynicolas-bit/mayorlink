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
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("https://apis.datos.gob.ar/georef/api/provincias?orden=nombre&max=100")
      .then(res => res.json())
      .then(data => {
        setProvincias(data.provincias || []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  return { provincias, cargando };
}

export function useMunicipios(provinciaNombre: string) {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!provinciaNombre) { setMunicipios([]); return; }
    setCargando(true);
    fetch("https://apis.datos.gob.ar/georef/api/municipios?provincia=" + encodeURIComponent(provinciaNombre) + "&orden=nombre&max=500")
      .then(res => res.json())
      .then(data => {
        setMunicipios(data.municipios || []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [provinciaNombre]);

  return { municipios, cargando };
}
