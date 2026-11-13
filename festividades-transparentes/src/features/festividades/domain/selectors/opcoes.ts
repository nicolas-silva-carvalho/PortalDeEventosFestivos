import type { ContratoView } from "../tipos";

const ordenar = (a: string, b: string) => a.localeCompare(b, "pt-BR");

export interface OpcoesFiltros {
  anos: string[];
  municipios: string[];
  tiposEvento: string[];
  nomesEvento: string[];
  atracoes: string[];
}

export function calcularOpcoesFiltros(contratos: readonly ContratoView[], anosDaApi: number[] = []): OpcoesFiltros {
  const anos = new Set<string>();
  const municipios = new Set<string>();
  const tipos = new Set<string>();
  const nomes = new Set<string>();
  const atracoes = new Set<string>();

  for (const c of contratos) {
    if (c.anoRef) anos.add(String(c.anoRef));
    if (c.municipio) municipios.add(c.municipio);
    if (c.tipoRotulo) tipos.add(c.tipoRotulo);
    if (c.nomeReal) nomes.add(c.nomeReal);
    if (c.categoria === "atracoes" && c.fornecedorOuArtista) atracoes.add(c.fornecedorOuArtista);
  }

  const anosFinais = anosDaApi?.length > 0 
    ? anosDaApi.map(String) 
    : [...anos].sort().reverse();

  return {
    anos: anosFinais,
    municipios: [...municipios].sort(ordenar),
    tiposEvento: [...tipos].sort(ordenar),
    nomesEvento: [...nomes].sort(ordenar),
    atracoes: [...atracoes].sort(ordenar),
  };
}
