import { describe, expect, it } from "vitest";
import { contrato } from "@/test/fixtures";
import { FILTROS_VAZIOS, normalizarFiltros, passaFiltros } from "./filtros";

describe("passaFiltros", () => {
  it("sem filtros, tudo passa", () => {
    expect(passaFiltros(contrato(), FILTROS_VAZIOS)).toBe(true);
  });

  it("filtra por ano de referência (data do evento)", () => {
    const c = contrato({ dataEvento: "2025-12-31", ano: 2026 });
    expect(passaFiltros(c, { ...FILTROS_VAZIOS, ano: "2025" })).toBe(true);
    expect(passaFiltros(c, { ...FILTROS_VAZIOS, ano: "2026" })).toBe(false);
  });

  it("data yyyy-MM-dd não 'volta um dia' por causa do fuso (UTC)", () => {
    const c = contrato({ dataEvento: "2026-01-01" });
    expect(c.mesIndex).toBe(0);
    expect(c.anoRef).toBe(2026);
  });

  it("categoriaFixa descarta outras categorias", () => {
    const org = contrato({ categoria: "organizacao" });
    expect(passaFiltros(org, FILTROS_VAZIOS, { categoriaFixa: "atracoes" })).toBe(false);
  });

  it("filtro de atração: preservarNaoAtracoes mantém organização/outorga", () => {
    const f = { ...FILTROS_VAZIOS, atracoes: ["Artista X"] };
    const org = contrato({ categoria: "organizacao", fornecedorOuArtista: "Empresa Y" });
    expect(passaFiltros(org, f)).toBe(false);
    expect(passaFiltros(org, f, { preservarNaoAtracoes: true })).toBe(true);
  });

  it("filtra por categoria pelo rótulo da UI", () => {
    const f = { ...FILTROS_VAZIOS, categoria: "Atrações Musicais" };
    expect(passaFiltros(contrato({ categoria: "atracoes" }), f)).toBe(true);
    expect(passaFiltros(contrato({ categoria: "outorga" }), f)).toBe(false);
  });

  it("filtro de mês usa o nome por extenso; contrato sem data permanece", () => {
    const f = { ...FILTROS_VAZIOS, meses: ["Fevereiro"] };
    expect(passaFiltros(contrato({ dataEvento: "2026-02-14" }), f)).toBe(true);
    expect(passaFiltros(contrato({ dataEvento: "2026-03-01" }), f)).toBe(false);
    expect(passaFiltros(contrato({ dataEvento: null, dataContratacao: null }), f)).toBe(true);
  });
});

describe("normalizarFiltros", () => {
  it("converte entrada solta em Filtros válidos", () => {
    expect(normalizarFiltros({ ano: 2026, municipios: ["Sobral", 3] })).toEqual({
      ...FILTROS_VAZIOS,
      ano: "2026",
      municipios: ["Sobral"],
    });
  });

  it("objeto vazio volta ao estado inicial", () => {
    expect(normalizarFiltros({})).toEqual(FILTROS_VAZIOS);
  });
});
