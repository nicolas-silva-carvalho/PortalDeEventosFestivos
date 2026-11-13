import { useState, useEffect } from "react";
import { CEARA_GEOJSON_URL } from "@/features/festividades/domain/constants"; 

export function useGeoData() {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(CEARA_GEOJSON_URL)
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error("Erro ao carregar GeoJSON:", err));
  }, []);

  return geoData;
}