import { MESES_EXTENSO } from "../constants";
import { passaFiltros } from "../filtros";
import type { ContratoView, Filtros } from "../tipos";
import { calcularContagemEscala } from "./escala";

export interface RankingArtista {
  nome: string;
  count: number;
  min: number;
  max: number;
  total: number;
}
export interface RankingRepresentante {
  cnpj: string;
  razaoSocial: string;
  qtdAtracoes: number;
  count: number;
  total: number;
}
export interface LinhaMunEvtArt {
  municipio: string;
  festividade: string;
  artista: string;
  count: number;
  total: number;
}
export interface LinhaMunicipioGasto {
  municipio: string;
  temFestividade: boolean;
  "qtdContratações": number;
  totalGasto: number;
  percentual: number;
}

export interface AtracoesAnalise {
  rankingArtistas: RankingArtista[];
  rankingRep: RankingRepresentante[];
  listaMunEvtArt: LinhaMunEvtArt[];
  listaMunicipios: LinhaMunicipioGasto[];
  chartFestMes: Array<Record<string, string | number>>;
  chartDespesaMes: Array<{ name: string; value: number }>;
  totalGastoAtracoes: number;
  valoresPorMunFiltrado: Record<string, number>;
  contagemEscala: number[];
}

export function calcularAtracoes(
  contratos: readonly ContratoView[],
  filtros: Filtros,
  municipioSelecionado: string | null,
): AtracoesAnalise {
  const artistas = new Map<string, RankingArtista>();
  const reps = new Map<string, RankingRepresentante & { atracoes: Set<string> }>();
  const munEvtArt = new Map<string, LinhaMunEvtArt>();
  const porMesFest: Record<string, Record<string, number>> = {};
  const porMes: Record<string, number> = {};
  const valoresPorMunFiltrado: Record<string, number> = {};
  let totalGastoAtracoes = 0;

  for (const c of contratos) {
    if (!passaFiltros(c, filtros, { categoriaFixa: "atracoes" })) continue;

    const valor = c.valor;
    if (c.municipio) {
      valoresPorMunFiltrado[c.slugMunicipio] = (valoresPorMunFiltrado[c.slugMunicipio] ?? 0) + valor;
    }
    if (municipioSelecionado && c.municipio !== municipioSelecionado) continue;

    const festividade = c.nomeEvento || "Outros";
    const artista = c.fornecedorOuArtista || "Não informado";
    const razao = c.razaoSocial || "Não informado";
    const cnpj = c.cnpjContratada || razao;
    const municipio = c.municipio || "Não informado";
    const mesNome = c.mesIndex >= 0 ? MESES_EXTENSO[c.mesIndex] : "Não Informado";

    totalGastoAtracoes += valor;

    let a = artistas.get(artista);
    if (!a) {
      a = { nome: artista, count: 0, min: Infinity, max: -Infinity, total: 0 };
      artistas.set(artista, a);
    }
    a.count++;
    a.total += valor;
    a.min = Math.min(a.min, valor);
    a.max = Math.max(a.max, valor);

    let r = reps.get(cnpj);
    if (!r) {
      r = { cnpj, razaoSocial: razao, qtdAtracoes: 0, count: 0, total: 0, atracoes: new Set() };
      reps.set(cnpj, r);
    }
    r.count++;
    r.total += valor;
    if (artista !== "Não informado") r.atracoes.add(artista);

    const chave = `${municipio}|${festividade}|${artista}`;
    let m = munEvtArt.get(chave);
    if (!m) {
      m = { municipio, festividade, artista, count: 0, total: 0 };
      munEvtArt.set(chave, m);
    }
    m.count++;
    m.total += valor;

    const mesFest = (porMesFest[mesNome] ??= {});
    mesFest[festividade] = (mesFest[festividade] ?? 0) + valor;
    porMes[mesNome] = (porMes[mesNome] ?? 0) + valor;
  }

  const filtrosTabela: Filtros = { ...filtros, municipios: [], meses: [] };
  const gastoPorMun = new Map<string, { qtd: number; total: number }>();
  for (const c of contratos) {
    if (!c.municipio) continue;
    if (municipioSelecionado && c.municipio !== municipioSelecionado) continue;
    const agg = gastoPorMun.get(c.municipio) ?? { qtd: 0, total: 0 };
    if (passaFiltros(c, filtrosTabela, { categoriaFixa: "atracoes" })) {
      agg.qtd++;
      agg.total += c.valor;
    }
    gastoPorMun.set(c.municipio, agg);
  }

  const listaMunicipios: LinhaMunicipioGasto[] = [...gastoPorMun.entries()].map(([municipio, g]) => ({
    municipio,
    temFestividade: g.total > 0,
    qtdContratações: g.qtd,
    totalGasto: g.total,
    percentual: totalGastoAtracoes > 0 ? (g.total / totalGastoAtracoes) * 100 : 0,
  }));

  return {
    rankingArtistas: [...artistas.values()].map((x) => ({
      ...x,
      min: Number.isFinite(x.min) ? x.min : 0,
      max: Number.isFinite(x.max) ? x.max : 0,
    })),
    rankingRep: [...reps.values()].map(({ atracoes, ...resto }) => ({
      ...resto,
      qtdAtracoes: atracoes.size,
    })),
    listaMunEvtArt: [...munEvtArt.values()],
    listaMunicipios,
    chartFestMes: MESES_EXTENSO.filter((m) => porMesFest[m]).map((m) => ({ name: m, ...porMesFest[m] })),
    chartDespesaMes: MESES_EXTENSO.filter((m) => porMes[m]).map((m) => ({ name: m, value: porMes[m] })),
    totalGastoAtracoes,
    valoresPorMunFiltrado,
    contagemEscala: calcularContagemEscala(valoresPorMunFiltrado),
  };
}
