import { env } from "@/core/env";

export const TOTAL_MUNICIPIOS_CE = 184;
export const CEARA_GEOJSON_URL = env.VITE_GEOJSON_URL;

export const ESCALA_UNIFICADA = [
  { min: 5_000_000, cor: "#08306B", label: "Acima de R$ 5 mi", textColor: "#ffffff" },
  { min: 1_000_000, cor: "#2171B5", label: "R$ 1 mi a 5 mi", textColor: "#ffffff" },
  { min: 500_000, cor: "#6BAED6", label: "R$ 500k a 1 mi", textColor: "#ffffff" },
  { min: 1, cor: "#C6DBEF", label: "Até R$ 500k", textColor: "#08306B" },
  { min: 0, cor: "#F0F3F7", label: "Sem registros", textColor: "#637381" },
] as const;

export const MESES_EXTENSO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const NOME_MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

export const CAT_MAP: Record<string, string> = {
  "Atrações Musicais": "atracoes",
  Organização: "organizacao",
  Outorga: "outorga",
};

export const ROTULOS_TIPO_EVENTO: Record<string, string> = {
  carnaval: "Carnaval",
  pre_carnaval: "Pré-Carnaval",
  sao_joao: "São João",
  reveillon: "Réveillon",
  aniversario: "Aniversário / Emancipação",
  festas_religiosas: "Festas Religiosas / Padroeiro",
  natal: "Natal",
  outros: "Outros Eventos",
};

export const CORES_FESTIVIDADE: Record<string, string> = {
  pre_carnaval: "#00B8D9",
  carnaval: "#08325c",
  sao_joao: "#d35400",
  reveillon: "#b8860b",
  aniversario: "#8E33FF",
  festas_religiosas: "#00A76F",
  natal: "#FF5630",
  outros: "#637381",
};

export const NOMES_FESTIVIDADE: Record<string, string> = {
  pre_carnaval: "Pré-Carnaval",
  carnaval: "Carnaval",
  sao_joao: "São João",
  reveillon: "Réveillon",
  aniversario: "Aniversários",
  festas_religiosas: "Religiosas",
  natal: "Natal",
  outros: "Outros",
};

export const CORES_GRAFICO = [
  "#08325c", "#00A76F", "#FF5630", "#FFAB00", "#00B8D9", "#2171B5", "#8E33FF",
];

const CORES_POR_NOME: Record<string, string> = {
  "Pré-Carnaval": "#00B8D9",
  Carnaval: "#346699",
  "Festejos Juninos": "#d35400",
  "São João": "#d35400",
  "Emancipação Política/Aniversário do Município": "#8E33FF",
  Aniversários: "#8E33FF",
  "Festas Religiosas": "#00A76F",
  Religiosas: "#00A76F",
  Natal: "#FF5630",
  Réveillon: "#b8860b",
  Outros: "#637381",
};

export function getCorEvento(nome: string): string {
  return CORES_POR_NOME[nome] ?? "#94af20";
}
