import { http } from "@/core/http/http-client";
import { 
  DadosGlobaisSchema, type DadosGlobais,
  UltimaConferenciaSchema, type UltimaConferencia
} from "./schemas";

export function buscarDadosGlobais(signal?: AbortSignal): Promise<DadosGlobais> {
  return http("/api/publico/dados-globais", { 
    schema: DadosGlobaisSchema, 
    signal,
    auth: true
  });
}

export function buscarUltimaConferencia(signal?: AbortSignal): Promise<UltimaConferencia> {
  return http("/api/publico/ultima-conferencia", { 
    schema: UltimaConferenciaSchema, 
    signal,
    auth: true
  });
}