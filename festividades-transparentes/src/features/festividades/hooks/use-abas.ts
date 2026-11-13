import { useMemo, useState } from "react";
import { useDadosGlobais } from "../api/festividades.queries";
import { calcularAtracoes } from "../domain/selectors/atracoes";
import { calcularMunicipios } from "../domain/selectors/municipios";
import { calcularOpcoesFiltros } from "../domain/selectors/opcoes";
import { calcularProgramacao } from "../domain/selectors/programacao";
import { calcularVisaoGeral } from "../domain/selectors/visao-geral";
import { SELECAO_VAZIA, type Selecao } from "../domain/tipos";
import { useFiltrosUrl } from "./use-filtros-url";

export function useOpcoesFiltros() {
  const { contratos, filtros: filtrosDaApi } = useDadosGlobais();
  return useMemo(() => calcularOpcoesFiltros(contratos, filtrosDaApi?.anos), [contratos, filtrosDaApi]);
}

export function useVisaoGeral() {
  const { contratos } = useDadosGlobais();
  const { filtros, setFiltros, limpar } = useFiltrosUrl();
  const opcoes = useOpcoesFiltros();
  const [selecao, setSelecao] = useState<Selecao>(SELECAO_VAZIA);

  const analise = useMemo(
    () => calcularVisaoGeral(contratos, filtros, selecao),
    [contratos, filtros, selecao],
  );

  const alternar = (campo: keyof Selecao, valor: string) =>
    setSelecao((s) => ({ ...s, [campo]: s[campo] === valor ? null : valor }));

  return {
    filtros, setFiltros, limpar, opcoes,
    selecao, alternar, limparSelecao: () => setSelecao(SELECAO_VAZIA),
    analise,
  };
}

export function useProgramacao() {
  const { contratos } = useDadosGlobais();
  const { filtros, setFiltros, limpar } = useFiltrosUrl();
  const opcoes = useOpcoesFiltros();
  const [municipio, setMunicipio] = useState<string | null>(null);

  const analise = useMemo(
    () => calcularProgramacao(contratos, filtros, municipio),
    [contratos, filtros, municipio],
  );
  return {
    filtros, setFiltros, limpar, opcoes, analise,
    municipio, alternarMunicipio: (m: string) => setMunicipio((a) => (a === m ? null : m)),
  };
}

export function useMunicipios() {
  const { contratos } = useDadosGlobais();
  const { filtros, setFiltros, limpar } = useFiltrosUrl();
  const opcoes = useOpcoesFiltros();
  const [municipio, setMunicipio] = useState<string | null>(null);

  const analise = useMemo(
    () => calcularMunicipios(contratos, filtros, municipio),
    [contratos, filtros, municipio],
  );
  return {
    filtros, setFiltros, limpar, opcoes, analise,
    municipio, alternarMunicipio: (m: string) => setMunicipio((a) => (a === m ? null : m)),
  };
}

export function useAtracoes() {
  const { contratos } = useDadosGlobais();
  const { filtros, setFiltros, limpar } = useFiltrosUrl();
  const opcoes = useOpcoesFiltros();
  const [municipio, setMunicipio] = useState<string | null>(null);

  const analise = useMemo(
    () => calcularAtracoes(contratos, filtros, municipio),
    [contratos, filtros, municipio],
  );
  return {
    filtros, setFiltros, limpar, opcoes, analise,
    municipio, alternarMunicipio: (m: string) => setMunicipio((a) => (a === m ? null : m)),
  };
}
