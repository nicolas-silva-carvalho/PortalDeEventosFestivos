import { describe, expect, it } from "vitest";
import { contrato } from "@/test/fixtures";
import { FILTROS_VAZIOS } from "../filtros";
import { SELECAO_VAZIA } from "../tipos";
import { calcularVisaoGeral } from "./visao-geral";

const base = [
  contrato({ municipio: "Fortaleza", categoria: "atracoes", valor: 3000 }),
  contrato({ municipio: "Fortaleza", categoria: "organizacao", valor: 1000 }),
  contrato({ municipio: "Sobral", categoria: "atracoes", valor: 6000 }),
];

describe("calcularVisaoGeral", () => {
  it("totaliza valor e quantidade", () => {
    const r = calcularVisaoGeral(base, FILTROS_VAZIOS, SELECAO_VAZIA);
    expect(r.totalValorGeral).toBe(10_000);
    expect(r.totalEmpenhosGeral).toBe(3);
    expect(r.tabelaMunicipios).toHaveLength(2);
  });

  it("percentuais da tabela de municípios somam 100", () => {
    const r = calcularVisaoGeral(base, FILTROS_VAZIOS, SELECAO_VAZIA);
    const soma = r.tabelaMunicipios.reduce((s, m) => s + m.pct, 0);
    expect(soma).toBeCloseTo(100);
  });

  it("selecionar uma categoria NÃO altera os KPIs gerais, mas altera as tabelas", () => {
    const r = calcularVisaoGeral(base, FILTROS_VAZIOS, { ...SELECAO_VAZIA, categoria: "atracoes" });
    expect(r.totalValorGeral).toBe(10_000);
    expect(r.totalValorFiltrado).toBe(9_000);
  });

  it("selecionar um município não esvazia o mapa", () => {
    const r = calcularVisaoGeral(base, FILTROS_VAZIOS, { ...SELECAO_VAZIA, municipio: "Sobral" });
    expect(Object.keys(r.valoresPorMunFiltrado).sort()).toEqual(["fortaleza", "sobral"]);
    expect(r.totalValorFiltrado).toBe(6_000);
  });

  it("agrupa o valor no mês correto", () => {
    const r = calcularVisaoGeral(
      [contrato({ dataEvento: "2026-06-23", tipoEvento: "sao_joao", valor: 500 })],
      FILTROS_VAZIOS,
      SELECAO_VAZIA,
    );
    expect(r.mesesCalc[5].total).toBe(500);
    expect(r.mesesCalc[5].porEvento).toEqual({ sao_joao: 500 });
  });
});
