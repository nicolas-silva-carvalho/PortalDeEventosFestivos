import { NOME_MESES, TOTAL_MUNICIPIOS_CE } from "../constants";
import { passaFiltros } from "../filtros";
import type { ContratoView, Filtros, Selecao } from "../tipos";
import { calcularContagemEscala } from "./escala";

export interface CategoriaAgg {
  categoria: string;
  valor: number;
  qtd: number;
  pct: number;
}
export interface MunicipioAgg {
  nome: string;
  valor: number;
  qtd: number;
  pct: number;
}
export interface MesAgg {
  mes: string;
  total: number;
  porEvento: Record<string, number>;
}

export interface VisaoGeralAnalise {
  totalValorGeral: number;
  totalEmpenhosGeral: number;
  catsCalcGeral: Record<string, { valor: number; qtd: number }>;
  totalValorFiltrado: number;
  totalEmpenhosFiltrado: number;
  tabelaMunicipios: MunicipioAgg[];
  tabelaCategorias: CategoriaAgg[];
  mesesCalc: MesAgg[];
  valoresPorMunFiltrado: Record<string, number>;
  contagemEscala: number[];
  qtdMunicipiosComFesta: number;
  qtdMunicipiosSemFesta: number;
}

export function calcularVisaoGeral(
  contratos: readonly ContratoView[],
  filtros: Filtros,
  sel: Selecao,
): VisaoGeralAnalise {
  let totalValorGeral = 0;
  let totalEmpenhosGeral = 0;
  const catsCalcGeral: Record<string, { valor: number; qtd: number }> = {
    atracoes: { valor: 0, qtd: 0 },
    organizacao: { valor: 0, qtd: 0 },
    outorga: { valor: 0, qtd: 0 },
    outros: { valor: 0, qtd: 0 },
  };

  let totalValorFiltrado = 0;
  let totalEmpenhosFiltrado = 0;
  const catsCalc: Record<string, CategoriaAgg> = {};
  const munsCalc: Record<string, MunicipioAgg> = {};
  const valoresPorMunFiltrado: Record<string, number> = {};
  const mesesCalc: MesAgg[] = NOME_MESES.map((mes) => ({ mes, total: 0, porEvento: {} }));

  for (const c of contratos) {
    if (!passaFiltros(c, filtros)) continue;

    const eventoId = c.tipoEvento || "outros";
    if (sel.evento && eventoId !== sel.evento) continue;
    if (sel.mes && NOME_MESES[c.mesIndex] !== sel.mes) continue;

    const valor = c.valor;
    const noMunicipio = !sel.municipio || c.municipio === sel.municipio;
    const cat = c.categoria || "outros";

    if (noMunicipio) {
      totalValorGeral += valor;
      totalEmpenhosGeral += 1;
      const g = catsCalcGeral[cat];
      if (g) {
        g.valor += valor;
        g.qtd += 1;
      }
    }

    if (sel.categoria && c.categoria !== sel.categoria) continue;

    if (c.municipio) {
      valoresPorMunFiltrado[c.slugMunicipio] = (valoresPorMunFiltrado[c.slugMunicipio] ?? 0) + valor;
    }

    if (!noMunicipio) continue;

    totalValorFiltrado += valor;
    totalEmpenhosFiltrado += 1;

    if (c.mesIndex >= 0) {
      const m = mesesCalc[c.mesIndex];
      m.total += valor;
      m.porEvento[eventoId] = (m.porEvento[eventoId] ?? 0) + valor;
    }

    const aggCat = (catsCalc[cat] ??= { categoria: cat, valor: 0, qtd: 0, pct: 0 });
    aggCat.valor += valor;
    aggCat.qtd += 1;

    if (c.municipio) {
      const aggMun = (munsCalc[c.slugMunicipio] ??= { nome: c.municipio, valor: 0, qtd: 0, pct: 0 });
      aggMun.valor += valor;
      aggMun.qtd += 1;
    }
  }

  const pct = (v: number) => (totalValorFiltrado > 0 ? (v / totalValorFiltrado) * 100 : 0);
  const tabelaCategorias = Object.values(catsCalc).map((c) => ({ ...c, pct: pct(c.valor) }));
  const tabelaMunicipios = Object.values(munsCalc).map((m) => ({ ...m, pct: pct(m.valor) }));

  const qtdMunicipiosComFesta = Object.keys(valoresPorMunFiltrado).length;

  return {
    totalValorGeral,
    totalEmpenhosGeral,
    catsCalcGeral,
    totalValorFiltrado,
    totalEmpenhosFiltrado,
    tabelaMunicipios,
    tabelaCategorias,
    mesesCalc,
    valoresPorMunFiltrado,
    contagemEscala: calcularContagemEscala(valoresPorMunFiltrado),
    qtdMunicipiosComFesta,
    qtdMunicipiosSemFesta: Math.max(0, TOTAL_MUNICIPIOS_CE - qtdMunicipiosComFesta),
  };
}
