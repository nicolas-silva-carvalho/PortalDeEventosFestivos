import { z } from "zod";

const texto = z.string().nullish();
const dinheiro = z.number().nullish();

const link = z
  .string()
  .nullish()
  .transform((v) => (v && /^https?:\/\//i.test(v.trim()) ? v.trim() : null));

export const ContratacaoSchema = z.object({
  id: z.string(),
  municipio: z.string(),
  categoria: z.string(),
  fornecedorOuArtista: z.string().nullish().transform((v) => v ?? ""),
  valor: z.number().nullish().transform((v) => v ?? 0),
  ano: z.number().nullish(),

  carimbo: texto,
  dataEvento: texto,
  dataContratacao: texto,

  tipoEvento: texto,
  tematicaEvento: texto,
  nomeEvento: texto,
  nomeEventoOutros: texto,

  horarioShow: texto,
  duracao: texto,
  objeto: texto,
  modalidade: texto,
  numeroProcedimento: texto,
  formaContratacao: texto,
  razaoSocial: texto,
  cnpjContratada: texto,
  razaoSocialIntermediaria: texto,
  cnpjIntermediaria: texto,
  pagamentoAntecipado: texto,
  fonteRecursos: texto,

  valorTransporte: dinheiro,
  valorCarnaval: dinheiro,
  recursosProprios: dinheiro,
  recursosEstaduais: dinheiro,
  recursosFederais: dinheiro,
  recursosOutros: dinheiro,

  linkContrato: link,
  linkProposta: link,
  urlTce: link,
  urlPncp: link,
  urlTransparencia: link,
});

export type Contratacao = z.infer<typeof ContratacaoSchema>;

export const DadosGlobaisSchema = z.object({
  ano: z.number().nullish(),
  totalGeral: z.number(),
  totaisPorCategoria: z.record(z.string(), z.number()),
  valoresPorMunicipio: z.record(z.string(), z.number()),
  rankingArtistas: z.array(
    z.object({ nome: z.string(), valor: z.number(), ocorrencias: z.number() }),
  ),
  rankingContratacoes: z.array(ContratacaoSchema),
  filtros: z.object({
    anos: z.array(z.number()),
    municipios: z.array(z.string()),
    eventos: z.array(z.string()),
    atracoes: z.array(z.string()),
  }),
});

export const UltimaConferenciaSchema = z.object({
  dataRealizada: z.string().nullish(),
  dataFormatada: z.string().nullish(),
});

export type DadosGlobais = z.infer<typeof DadosGlobaisSchema>;
export type UltimaConferencia = z.infer<typeof UltimaConferenciaSchema>;
