import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FILTROS_VAZIOS, normalizarFiltros } from "../domain/filtros";
import type { Filtros } from "../domain/tipos";

const LISTAS = {
  municipios: "mun",
  atracoes: "atr",
  tiposEvento: "tipo",
  nomesEventos: "evt",
  meses: "mes",
} as const;

export function useFiltrosUrl() {
  const [params, setParams] = useSearchParams();

  const filtros = useMemo<Filtros>(
    () => ({
      ano: params.get("ano") ?? FILTROS_VAZIOS.ano,
      categoria: params.get("cat") ?? FILTROS_VAZIOS.categoria,
      municipios: params.getAll(LISTAS.municipios),
      atracoes: params.getAll(LISTAS.atracoes),
      tiposEvento: params.getAll(LISTAS.tiposEvento),
      nomesEventos: params.getAll(LISTAS.nomesEventos),
      meses: params.getAll(LISTAS.meses),
    }),
    [params],
  );

  const setFiltros = useCallback(
    (bruto: Record<string, unknown>) => {
      const f = normalizarFiltros(bruto);
      setParams(
        (atual) => {
          const novo = new URLSearchParams(atual);
          [...Object.values(LISTAS), "ano", "cat"].forEach((k) => novo.delete(k));

          if (f.ano !== "Todos") novo.set("ano", f.ano);
          if (f.categoria !== "Todos") novo.set("cat", f.categoria);
          (Object.keys(LISTAS) as Array<keyof typeof LISTAS>).forEach((campo) =>
            f[campo].forEach((v) => novo.append(LISTAS[campo], v)),
          );
          return novo;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const limpar = useCallback(() => setFiltros({}), [setFiltros]);

  return { filtros, setFiltros, limpar };
}
