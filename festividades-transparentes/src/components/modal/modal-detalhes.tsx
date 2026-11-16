"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  FileText,
  Gavel,
  MapPin,
  UserRound,
  X,
  Coins,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ContratoItem {
  festividade?: string;
  nomeEvento?: string;
  categoriaFormatada?: string;
  categoria?: string;
  numeroProcedimento?: string;
  objeto?: string;
  fornecedorOuArtista?: string;
  razaoSocial?: string;
  municipio?: string;
  valor?: number | string;
  ano?: string | number;
  modalidade?: string;
  dataEvento?: string | Date | null;
  dataContratacao?: string | Date | null;
  horarioShow?: string;
  duracao?: string;
  cnpjContratada?: string;
  linkContrato?: string;
  linkProposta?: string;
  urlTce?: string;
  urlPncp?: string;
  urlTransparencia?: string;
  fonteRecursos?: string;
}

interface ModalDetalhesProps {
  open: boolean;
  onClose: () => void;
  item: ContratoItem | null;
  tipoDocumento?: "contrato" | "proposta";
}

function getCorEvento(nome: string) {
  const map: Record<string, string> = {
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
  return map[nome] || "#94af20";
}

function formatarMoeda(valor: number | string | undefined) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
function formatarData(data?: string | Date | null) {
  if (!data) return "Não informado";
  try {
    return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return String(data).substring(0, 10);
  }
}
function getEmbedUrl(url?: string) {
  if (!url) return "";
  if (url.includes("drive.google.com/open?id=")) {
    const id = url.split("id=")[1]?.split("&")[0];
    return id ? `https://drive.google.com/file/d/${id}/preview` : url;
  }
  if (url.includes("drive.google.com/file/d/"))
    return url.replace(/\/view.*$/, "/preview");
  return url;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: any;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 group/row cursor-default">
      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 bg-[#08325c]/[0.06] text-[#08325c] transition-transform duration-300 group-hover/row:scale-[1.05]">
        <Icon className="w-4 h-4 transition-transform duration-300 group-hover/row:scale-110" />
      </div>
      <div className="flex flex-col min-w-0 flex-1 pt-0.5">
        <span className="text-[10px] font-semibold text-[#637381] uppercase tracking-wider leading-tight mb-0.5">
          {label}
        </span>
        <span className="text-[12px] font-extrabold text-[#212B36] leading-snug break-words line-clamp-2">
          {value}
        </span>
        {detail && (
          <div className="flex flex-col border-t border-dashed border-[#919eab]/30 pt-1 mt-1">
            <span className="text-[10px] font-medium text-[#919eab] leading-tight line-clamp-1">
              {detail}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalDetalhesContrato({
  open,
  onClose,
  item,
  tipoDocumento = "contrato",
}: ModalDetalhesProps) {
  const [docAtivo, setDocAtivo] = useState<"contrato" | "proposta">(
    tipoDocumento,
  );

  useEffect(() => {
    if (open) setDocAtivo(tipoDocumento);
  }, [open, tipoDocumento, item]);

  if (!item) return null;

  const temContrato = !!item.linkContrato;
  const temProposta = !!item.linkProposta;

  let docEfetivo: "contrato" | "proposta" | null = null;
  if (docAtivo === "contrato") {
    docEfetivo = temContrato ? "contrato" : temProposta ? "proposta" : null;
  } else {
    docEfetivo = temProposta ? "proposta" : temContrato ? "contrato" : null;
  }

  const pdfUrlOriginal =
    docEfetivo === "contrato"
      ? item.linkContrato || ""
      : docEfetivo === "proposta"
        ? item.linkProposta || ""
        : "";
  const pdfUrlEmbed = getEmbedUrl(pdfUrlOriginal);
  const tipoPdf =
    docEfetivo === "contrato"
      ? "Contrato"
      : docEfetivo === "proposta"
        ? "Proposta"
        : "Documento";

  const titulo =
    item.objeto ||
    `Contratação de ${item.fornecedorOuArtista || item.razaoSocial || "fornecedor"}`;

  const nomeEvento = item.festividade || item.nomeEvento || "Evento";
  const corEvento = getCorEvento(nomeEvento);

  const cnpjExibido = item.cnpjContratada;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[49] bg-black/60 transition-opacity animate-in fade-in duration-300"
          aria-hidden="true"
        />
      )}
      <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className="flex h-[92vh] w-[95vw] !max-w-[1200px] flex-col gap-0 overflow-hidden rounded-2xl bg-[#F4F6F8] p-0 text-[#1c252e] shadow-[0_24px_70px_rgba(8,50,92,0.22)] [&>button.absolute]:hidden">
          <DialogHeader className="relative shrink-0 border-b border-white/15 bg-[#08325c] px-6 py-5 text-left text-white overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <img
                src="/TCE_LOGO BRANCA VERTICAL.png"
                alt=""
                className="absolute -right-60 -top-10 h-120 w-auto -rotate-12 opacity-13 object-contain mix-blend-overlay"
              />
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex size-7 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#08325c] focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Fechar"
            >
              <X className="size-3.5" />
            </button>
            <div className="relative z-10 min-w-0 pr-12">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  className="rounded-md border-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: corEvento }}
                >
                  {nomeEvento}
                </Badge>
                <Badge className="rounded-md border-0 bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white hover:bg-white/20">
                  {item.categoriaFormatada || item.categoria || "Categoria"}
                </Badge>
                {item.numeroProcedimento && (
                  <p className="mt-1 text-[10px] text-white/70 font-medium tracking-wide">
                    Processo nº {item.numeroProcedimento}
                  </p>
                )}
              </div>
              <DialogTitle className="max-w-5xl text-[13px] sm:text-[14px] font-bold uppercase leading-snug tracking-tight text-white line-clamp-2">
                {titulo}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
            <div className="mx-auto flex w-full flex-col gap-5 p-5 sm:p-6">
              <section className="grid gap-5 lg:grid-cols-[1fr_3.2fr] items-stretch">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col justify-center cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
                  <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 bg-[#00A76F]/10 text-[#00A76F] transition-transform duration-300 group-hover:scale-[1.05]">
                      <Coins className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold text-[#637381] uppercase tracking-wider leading-tight mb-0.5">
                        Valor contratado
                      </span>
                      <span className="text-[18px] font-extrabold text-[#212B36] leading-none whitespace-nowrap">
                        {formatarMoeda(item.valor)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col border-t border-dashed border-[#919eab]/30 pt-2.5 mt-3">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-[#919eab]">
                      <span className="size-1.5 rounded-full bg-[#00A76F]" />
                      Registro ativo no sistema
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col transition-all duration-300 hover:shadow-md justify-center">
                  <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-2.5 mb-3 shrink-0">
                    <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                      Resumo da contratação e cronograma
                    </h4>
                  </div>
                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoRow
                      icon={UserRound}
                      label="Credor / artista"
                      value={
                        item.fornecedorOuArtista ||
                        item.razaoSocial ||
                        "Não informado"
                      }
                      detail={cnpjExibido ? `CNPJ: ${cnpjExibido}` : undefined}
                    />
                    <InfoRow
                      icon={Building2}
                      label="Município / exercício"
                      value={`${item.municipio || "Não informado"}${item.ano ? ` · ${item.ano}` : ""}`}
                    />
                    <InfoRow
                      icon={Gavel}
                      label="Modalidade"
                      value={item.modalidade || "Não informada"}
                    />
                    <InfoRow
                      icon={CalendarDays}
                      label="Data do evento"
                      value={formatarData(item.dataEvento)}
                      detail={
                        item.dataContratacao
                          ? `Publicado em ${formatarData(item.dataContratacao)}`
                          : undefined
                      }
                    />
                    <InfoRow
                      icon={Clock3}
                      label="Horário / duração"
                      value={item.horarioShow || "A definir"}
                      detail={
                        item.duracao ? `Duração: ${item.duracao}` : undefined
                      }
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Localidade"
                      value={item.municipio || "Não informado"}
                    />
                  </div>
                </div>
              </section>
              <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col min-h-[500px]">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#919eab]/30 pb-2.5 mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                      <FileText size={14} />
                      Documento anexado
                    </h4>
                    {temContrato && temProposta && (
                      <div className="flex items-center gap-1 rounded-lg border border-[#919eab]/24 bg-[#F4F6F8] p-0.5">
                        <button
                          type="button"
                          onClick={() => setDocAtivo("contrato")}
                          className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors ${
                            docEfetivo === "contrato"
                              ? "bg-[#08325c] text-white"
                              : "text-[#637381] hover:text-[#08325c]"
                          }`}
                        >
                          Contrato
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocAtivo("proposta")}
                          className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-colors ${
                            docEfetivo === "proposta"
                              ? "bg-[#08325c] text-white"
                              : "text-[#637381] hover:text-[#08325c]"
                          }`}
                        >
                          Proposta
                        </button>
                      </div>
                    )}
                  </div>

                  {pdfUrlOriginal && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg border-[#919eab]/30 px-2.5 text-[10px] font-bold text-[#08325c] hover:bg-[#F4F6F8] hover:text-[#08325c] shadow-sm transition-all"
                      onClick={() =>
                        window.open(
                          pdfUrlOriginal,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      Abrir externo{" "}
                      <ExternalLink
                        data-icon="inline-end"
                        className="ml-1.5 size-3"
                      />
                    </Button>
                  )}
                </div>
                <div className="flex-1 w-full bg-[#F4F6F8] rounded-xl overflow-hidden border border-[#919eab]/15">
                  {pdfUrlEmbed ? (
                    <iframe
                      key={pdfUrlEmbed}
                      src={pdfUrlEmbed}
                      className="w-full h-full min-h-[450px] sm:min-h-[550px] border-0"
                      title={`Visualizador de ${tipoPdf}`}
                      allow="autoplay"
                    />
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center py-20">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm border border-[#919eab]/20">
                        <FileText className="size-6 text-[#919eab]/60" />
                      </div>
                      <p className="text-[13px] font-bold text-[#212B36]">
                        Nenhum arquivo disponível
                      </p>
                      <p className="mt-1 max-w-sm text-[11px] text-[#637381]">
                        A base de dados não informou um link válido de contrato
                        ou proposta.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ModalDetalhesContrato;
