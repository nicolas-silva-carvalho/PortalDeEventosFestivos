import { CAT_MAP, MESES_EXTENSO } from "./constants";
import type { ContratoView, Filtros } from "./tipos";

export const FILTROS_VAZIOS: Filtros = {
  ano: "Todos",
  categoria: "Todos",
  municipios: [],
  atracoes: [],
  tiposEvento: [],
  nomesEventos: [],
  meses: [],
};

interface OpcoesFiltragem {
  categoriaFixa?: string;
  preservarNaoAtracoes?: boolean;
}

export function passaFiltros(c: ContratoView, f: Filtros, o: OpcoesFiltragem = {}): boolean {
  if (o.categoriaFixa && c.categoria !== o.categoriaFixa) return false;

  if (f.ano !== "Todos" && String(c.anoRef) !== f.ano) return false;
  if (f.municipios.length > 0 && !f.municipios.includes(c.municipio)) return false;

  if (f.atracoes.length > 0) {
    const aplica = !o.preservarNaoAtracoes || c.categoria === "atracoes";
    if (aplica && !f.atracoes.includes(c.fornecedorOuArtista)) return false;
  }

  const categoriaId = CAT_MAP[f.categoria];
  if (f.categoria !== "Todos" && categoriaId && c.categoria !== categoriaId) return false;

  if (f.tiposEvento.length > 0 && !f.tiposEvento.includes(c.tipoRotulo)) return false;
  if (f.nomesEventos.length > 0 && !f.nomesEventos.includes(c.nomeReal)) return false;

  if (f.meses.length > 0 && f.meses.length < 12 && c.mesIndex >= 0) {
    if (!f.meses.includes(MESES_EXTENSO[c.mesIndex])) return false;
  }
  return true;
}

export function normalizarFiltros(bruto: Record<string, unknown>): Filtros {
  const lista = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const ano = bruto.ano;
  const categoria = bruto.categoria;
  return {
    ano: ano === undefined || ano === null || ano === "" ? "Todos" : String(ano),
    categoria: typeof categoria === "string" && categoria ? categoria : "Todos",
    municipios: lista(bruto.municipios),
    atracoes: lista(bruto.atracoes ?? bruto.atracao),
    tiposEvento: lista(bruto.tiposEvento),
    nomesEventos: lista(bruto.nomesEventos),
    meses: lista(bruto.meses),
  };
}
