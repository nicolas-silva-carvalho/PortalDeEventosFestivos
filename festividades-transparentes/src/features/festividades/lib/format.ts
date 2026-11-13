export function formatarMoeda(valor: number, casas = 0): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: casas,
  });
}

export function formatarMoedaCompacta(valor: number): string {
  if (valor >= 1e9) return `R$ ${(valor / 1e9).toFixed(2).replace(".", ",")} Bi`;
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(2).replace(".", ",")} Mi`;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarPercentual(valor: number, casas = 1): string {
  return `${valor.toFixed(casas).replace(".", ",")}%`;
}

export function formatarData(timestamp?: number | null): string {
  if (timestamp == null) return "Data a definir";
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}
