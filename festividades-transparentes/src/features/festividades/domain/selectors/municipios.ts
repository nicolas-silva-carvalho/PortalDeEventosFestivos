import { MESES_EXTENSO } from "../constants";
import { passaFiltros } from "../filtros";
import type { ContratoView, Filtros } from "../tipos";
import { calcularContagemEscala } from "./escala";

export interface ContratoMunicipio extends ContratoView {
  festividade: string;
  categoriaFormatada: string;
}

export interface PontoNomeValor {
  name: string;
  value: number;
}

export type LinhaGrafico = Record<string, string | number>;

export interface MunicipiosAnalise {
  dadosFiltrados: ContratoMunicipio[];
  chartFestividade: PontoNomeValor[];
  chartCategoria: PontoNomeValor[];
  chartFestMes: LinhaGrafico[];
  chartFestCatMes: LinhaGrafico[];
  valoresPorMunFiltrado: Record<string, number>;
  contagemEscala: number[];
}

const porValorDesc = (a: PontoNomeValor, b: PontoNomeValor) => b.value - a.value;

export function calcularMunicipios(
  contratos: readonly ContratoView[],
  filtros: Filtros,
  municipioSelecionado: string | null,
): MunicipiosAnalise {
  const dadosFiltrados: ContratoMunicipio[] = [];
  const valoresPorMunFiltrado: Record<string, number> = {};

  const totalPorFestividade: Record<string, number> = {};
  const totalPorCategoria: Record<string, number> = {};
  const totalPorMesFest: Record<string, Record<string, number>> = {};
  const totalFestCatMes: Record<string, LinhaGrafico & { mesIndex: number; festividade: string }> = {};

  for (const c of contratos) {
    if (!passaFiltros(c, filtros, { preservarNaoAtracoes: true })) continue;

    const valor = c.valor;
    const mesNome = c.mesIndex >= 0 ? MESES_EXTENSO[c.mesIndex] : "Não Informado";
    const festividade = c.nomeEvento || "Outros";
    const categoria = c.categoria || "Geral";
    const categoriaFormatada = categoria.charAt(0).toUpperCase() + categoria.slice(1);

    if (c.municipio) {
      valoresPorMunFiltrado[c.slugMunicipio] = (valoresPorMunFiltrado[c.slugMunicipio] ?? 0) + valor;
    }
    if (municipioSelecionado && c.municipio !== municipioSelecionado) continue;

    dadosFiltrados.push({ ...c, festividade, categoriaFormatada });

    totalPorFestividade[festividade] = (totalPorFestividade[festividade] ?? 0) + valor;
    totalPorCategoria[categoriaFormatada] = (totalPorCategoria[categoriaFormatada] ?? 0) + valor;

    const mesFest = (totalPorMesFest[mesNome] ??= {});
    mesFest[festividade] = (mesFest[festividade] ?? 0) + valor;

    const chave = `${mesNome} - ${festividade}`;
    const linha = (totalFestCatMes[chave] ??= { name: chave, mesIndex: c.mesIndex, festividade });
    linha[categoriaFormatada] = ((linha[categoriaFormatada] as number | undefined) ?? 0) + valor;
  }

  const chartFestividade = Object.entries(totalPorFestividade)
    .map(([name, value]) => ({ name, value }))
    .sort(porValorDesc);

  const chartCategoria = Object.entries(totalPorCategoria)
    .map(([name, value]) => ({ name, value }))
    .sort(porValorDesc);

  const chartFestMes: LinhaGrafico[] = MESES_EXTENSO.filter((m) => totalPorMesFest[m]).map((m) => ({
    name: m,
    ...totalPorMesFest[m],
  }));

  const chartFestCatMes: LinhaGrafico[] = Object.values(totalFestCatMes).sort(
    (a, b) => a.mesIndex - b.mesIndex || a.festividade.localeCompare(b.festividade, "pt-BR"),
  );

  return {
    dadosFiltrados,
    chartFestividade,
    chartCategoria,
    chartFestMes,
    chartFestCatMes,
    valoresPorMunFiltrado,
    contagemEscala: calcularContagemEscala(valoresPorMunFiltrado),
  };
}
