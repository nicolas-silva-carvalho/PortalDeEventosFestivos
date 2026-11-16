import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:8080"),
  VITE_GEOJSON_URL: z.string().default("/geo/ceara-municipios.json"),
});

export const env = schema.parse(import.meta.env);
