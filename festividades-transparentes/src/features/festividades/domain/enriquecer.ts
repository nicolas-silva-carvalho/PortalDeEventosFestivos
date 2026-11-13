import { slugify } from "@/lib/slugify";
import type { Contratacao, DadosGlobais } from "../api/schemas";
import { ROTULOS_TIPO_EVENTO } from "./constants";
import type { ContratoView } from "./tipos";

export function enriquecerContratacao(c: Contratacao): ContratoView {
  const iso = c.dataEvento || c.dataContratacao || null;
  const data = iso ? new Date(iso) : null;
  const valida = data && !Number.isNaN(data.getTime()) ? data : null;

  const tipoRotulo =
    ROTULOS_TIPO_EVENTO[c.tipoEvento ?? ""] ?? c.tipoEvento ?? c.tematicaEvento ?? "";

  const nomeReal =
    c.nomeEventoOutros || c.nomeEvento || c.tematicaEvento || tipoRotulo || "Evento Não Identificado";

  return {
    ...c,
    anoRef: valida ? valida.getUTCFullYear() : (c.ano ?? null),
    mesIndex: valida ? valida.getUTCMonth() : -1,
    timestamp: valida ? valida.getTime() : null,
    tipoRotulo,
    nomeReal,
    slugMunicipio: slugify(c.municipio),
  };
}

export type DadosView = DadosGlobais & { contratos: ContratoView[] };

export function enriquecerDados(dados: DadosGlobais): DadosView {
  return { ...dados, contratos: dados.rankingContratacoes.map(enriquecerContratacao) };
}
