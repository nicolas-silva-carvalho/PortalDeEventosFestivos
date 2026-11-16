import { useQuery } from "@tanstack/react-query";
import { CEARA_GEOJSON_URL } from "@/features/festividades/domain/constants";

async function buscarGeoJson(signal: AbortSignal) {
  const res = await fetch(CEARA_GEOJSON_URL, { signal, credentials: "omit" });
  if (!res.ok) throw new Error(`GeoJSON indisponível (${res.status})`);
  return res.json();
}

export function useGeoData() {
  const { data } = useQuery({
    queryKey: ["festividades", "geojson-ceara"],
    queryFn: ({ signal }) => buscarGeoJson(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
  return (data ?? null) as any;
}
