import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { enriquecerDados } from "../domain/enriquecer";
import { buscarDadosGlobais, buscarUltimaConferencia } from "./festividades.api";

export const festividadesKeys = {
  all: ["festividades"] as const,
  dados: () => [...festividadesKeys.all, "dados-globais"] as const,
};

export const dadosQueryOptions = queryOptions({
  queryKey: festividadesKeys.dados(),
  queryFn: ({ signal }) => buscarDadosGlobais(signal),
  select: enriquecerDados,
});

export function useDadosGlobais() {
  return useSuspenseQuery(dadosQueryOptions).data;
}

export const ultimaConferenciaOptions = queryOptions({
  queryKey: ["festividades", "ultima-conferencia"],
  queryFn: ({ signal }) => buscarUltimaConferencia(signal),
});

export function useUltimaConferencia() {
  return useSuspenseQuery(ultimaConferenciaOptions).data;
}
