"use client";

import {
  Calendar,
  Building2,
  Mic2,
  CircleDollarSign,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { KpiCard } from "./kpi-card";

interface HomeHeroProps {
  kpis: {
    exercicio: string | number | number[];
    municipios: number;
    artistas: number;
    valorTotal: number;
  };
  dataVerificacao?: string;
  nomesMunicipios?: string[];
}

function formatarValorKPI(valor: number) {
  if (valor >= 1e9) {
    return `R$ ${(valor / 1e9).toFixed(2).replace(".", ",")} Bi`;
  }
  if (valor >= 1e6) {
    return `R$ ${(valor / 1e6).toFixed(2).replace(".", ",")} Mi`;
  }
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarExercicio(exercicio: string | number | number[]) {
  if (Array.isArray(exercicio)) {
    if (exercicio.length === 0) return "Geral";
    if (exercicio.length === 1) return exercicio[0];

    const min = Math.min(...exercicio);
    const max = Math.max(...exercicio);
    return `${min} a ${max}`;
  }

  if (typeof exercicio === "string" && exercicio.includes(",")) {
    const anos = exercicio.split(",").map((v) => parseInt(v.trim()));
    const min = Math.min(...anos);
    const max = Math.max(...anos);
    return `${min} a ${max}`;
  }

  return exercicio || "Geral";
}

export function HomeHero({
  kpis,
  dataVerificacao,
  nomesMunicipios = [],
}: HomeHeroProps) {
  const dataConferencia = dataVerificacao || "23 Set 2026";

  const MAX_VISIVEIS = 6;
  const municipiosVisiveis = nomesMunicipios.slice(0, MAX_VISIVEIS);
  const municipiosRestantes = nomesMunicipios.length - MAX_VISIVEIS;

  return (
    <div className="w-full min-h-[100dvh] pt-[100px] lg:pt-[120px] pb-10 relative overflow-hidden font-sans flex flex-col justify-between border-b border-[#08325c]/20 z-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(107,174,214,0.25),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(14,91,139,0.4),transparent_40%),linear-gradient(135deg,#020d1c_0%,#08325c_40%,#0a3c6e_75%,#03182e_100%)]" />
      <section className="w-full max-w-[1300px] mx-auto px-6 md:px-12 relative z-10 flex flex-col my-auto gap-8 lg:gap-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-12">
          <div className="md:w-[55%] flex flex-col gap-3 lg:gap-5 min-w-0 w-full">
            <div className="flex flex-col mt-6">
              <h1 className="text-4xl md:text-5xl lg:text-[68px] font-extrabold text-white leading-[1.1] tracking-tight uppercase drop-shadow-lg">
                Portal de <br /> <span className="text-[#ffffff]">Eventos</span>{" "}
                Festivos
              </h1>
              {/* <div className="h-1.5 w-16 lg:w-24 bg-[#6BAED6] mt-3 lg:mt-6 rounded-full opacity-90 shadow-[0_0_12px_rgba(107,174,214,0.6)]"></div> */}
            </div>
            <p className="text-blue-50/80 text-[13px] md:text-[14px] lg:text-[16px] leading-relaxed font-medium mt-1 lg:mt-2 max-w-[600px] text-justify">
              O Painel de Eventos dos Municípios Cearenses é uma ferramenta
              desenvolvida pelo{" "}
              <strong className="text-white font-extrabold">
                Tribunal de Contas do Estado do Ceará (TCE Ceará)
              </strong>{" "}
              que promove a transparência pública e incentiva a participação
              cidadã através do controle social dos recursos públicos
              programados para serem realizados com festividades.
            </p>
            {nomesMunicipios.length > 0 && (
              <div
                className="mt-2 w-full overflow-hidden relative group"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                  maskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                }}
              >
                <div className="flex w-max animate-[marqueeScroll_55s_linear_infinite] group-hover:[animation-play-state:paused] gap-2 items-center">
                  {[...nomesMunicipios, ...nomesMunicipios].map(
                    (nome, index) => (
                      <span
                        key={index}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-[#08325c]/80 to-[#0a3c6e]/80 border border-[#6BAED6]/30 text-blue-50 text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-full shadow-[0_2px_8px_rgba(2,13,28,0.4)] backdrop-blur-md whitespace-nowrap transition-all duration-300 hover:border-[#6BAED6]/70 hover:from-[#08325c] hover:to-[#104a82] cursor-default"
                      >
                        {nome}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="md:w-[45%] flex justify-end relative mt-6 md:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] lg:w-[350px] h-[220px] lg:h-[350px] bg-[#6BAED6] rounded-full blur-[90px] lg:blur-[120px] -z-10 opacity-20"></div>
            <img
              src="/logo_ceara2.png"
              alt="Mapa do Estado do Ceará"
              width={480}
              height={480}
              className="object-contain w-full max-w-[200px] md:max-w-[260px] lg:max-w-[420px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] brightness-110 relative z-10"
            />
          </div>
        </div>
        <div className="w-full max-w-[1050px] mx-auto bg-white rounded-2xl shadow-[0px_20px_40px_rgba(2,13,28,0.4)] border border-white/10 overflow-hidden relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 w-full items-stretch">
            <div className="w-full h-full flex flex-col justify-center border-r border-b md:border-b-0 border-dashed border-[#08325c]/20">
              <KpiCard
                titulo="Exercício Apurado"
                valor={formatarExercicio(kpis.exercicio)}
                icone={Calendar}
                cor="#08325c"
              />
            </div>
            <div className="w-full h-full flex flex-col justify-center border-b md:border-b-0 md:border-r border-dashed border-[#08325c]/20">
              <KpiCard
                titulo="Municípios Participantes"
                valor={kpis.municipios}
                icone={Building2}
                cor="#08325c"
              />
            </div>
            <div className="w-full h-full flex flex-col justify-center border-r border-dashed border-[#08325c]/20">
              <KpiCard
                titulo="Artistas Contratados"
                valor={kpis.artistas}
                icone={Mic2}
                cor="#08325c"
              />
            </div>
            <div className="w-full h-full flex flex-col justify-center">
              <KpiCard
                titulo="Valor Total Previsto"
                valor={formatarValorKPI(kpis.valorTotal)}
                icone={CircleDollarSign}
                cor="#08325c"
              />
            </div>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 px-4 py-1.5 bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_50%,ffffff_100%)] border-t border-[#919eab]/20 overflow-hidden text-[10px] font-bold">
            <div className="flex items-center gap-1.5 uppercase tracking-wider relative z-10 text-[#637381]">
              <ShieldCheck
                size={14}
                className="text-[#08325c]"
                strokeWidth={2.5}
              />
              <span>Painel Monitorizado Oficialmente</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-[#919eab]/20 px-2 py-1 rounded-md shadow-[0_2px_8px_rgba(145,158,171,0.08)] relative z-10 transition-colors hover:bg-[#f4f6f8]">
              <span className="uppercase tracking-widest text-[#637381]">
                Última Conferência:{" "}
                <span className="text-[#102a43] font-black drop-shadow-sm">
                  {dataConferencia}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
