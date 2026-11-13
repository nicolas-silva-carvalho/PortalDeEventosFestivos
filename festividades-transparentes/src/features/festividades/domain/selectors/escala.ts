import { ESCALA_UNIFICADA, TOTAL_MUNICIPIOS_CE } from "../constants";

export function calcularContagemEscala(valoresPorMunicipio: Record<string, number>): number[] {
  const contagem = Array<number>(ESCALA_UNIFICADA.length).fill(0);
  let comRegistro = 0;

  for (const valor of Object.values(valoresPorMunicipio)) {
    if (valor <= 0) continue;
    comRegistro++;
    const idx = ESCALA_UNIFICADA.findIndex((faixa) => valor >= faixa.min);
    if (idx !== -1) contagem[idx]++;
  }
  contagem[ESCALA_UNIFICADA.length - 1] = Math.max(0, TOTAL_MUNICIPIOS_CE - comRegistro);
  return contagem;
}
