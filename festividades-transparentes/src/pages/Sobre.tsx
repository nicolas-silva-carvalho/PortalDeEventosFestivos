"use client";

import { ArrowRight, BarChart3, CheckCircle2, Info, ShieldCheck, Target, Users } from "lucide-react";
import {Link} from "react-router-dom";

const sections = [
  {
    number: "01",
    icon: Info,
    title: "O que é o Portal?",
    text: "O Portal de Eventos Festivos reúne informações sobre gastos públicos com artistas, infraestrutura e serviços ligados a Carnaval, São João e outras festividades realizadas pelos 184 municípios cearenses.",
  },
  {
    number: "02",
    icon: Target,
    title: "Nosso objetivo",
    text: "Ampliar o controle social e apoiar a análise responsável dos recursos públicos. A plataforma facilita a identificação de valores fora do padrão e de despesas incompatíveis com a realidade financeira do município.",
  },
  {
    number: "03",
    icon: Users,
    title: "O papel do cidadão",
    text: "Qualquer cidadão, jornalista ou investigador pode consultar os dados, comparar informações e acompanhar como o dinheiro do seu município está sendo investido.",
  },
];

const highlights = [
  { value: "184", label: "municípios acompanhados" },
  { value: "01", label: "fonte de informação pública" },
  { value: "100%", label: "foco em transparência" },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-10 pt-6 text-[#212b36] md:px-10 md:pt-8 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-[960px]">
        
        {/* CABEÇALHO DA PÁGINA */}
        <header className="mb-6 flex flex-col gap-4 border-b border-[#dfe3e8] pb-6 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#637381]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#08325c]" aria-hidden="true" />
              Transparência pública
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#08325c] md:text-4xl">
              Sobre o Portal
            </h1>
            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-[#637381]">
              Informação clara para acompanhar, entender e fiscalizar os investimentos públicos em eventos festivos no Ceará.
            </p>
          </div>
          <div className="flex items-center gap-3 text-left md:max-w-[200px] md:pb-1 mt-2 md:mt-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#08325c] text-white">
              <BarChart3 size={17} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <p className="text-[11px] font-bold leading-tight text-[#637381]">
              Dados para decisões mais responsáveis.
            </p>
          </div>
        </header>

        {/* DESTAQUES NUMÉRICOS */}
        <section className="mb-6 grid overflow-hidden rounded-xl border border-[#dfe3e8] bg-white shadow-[0_4px_12px_rgba(33,43,54,.04)] sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100" aria-label="Resumo do portal">
          {highlights.map((item, index) => (
            <div key={item.label} className={`px-5 py-4 ${index > 0 ? "border-t border-[#dfe3e8] sm:border-l sm:border-t-0" : ""}`}>
              <p className="text-xl font-black tracking-[-.04em] text-[#08325c]">{item.value}</p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#637381]">{item.label}</p>
            </div>
          ))}
        </section>

        {/* SEÇÃO PRINCIPAL DE CONTEÚDO */}
        <section className="overflow-hidden rounded-2xl border border-[#dfe3e8] bg-white shadow-[0_8px_24px_rgba(33,43,54,.06)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200" aria-labelledby="como-funciona">
          
          {/* CABEÇALHO DO CARD COM GRADIENTE PREMIUM */}
          <div className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center px-5 py-4 md:px-8 border-b border-[#08325c]/10 bg-[linear-gradient(135deg,#020d1c_0%,#08325c_50%,#1a5a9c_100%)] overflow-hidden">
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-48 h-48 bg-[#6BAED6] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 id="como-funciona" className="text-[17px] font-black tracking-[-.03em] text-white">Como o portal contribui</h2>
              <p className="mt-0.5 text-[12px] text-white/70 font-medium uppercase tracking-[.14em]">Entenda a iniciativa</p>
            </div>
            <span className="relative z-10 text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm">
              TCE Ceará
            </span>
          </div>

          <div className="divide-y divide-[#dfe3e8] px-5 md:px-8">
            {sections.map(({ number, icon: Icon, title, text }) => (
              <article key={title} className="group grid gap-3 py-5 md:grid-cols-[40px_1fr] md:gap-5 hover:bg-[#F4F6F8]/60 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3e8] bg-[#fbfcfd] text-[#08325c] group-hover:border-[#08325c]/20 group-hover:bg-[#08325c]/5 transition-colors">
                  <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
                </div>
                <div className="relative">
                  <span className="absolute right-0 top-0 text-[10px] font-black tracking-[.12em] text-[#b0b8c1]">{number}</span>
                  <h3 className="pr-8 text-[15px] font-black text-[#212b36] group-hover:text-[#08325c] transition-colors">{title}</h3>
                  <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-[#637381]">{text}</p>
                </div>
              </article>
            ))}
          </div>

          {/* RODAPÉ DO CARD MAIS LEVE */}
          <div className="flex flex-col gap-4 border-t border-[#dfe3e8] bg-[#fbfcfd] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} strokeWidth={2.4} className="text-[#08325c]" aria-hidden="true" />
              <div>
                <p className="text-[13px] font-extrabold tracking-tight text-[#212b36]">Controle social começa com informação.</p>
                <p className="text-[11px] text-[#637381] font-medium">Consulte os dados e acompanhe o seu município.</p>
              </div>
            </div>
            
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#08325c] bg-[#08325c]/5 hover:bg-[#08325c]/10 px-3 py-2 rounded-lg transition-colors border border-[#08325c]/10"
            >
              Explorar o portal <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* RODAPÉ DA PÁGINA */}
        <footer className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-[#919eab]">
          <CheckCircle2 size={13} aria-hidden="true" />
          TCE Ceará · Controle social e responsabilidade na gestão pública
        </footer>
      </div>
    </main>
  );
}