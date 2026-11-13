import { formatarData } from "../../lib/format";
import { passaFiltros } from "../filtros";
import type { ContratoView, Filtros } from "../tipos";
import { calcularContagemEscala } from "./escala";

export interface LinhaMunicipioEvento {
  id: string;
  municipio: string;
  nomeEvento: string;
  totalAtracoes: number;
  totalEstimado: number;
}

export interface LinhaProgramacao {
  id: string;
  municipio: string;
  nomeEvento: string;
  data: Date | undefined;
  dataTimestamp: number;
  dataFormatada: string;
  horario: string;
  atracao: string;
  valor: number;
}

export interface ProgramacaoAnalise {
  quadroMunicipios: LinhaMunicipioEvento[];
  quadroProgramacao: LinhaProgramacao[];
  valoresPorMunFiltrado: Record<string, number>;
  contagemEscala: number[];
  totalAtracoesGlobais: number;
  totalValorGlobal: number;
}

const SEM_DATA = 9_999_999_999_999;

export function calcularProgramacao(
  contratos: readonly ContratoView[],
  filtros: Filtros,
  municipioSelecionado: string | null,
): ProgramacaoAnalise {
  const porMunEvento = new Map<string, LinhaMunicipioEvento>();
  const programacao: LinhaProgramacao[] = [];
  const valoresPorMunFiltrado: Record<string, number> = {};
  let totalAtracoesGlobais = 0;
  let totalValorGlobal = 0;

  contratos.forEach((c, index) => {
    if (!passaFiltros(c, filtros, { categoriaFixa: "atracoes" })) return;

    const valor = c.valor;
    const municipio = c.municipio || "Não Informado";

    if (c.municipio) {
      valoresPorMunFiltrado[c.slugMunicipio] = (valoresPorMunFiltrado[c.slugMunicipio] ?? 0) + valor;
      totalAtracoesGlobais += 1;
      totalValorGlobal += valor;
    }

    if (municipioSelecionado && c.municipio !== municipioSelecionado) return;

    if (c.municipio) {
      const chave = `${municipio}_${c.nomeReal}`;
      let linha = porMunEvento.get(chave);
      if (!linha) {
        linha = { id: chave, municipio, nomeEvento: c.nomeReal, totalAtracoes: 0, totalEstimado: 0 };
        porMunEvento.set(chave, linha);
      }
      linha.totalAtracoes += 1;
      linha.totalEstimado += valor;
    }

    programacao.push({
      id: `${municipio}-${index}`,
      municipio,
      nomeEvento: c.nomeReal,
      data: c.timestamp != null ? new Date(c.timestamp) : undefined,
      dataTimestamp: c.timestamp ?? SEM_DATA,
      dataFormatada: formatarData(c.timestamp),
      horario: (c.horarioShow ?? "").trim() || "A definir",
      atracao: c.fornecedorOuArtista || "Atração não informada",
      valor,
    });
  });

  return {
    quadroMunicipios: [...porMunEvento.values()],
    quadroProgramacao: programacao,
    valoresPorMunFiltrado,
    contagemEscala: calcularContagemEscala(valoresPorMunFiltrado),
    totalAtracoesGlobais,
    totalValorGlobal,
  };
}
