"use client";

import { ArrowUpRight, BookOpen, FileCheck2, Info, Scale, ShieldCheck } from "lucide-react";

const documentos = [
  {
    category: "Guia prático",
    title: "Cartilha: Eventos Festivos",
    description: "Boas práticas para orientar gestores na aplicação responsável de recursos públicos em festas e celebrações.",
    icon: BookOpen,
  },
  {
    category: "Normativa",
    title: "Instrução Normativa nº XX/2023",
    description: "Regras e prazos para o envio de informações sobre contratos de shows ao sistema LicitaWeb.",
    icon: Scale,
  },
  {
    category: "Alerta de controle",
    title: "Súmula de Alerta: Calamidade Pública",
    description: "Orientações aos municípios em situação de emergência sobre as restrições para contratar eventos festivos.",
    icon: ShieldCheck,
  },
];

export default function LegislacaoPage() {
  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-10 pt-6 text-[#212b36] md:px-10 md:pt-8 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-[960px]">
        
        {/* CABEÇALHO DA PÁGINA */}
        <header className="mb-6 flex flex-col gap-4 border-b border-[#dfe3e8] pb-6 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#637381]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#08325c]" aria-hidden="true" />
              Eventos Festivos
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#08325c] md:text-4xl">
              Legislação e guias
            </h1>
            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-[#637381]">
              Consulte orientações e documentos para planejar eventos com segurança, transparência e responsabilidade.
            </p>
          </div>
        </header>

        {/* CONTAINER PRINCIPAL */}
        <div className="overflow-hidden rounded-2xl border border-[#dfe3e8] bg-white shadow-[0_8px_24px_rgba(33,43,54,.06)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          
          {/* CABEÇALHO DO CARD COM GRADIENTE PREMIUM E MAIS DENSO */}
          <section className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center px-5 py-4 md:px-8 border-b border-[#08325c]/10 bg-[linear-gradient(135deg,#020d1c_0%,#08325c_50%,#1a5a9c_100%)] overflow-hidden" aria-label="Busca de documentos">
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-48 h-48 bg-[#6BAED6] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-[17px] font-black tracking-[-.03em] text-white">Documentos para consulta</h2>
              <p className="mt-0.5 text-[12px] text-white/70 font-medium">Encontre rapidamente a orientação que precisa.</p>
            </div>
            <span className="relative z-10 text-[10px] font-extrabold uppercase tracking-wider text-white bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm">
              3 documentos
            </span>
          </section>

          <section className="px-5 md:px-8" aria-labelledby="lista-documentos">
            <h2 id="lista-documentos" className="sr-only">Lista de documentos</h2>
            <div className="divide-y divide-[#dfe3e8]">
              {documentos.map(({ category, title, description, icon: Icon }) => (
                <a
                  href="#documento"
                  key={title}
                  className="group flex flex-col gap-3 py-5 transition first:pt-6 last:pb-6 hover:bg-[#F4F6F8]/60 sm:flex-row sm:items-start sm:gap-5 sm:px-2"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#dfe3e8] bg-[#fbfcfd] text-[#08325c] group-hover:border-[#08325c]/20 group-hover:bg-[#08325c]/5 transition-colors">
                    <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#637381]">{category}</p>
                    <h3 className="text-[15px] font-black text-[#212b36] group-hover:text-[#08325c] transition-colors">{title}</h3>
                    <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-[#637381]">{description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#08325c] sm:mt-6 group-hover:translate-x-1 transition-transform">
                    Consultar <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* RODAPÉ DO CARD MAIS LEVE */}
          <aside className="flex gap-3 border-t border-[#dfe3e8] bg-[#fbfcfd] px-5 py-4 md:px-8" aria-label="Orientação">
            <Info className="mt-0.5 shrink-0 text-[#08325c]" size={16} strokeWidth={2.4} aria-hidden="true" />
            <p className="text-[12px] font-medium leading-relaxed text-[#637381]">
              <strong className="font-extrabold text-[#212b36]">Antes de contratar:</strong> confira as orientações aplicáveis ao seu município e mantenha os documentos do processo organizados.
            </p>
          </aside>
        </div>

        {/* RODAPÉ DA PÁGINA */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-2 text-center text-[11px] font-semibold text-[#919eab] sm:flex-row sm:text-left">
          <span>TCE Ceará · Controle social e responsabilidade na gestão pública</span>
          <span className="inline-flex items-center gap-1.5"><FileCheck2 size={13} aria-hidden="true" /> Informação oficial</span>
        </footer>
        
      </div>
    </main>
  );
}