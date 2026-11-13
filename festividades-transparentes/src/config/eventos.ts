export type EventoId =
  | "pre_carnaval"
  | "carnaval"
  | "sao_joao"
  | "aniversario"
  | "festas_religiosas"
  | "natal"
  | "reveillon"
  | "outros";

export interface CategoriaGasto {
  id: string;
  titulo: string;
  descricao: string;
}

export interface EventoConfig {
  id: EventoId;
  nome: string;
  nomeCurto: string;
  slug: string;
  corPrimaria: string;
  anoVigente: number;
  periodo: string;
  categorias: CategoriaGasto[];
}

const CATEGORIAS_PADRAO: CategoriaGasto[] = [
  {
    id: "atracoes",
    titulo: "Atrações Musicais",
    descricao: "Cachês, shows e contratações artísticas.",
  },
  {
    id: "organizacao",
    titulo: "Organização e Infraestrutura",
    descricao: "Empresa organizadora, estrutura e produção.",
  },
  {
    id: "outorga",
    titulo: "Outorga / Cessão de Espaço",
    descricao: "Uso de bens públicos e licenciamentos.",
  },
];

export const EVENTOS: Record<EventoId, EventoConfig> = {
  pre_carnaval: {
    id: "pre_carnaval",
    nome: "Pré-Carnaval",
    nomeCurto: "Pré-Carnaval",
    slug: "pre-carnaval",
    corPrimaria: "#00B8D9",
    anoVigente: 2026,
    periodo: "Janeiro e Fevereiro de 2026",
    categorias: CATEGORIAS_PADRAO,
  },
  carnaval: {
    id: "carnaval",
    nome: "Carnaval",
    nomeCurto: "Carnaval",
    slug: "carnaval",
    corPrimaria: "#08325c",
    anoVigente: 2026,
    periodo: "13 a 18 de fevereiro de 2026",
    categorias: CATEGORIAS_PADRAO,
  },
  sao_joao: {
    id: "sao_joao",
    nome: "Festejos Juninos",
    nomeCurto: "Festejos Juninos",
    slug: "festejos-juninos",
    corPrimaria: "#d35400",
    anoVigente: 2026,
    periodo: "Junho de 2026",
    categorias: CATEGORIAS_PADRAO,
  },
  aniversario: {
    id: "aniversario",
    nome: "Emancipação Política/Aniversário do Município",
    nomeCurto: "Aniversários",
    slug: "aniversario",
    corPrimaria: "#8E33FF",
    anoVigente: 2026,
    periodo: "Ano Todo",
    categorias: CATEGORIAS_PADRAO,
  },
  festas_religiosas: {
    id: "festas_religiosas",
    nome: "Festas Religiosas",
    nomeCurto: "Religiosas",
    slug: "festas-religiosas",
    corPrimaria: "#00A76F",
    anoVigente: 2026,
    periodo: "Ano Todo",
    categorias: CATEGORIAS_PADRAO,
  },
  natal: {
    id: "natal",
    nome: "Natal",
    nomeCurto: "Natal",
    slug: "natal",
    corPrimaria: "#FF5630",
    anoVigente: 2026,
    periodo: "Dezembro de 2026",
    categorias: CATEGORIAS_PADRAO,
  },
  reveillon: {
    id: "reveillon",
    nome: "Réveillon",
    nomeCurto: "Réveillon",
    slug: "reveillon",
    corPrimaria: "#b8860b",
    anoVigente: 2026,
    periodo: "Dezembro de 2025 a Janeiro de 2026",
    categorias: CATEGORIAS_PADRAO,
  },
  outros: {
    id: "outros",
    nome: "Outros",
    nomeCurto: "Outros",
    slug: "outros",
    corPrimaria: "#637381",
    anoVigente: 2026,
    periodo: "Ano Todo",
    categorias: CATEGORIAS_PADRAO,
  },
};

export function getEventoConfig(id: EventoId): EventoConfig {
  const cfg = EVENTOS[id];
  if (!cfg) throw new Error(`Evento desconhecido: ${id}`);
  return cfg;
}

export const LISTA_EVENTOS = Object.values(EVENTOS);
