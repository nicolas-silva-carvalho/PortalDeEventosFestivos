"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, FilterX, ChevronDown, Filter, Check } from "lucide-react";

interface FiltrosLateraisProps {
  filtrosAtivos?: any;
  onConsultar?: (filtros: any) => void;
  disabled?: boolean;
  // CORREÇÃO: Adicionado "readonly" em todas as opções
  opcoesAno?: readonly string[];
  opcoesMes?: readonly string[];
  opcoesMunicipio?: readonly string[];
  opcoesTipoEvento?: readonly string[];
  opcoesNomeEvento?: readonly string[];
  opcoesAtracao?: readonly string[];
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[]; // <-- CORREÇÃO
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1" ref={dropdownRef}>
      <label className="text-[12px] font-bold text-[#637381] ml-0.5">{label}</label>
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center bg-white rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 shadow-[0px_2px_10px_rgba(0,0,0,0.02)]
            ${disabled ? "bg-[#F4F6F8] cursor-not-allowed opacity-70" : "cursor-pointer"}
            ${isOpen ? "border border-[#08325c] ring-1 ring-[#08325c]" : "border border-[#919eab]/30 hover:border-[#919eab]/60"}
          `}
        >
          <span className={disabled ? "text-[#919eab]" : "text-[#212B36] truncate mr-2"}>{value}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#919eab] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-[#919eab]/20 rounded-lg shadow-[0px_8px_24px_rgba(145,158,171,0.16)] max-h-48 overflow-y-auto py-1.5 animate-in fade-in duration-200">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`px-3 py-1.5 text-[12px] font-semibold cursor-pointer transition-colors
                  ${value === opt ? "bg-[#08325c]/5 text-[#08325c]" : "text-[#212B36] hover:bg-[#F4F6F8]"}
                `}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterMultiSelect({
  label,
  selecionados,
  onChange,
  options,
  disabled,
  placeholder = "Todos",
}: {
  label: string;
  selecionados: string[];
  onChange: (val: string[]) => void;
  options: readonly string[]; // <-- CORREÇÃO
  disabled?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const opcoesFiltradas = useMemo(() => {
    if (!busca) return options;
    return options.filter(o => o.toLowerCase().includes(busca.toLowerCase()));
  }, [options, busca]);

  const handleToggleItem = (opcao: string) => {
    if (selecionados.includes(opcao)) {
      onChange(selecionados.filter(item => item !== opcao));
    } else {
      onChange([...selecionados, opcao]);
    }
  };

  return (
    <div className="flex flex-col gap-1" ref={dropdownRef}>
      <label className="text-[12px] font-bold text-[#637381] ml-0.5">{label}</label>
      <div className="relative">

        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center bg-white rounded-lg px-3 py-2 text-[13px] transition-all duration-200 shadow-[0px_2px_10px_rgba(0,0,0,0.02)]
            ${disabled ? "bg-[#F4F6F8] cursor-not-allowed opacity-70" : "cursor-pointer"}
            ${isOpen ? "border border-[#08325c] ring-1 ring-[#08325c]" : "border border-[#919eab]/30 hover:border-[#919eab]/60"}
          `}
        >
          <div className="flex flex-wrap gap-1 flex-1 overflow-hidden mr-2">
            {selecionados.length === 0 ? (
              <span className="text-[#919eab] font-semibold">{placeholder}</span>
            ) : selecionados.length === options.length && options.length > 0 ? (
              <span className="text-[#08325c] font-bold">Todos selecionados</span>
            ) : (
              <span className="text-[#08325c] font-bold truncate">
                {selecionados.length} selecionado(s)
              </span>
            )}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-[#919eab] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-[#919eab]/20 rounded-lg shadow-[0px_8px_24px_rgba(145,158,171,0.16)] flex flex-col overflow-hidden animate-in fade-in duration-200">

            <div className="p-2 bg-[#F4F6F8] border-b border-[#919eab]/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#919eab]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Pesquisar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-white border border-[#919eab]/30 rounded-md pl-8 pr-3 py-1.5 text-[12px] font-medium text-[#212B36] outline-none focus:border-[#08325c] transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 border-b border-dashed border-[#919eab]/30 bg-white">
              <button
                onClick={(e) => { e.stopPropagation(); onChange([...options]); }} // <-- Convertido
                className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
              >
                Selecionar Todos
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onChange([]); }}
                className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors"
              >
                Limpar
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5">
              {opcoesFiltradas.length === 0 ? (
                <span className="text-[12px] text-[#919eab] p-2 text-center italic font-medium">Sem resultados.</span>
              ) : (
                opcoesFiltradas.map(opcao => {
                  const isChecked = selecionados.includes(opcao);
                  return (
                    <label
                      key={opcao}
                      onClick={(e) => { e.preventDefault(); handleToggleItem(opcao); }}
                      className="flex items-center gap-2.5 p-2 hover:bg-[#F4F6F8] rounded-md cursor-pointer transition-colors group"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${isChecked ? 'bg-[#08325c] border-transparent' : 'border-[#919eab]/40 group-hover:border-[#08325c]'}`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                      <span className={`text-[12px] truncate ${isChecked ? 'font-bold text-[#08325c]' : 'font-semibold text-[#637381]'}`}>
                        {opcao}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FiltrosLaterais({
  filtrosAtivos = {},
  onConsultar,
  disabled,
  opcoesAno = [],
  opcoesMes = [],
  opcoesMunicipio = [],
  opcoesTipoEvento = [],
  opcoesNomeEvento = [],
  opcoesAtracao = []
}: FiltrosLateraisProps) {

  const [ano, setAno] = useState(filtrosAtivos.ano || "Todos");
  
  // CORREÇÃO: Transformamos as props em arrays mutáveis com o [...espalhamento]
  const [tiposEvento, setTiposEvento] = useState<string[]>(filtrosAtivos.tiposEvento?.length ? filtrosAtivos.tiposEvento : [...opcoesTipoEvento]);
  const [meses, setMeses] = useState<string[]>(filtrosAtivos.meses?.length ? filtrosAtivos.meses : [...opcoesMes]);
  const [municipios, setMunicipios] = useState<string[]>(filtrosAtivos.municipios?.length ? filtrosAtivos.municipios : [...opcoesMunicipio]);
  const [nomesEventos, setNomesEventos] = useState<string[]>(filtrosAtivos.nomesEventos?.length ? filtrosAtivos.nomesEventos : [...opcoesNomeEvento]);
  const [atracoes, setAtracoes] = useState<string[]>(filtrosAtivos.atracoes?.length ? filtrosAtivos.atracoes : [...opcoesAtracao]);

  // Sincroniza estado inicial das opções quando a API termina de buscar
  useEffect(() => { if (!filtrosAtivos.tiposEvento?.length && opcoesTipoEvento.length) setTiposEvento([...opcoesTipoEvento]); }, [opcoesTipoEvento.length]);
  useEffect(() => { if (!filtrosAtivos.meses?.length && opcoesMes.length) setMeses([...opcoesMes]); }, [opcoesMes.length]);
  useEffect(() => { if (!filtrosAtivos.municipios?.length && opcoesMunicipio.length) setMunicipios([...opcoesMunicipio]); }, [opcoesMunicipio.length]);
  useEffect(() => { if (!filtrosAtivos.nomesEventos?.length && opcoesNomeEvento.length) setNomesEventos([...opcoesNomeEvento]); }, [opcoesNomeEvento.length]);
  useEffect(() => { if (!filtrosAtivos.atracoes?.length && opcoesAtracao.length) setAtracoes([...opcoesAtracao]); }, [opcoesAtracao.length]);

  // Sincroniza se a URL mudar "por fora" (botão voltar do navegador)
  useEffect(() => {
    if (filtrosAtivos.ano) setAno(filtrosAtivos.ano);
  }, [filtrosAtivos]);

  const limpar = () => {
    setAno("Todos");
    setMeses([...opcoesMes]);
    setMunicipios([...opcoesMunicipio]);
    setTiposEvento([...opcoesTipoEvento]);
    setNomesEventos([...opcoesNomeEvento]);
    setAtracoes([...opcoesAtracao]);

    if (onConsultar) onConsultar({});
  };

  const handleConsultar = () => {
    const filtrosFormatados: Record<string, any> = {};

    if (ano !== "Todos") filtrosFormatados.ano = ano;
    
    if (meses.length > 0 && meses.length < opcoesMes.length) filtrosFormatados.meses = meses;
    if (municipios.length > 0 && municipios.length < opcoesMunicipio.length) filtrosFormatados.municipios = municipios;
    if (tiposEvento.length > 0 && tiposEvento.length < opcoesTipoEvento.length) filtrosFormatados.tiposEvento = tiposEvento;
    if (nomesEventos.length > 0 && nomesEventos.length < opcoesNomeEvento.length) filtrosFormatados.nomesEventos = nomesEventos;
    if (atracoes.length > 0 && atracoes.length < opcoesAtracao.length) filtrosFormatados.atracoes = atracoes;

    if (onConsultar) onConsultar(filtrosFormatados);
  };

  const listaAnosComTodos = ["Todos", ...opcoesAno];

  return (
    <aside className="w-full lg:max-w-[280px] flex flex-col bg-white rounded-2xl p-5 shadow-[0px_8px_24px_rgba(145,158,171,0.08)] border border-[#919eab]/20 font-sans h-fit">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed border-[#919eab]/30">
        <Filter className="w-4 h-4 text-[#08325c]" />
        <h3 className="text-[15px] font-extrabold text-[#212B36] uppercase tracking-wide">
          Filtros
        </h3>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <FilterSelect disabled={disabled} label="Ano do Evento" options={listaAnosComTodos} value={ano} onChange={setAno} />
        <FilterMultiSelect disabled={disabled} label="Mês do Evento" options={opcoesMes} selecionados={meses} onChange={setMeses} placeholder="Nenhum mês" />
        <FilterMultiSelect disabled={disabled} label="Município" options={opcoesMunicipio} selecionados={municipios} onChange={setMunicipios} placeholder="Nenhum município" />
        <FilterMultiSelect disabled={disabled} label="Tipo do Evento" options={opcoesTipoEvento} selecionados={tiposEvento} onChange={setTiposEvento} placeholder="Nenhum tipo" />
        <FilterMultiSelect disabled={disabled} label="Nome do Evento" options={opcoesNomeEvento} selecionados={nomesEventos} onChange={setNomesEventos} placeholder="Nenhum evento" />
        <FilterMultiSelect disabled={disabled} label="Atração" options={opcoesAtracao} selecionados={atracoes} onChange={setAtracoes} placeholder="Nenhuma atração" />
      </div>

      <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-dashed border-[#919eab]/30">
        <button
          onClick={handleConsultar}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-1.5 bg-[#08325c] text-white font-bold text-[13px] py-2.5 rounded-lg transition-all duration-300 hover:bg-[#052240] hover:shadow-[0_8px_16px_0_rgba(8,50,92,0.24)] disabled:opacity-50 disabled:pointer-events-none"
        >
          <Search className="w-3.5 h-3.5" />
          Aplicar Filtros
        </button>

        <button
          onClick={limpar}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-1.5 bg-transparent text-[#637381] font-bold text-[13px] py-2.5 rounded-lg transition-colors hover:bg-[#919eab]/10 disabled:opacity-50 disabled:pointer-events-none"
        >
          <FilterX className="w-3.5 h-3.5" />
          Limpar
        </button>
      </div>
    </aside>
  );
}