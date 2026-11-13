import type { Contratacao } from "../api/schemas";

export interface ContratoView extends Contratacao {
  anoRef: number | null;
  mesIndex: number;
  timestamp: number | null;
  tipoRotulo: string;
  nomeReal: string;
  slugMunicipio: string;
}

export interface Filtros {
  ano: string;
  categoria: string;
  municipios: string[];
  atracoes: string[];
  tiposEvento: string[];
  nomesEventos: string[];
  meses: string[];
}

export interface Selecao {
  municipio: string | null;
  categoria: string | null;
  evento: string | null;
  mes: string | null;
}

export const SELECAO_VAZIA: Selecao = {
  municipio: null,
  categoria: null,
  evento: null,
  mes: null,
};
