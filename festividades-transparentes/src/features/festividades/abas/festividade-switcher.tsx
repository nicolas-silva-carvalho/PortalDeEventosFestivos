"use client";

import { useState } from "react";
import { LayoutDashboard, Map, Mic2, CalendarRange, Home } from "lucide-react";

import { VisaoGeral } from "./visao-geral";
import { Programacao } from "./programacao";
import { Municipios } from "./municipios";
import { AbaAtracoes } from "./atracoes";

type AbaId = "geral" | "municipios" | "atracoes" | "programacao";

export function FestividadeSwitcher() {
  const [abaAtiva, setAbaAtiva] = useState<AbaId>("geral");

  const ABAS = [
    { id: "geral", label: "Visão Geral", icon: LayoutDashboard },
    { id: "programacao", label: "Programação", icon: CalendarRange },
    { id: "municipios", label: "Municípios", icon: Map },
    { id: "atracoes", label: "Atrações", icon: Mic2 },
  ] as const;

  const ABAS_MOBILE = [
    { id: "geral", label: "Visão Geral", icon: LayoutDashboard },
    { id: "programacao", label: "Programação", icon: CalendarRange },
    { id: "inicio", label: "Início", icon: Home },
    { id: "municipios", label: "Municípios", icon: Map },
    { id: "atracoes", label: "Atrações", icon: Mic2 },
  ] as const;

  return (
    <div className="w-full flex flex-col font-sans">
      <div className="w-full bg-white pt-4 md:pt-10">
        <div className="hidden md:flex w-full justify-center gap-2 md:border-b border-[#919eab]/20 px-4">
          {ABAS.map((aba) => {
            const isAtiva = abaAtiva === aba.id;
            const Icone = aba.icon;
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`relative flex items-center gap-2 px-6 py-3.5 rounded-t-xl text-[13px] font-bold transition-colors outline-none select-none border -mb-[1px] ${
                  isAtiva
                    ? "bg-[#F4F6F8] text-[#08325c] border-[#919eab]/20 border-b-[#F4F6F8] z-10"
                    : "bg-transparent text-[#637381] border-transparent hover:bg-[#F4F6F8]/80 hover:text-[#212B36] z-0"
                }`}
              >
                <Icone
                  className={`w-[18px] h-[16px] transition-all duration-300 ${
                    isAtiva ? "stroke-[2.5px]" : "stroke-[2px] opacity-70"
                  }`}
                />
                <span className="whitespace-nowrap">{aba.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-full bg-[#F4F6F8] animate-in fade-in duration-500 min-h-[600px] border-t border-[#919eab]/20 md:border-t-0 pb-[90px] md:pb-0">
        {abaAtiva === "geral" && <VisaoGeral />}
        {abaAtiva === "programacao" && <Programacao />}
        {abaAtiva === "municipios" && <Municipios />}
        {abaAtiva === "atracoes" && <AbaAtracoes />}
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-[#919eab]/20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-[100] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center h-[64px]">
          {ABAS_MOBILE.map((aba) => {
            const isInicio = aba.id === "inicio";
            const isAtiva = !isInicio && abaAtiva === aba.id;
            const Icone = aba.icon;
            return (
              <div key={aba.id} className="flex-1 flex justify-center h-full relative">
                {isInicio ? (
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setAbaAtiva("geral");
                    }}
                    className="flex flex-col items-center justify-center w-full h-full outline-none tap-highlight-transparent"
                  >
                    <div className="absolute -top-5 flex items-center justify-center w-[52px] h-[52px] rounded-full shadow-[0_4px_12px_rgba(8,50,92,0.25)] transition-all duration-300 z-10 bg-[#08325c] text-white active:scale-95">
                      <Icone size={24} strokeWidth={2.5} />
                    </div>
                    <span className="absolute bottom-1.5 text-[10px] whitespace-nowrap transition-colors duration-300 text-[#08325c] font-bold">
                      {aba.label}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setAbaAtiva(aba.id as AbaId)}
                    className="flex flex-col items-center justify-center w-full h-full gap-1 outline-none tap-highlight-transparent"
                  >
                    <Icone
                      size={22}
                      className={`transition-all duration-300 ${isAtiva ? "text-[#08325c] -translate-y-0.5" : "text-[#919eab]"}`}
                      strokeWidth={isAtiva ? 2.5 : 2}
                    />
                    <span
                      className={`text-[10px] whitespace-nowrap transition-all duration-300 ${
                        isAtiva ? "text-[#08325c] font-bold" : "text-[#919eab] font-medium"
                      }`}
                    >
                      {aba.label}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}