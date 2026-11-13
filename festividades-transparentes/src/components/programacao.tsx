"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Calendar, MapPin, Mic2, Users, CircleDollarSign,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock, X, Map
} from "lucide-react";
import type { EventoConfig } from "@/config/eventos";
import { slugify } from "@/lib/slugify";
import { FiltrosLaterais } from "./filtros/filtros-laterais";
import MapView from "./map-view";

const CEARA_GEOJSON_URL = "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-23-mun.json";

const ESCALA_UNIFICADA = [
  { min: 5000000, cor: "#08306B", label: "Acima de R$ 5 mi", textColor: "#ffffff" },
  { min: 1000000, cor: "#2171B5", label: "R$ 1 mi a 5 mi", textColor: "#ffffff" },
  { min: 500000, cor: "#6BAED6", label: "R$ 500k a 1 mi", textColor: "#ffffff" },
  { min: 1, cor: "#C6DBEF", label: "Até R$ 500k", textColor: "#08306B" },
  { min: 0, cor: "#F0F3F7", label: "Sem registros", textColor: "#637381" },
];

const MESES_EXTENSO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const ROTULOS_TIPO_EVENTO: Record<string, string> = {
  carnaval: "Carnaval",
  pre_carnaval: "Pré-Carnaval",
  sao_joao: "São João",
  reveillon: "Réveillon",
  aniversario: "Aniversário / Emancipação",
  festas_religiosas: "Festas Religiosas / Padroeiro",
  natal: "Natal",
  outros: "Outros Eventos"
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatarData(data?: Date) {
  if (!data) return "Data a definir";
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

interface ProgramacaoProps {
  dadosGlobais: any;
  configGlobal: EventoConfig;
}

export function Programacao({ dadosGlobais, configGlobal }: ProgramacaoProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, any>>({});
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string | null>(null);

  const [buscaMun, setBuscaMun] = useState("");
  const [ordemMun, setOrdemMun] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'totalEstimado', dir: 'desc' });
  const [pageMun, setPageMun] = useState(1);

  const [buscaProg, setBuscaProg] = useState("");
  const [ordemProg, setOrdemProg] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'dataTimestamp', dir: 'asc' });
  const [pageProg, setPageProg] = useState(1);

  const ITEMS_PER_PAGE_MUN = 11;
  const ITEMS_PER_PAGE_PROG = 10;

  useEffect(() => {
    fetch(CEARA_GEOJSON_URL)
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error("Erro ao carregar GeoJSON:", err));
  }, []);

  const municipioParaMapa = useMemo(() => {
    if (municipioSelecionado) return municipioSelecionado;
    if (filtrosAtivos.municipios && filtrosAtivos.municipios.length === 1) {
      return filtrosAtivos.municipios[0];
    }
    return null;
  }, [municipioSelecionado, filtrosAtivos.municipios]);

  const analise = useMemo(() => {
    const contratosBrutos = dadosGlobais?.rankingContratacoes || [];

    const eventosPorMunicipioMap: Record<string, any> = {};
    const programacaoGeral: any[] = [];
    const valoresPorMunFiltrado: Record<string, number> = {};

    let totalAtracoesGlobais = 0;
    let totalValorGlobal = 0;

    contratosBrutos.forEach((c: any, index: number) => {
      let dataGasto = c.dataEvento ? new Date(c.dataEvento) : c.dataContratacao ? new Date(c.dataContratacao) : undefined;
      let anoContrato = dataGasto ? dataGasto.getUTCFullYear() : (c.ano || null);
      let mesIndex = dataGasto ? dataGasto.getUTCMonth() : -1;

      if (filtrosAtivos.ano && filtrosAtivos.ano !== "Todos" && String(anoContrato) !== String(filtrosAtivos.ano)) return;
      if (filtrosAtivos.municipios?.length > 0 && !filtrosAtivos.municipios.includes(c.municipio)) return;
      if (filtrosAtivos.atracoes?.length > 0 && !filtrosAtivos.atracoes.includes(c.fornecedorOuArtista)) return;

      const tipoRotulo = ROTULOS_TIPO_EVENTO[c.tipoEvento] || c.tipoEvento || c.tematicaEvento;
      if (filtrosAtivos.tiposEvento?.length > 0 && !filtrosAtivos.tiposEvento.includes(tipoRotulo)) return;

      const nomeReal = c.nomeEventoOutros || c.tematicaEvento || tipoRotulo || "Evento Não Identificado";
      if (filtrosAtivos.nomesEventos?.length > 0 && !filtrosAtivos.nomesEventos.includes(nomeReal)) return;

      if (filtrosAtivos.meses?.length > 0 && filtrosAtivos.meses.length < 12 && mesIndex >= 0) {
        const nomeMesExtenso = MESES_EXTENSO[mesIndex];
        if (nomeMesExtenso && !filtrosAtivos.meses.includes(nomeMesExtenso)) return;
      }

      if (c.categoria !== "atracoes") return;

      const valor = Number(c.valor) || 0;
      const municipioNome = c.municipio || "Não Informado";

      if (c.municipio) {
        const slug = slugify(c.municipio);
        valoresPorMunFiltrado[slug] = (valoresPorMunFiltrado[slug] || 0) + valor;

        if (c.categoria === "atracoes") {
          totalAtracoesGlobais += 1;
          totalValorGlobal += valor;
        }
      }

      if (municipioSelecionado && c.municipio !== municipioSelecionado) return;

      if (c.categoria === "atracoes") {

        if (c.municipio) {
          const chaveEventoMun = `${municipioNome}_${nomeReal}`;
          if (!eventosPorMunicipioMap[chaveEventoMun]) {
            eventosPorMunicipioMap[chaveEventoMun] = {
              id: chaveEventoMun,
              municipio: municipioNome,
              nomeEvento: nomeReal,
              totalAtracoes: 0,
              totalEstimado: 0,
            };
          }
          eventosPorMunicipioMap[chaveEventoMun].totalAtracoes += 1;
          eventosPorMunicipioMap[chaveEventoMun].totalEstimado += valor;
        }

        let horarioLimpo = (c.horarioShow || c.horario || c.hora || "A definir").toString().trim();
        if (horarioLimpo === "") horarioLimpo = "A definir";

        programacaoGeral.push({
          id: `${municipioNome}-${index}`,
          municipio: municipioNome,
          nomeEvento: nomeReal,
          data: dataGasto,
          dataTimestamp: dataGasto ? dataGasto.getTime() : 9999999999999,
          dataFormatada: formatarData(dataGasto),
          horario: horarioLimpo,
          atracao: c.fornecedorOuArtista || "Atração não informada",
          valor,
        });
      }
    });

    return {
      quadroMunicipios: Object.values(eventosPorMunicipioMap),
      quadroProgramacao: programacaoGeral,
      valoresPorMunFiltrado,
      totalAtracoesGlobais,
      totalValorGlobal
    };
  }, [dadosGlobais, filtrosAtivos, municipioSelecionado]);

  const contagemEscala = useMemo(() => {
    const counts = Array(ESCALA_UNIFICADA.length).fill(0);
    let munsComFesta = 0;

    Object.values(analise.valoresPorMunFiltrado).forEach((val) => {
      if (val > 0) {
        munsComFesta++;
        const idx = ESCALA_UNIFICADA.findIndex((e) => val >= e.min);
        if (idx !== -1) counts[idx]++;
      }
    });
    counts[ESCALA_UNIFICADA.length - 1] = Math.max(0, 184 - munsComFesta);
    return counts;
  }, [analise.valoresPorMunFiltrado]);

  const opcoesDinamicas = useMemo(() => {
    const contratos = dadosGlobais?.rankingContratacoes || [];
    const muns = new Set<string>();
    const tiposSet = new Set<string>();
    const nomesSet = new Set<string>();
    const atracoesSet = new Set<string>();

    contratos.forEach((c: any) => {
      if (c.municipio) muns.add(c.municipio);
      const tipoRotulo = ROTULOS_TIPO_EVENTO[c.tipoEvento] || c.tipoEvento || c.tematicaEvento;
      if (tipoRotulo) tiposSet.add(tipoRotulo);
      const nomeReal = c.nomeEventoOutros || c.tematicaEvento || tipoRotulo;
      if (nomeReal) nomesSet.add(nomeReal);
      if (c.categoria === "atracoes" && c.fornecedorOuArtista) {
        atracoesSet.add(c.fornecedorOuArtista);
      }
    });

    return {
      municipios: Array.from(muns).sort(),
      tiposEvento: Array.from(tiposSet).sort(),
      nomesEvento: Array.from(nomesSet).sort(),
      atracoes: Array.from(atracoesSet).sort(),
    };
  }, [dadosGlobais]);

  const munsProcessados = useMemo(() => {
    let filtrado = [...analise.quadroMunicipios];
    if (buscaMun) {
      filtrado = filtrado.filter(m =>
        m.municipio.toLowerCase().includes(buscaMun.toLowerCase()) ||
        m.nomeEvento.toLowerCase().includes(buscaMun.toLowerCase())
      );
    }
    return filtrado.sort((a, b) => {
      const vA = a[ordemMun.col as keyof typeof a];
      const vB = b[ordemMun.col as keyof typeof b];
      if (typeof vA === 'string' && typeof vB === 'string') return ordemMun.dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      if (vA < vB) return ordemMun.dir === 'asc' ? -1 : 1;
      if (vA > vB) return ordemMun.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [analise.quadroMunicipios, buscaMun, ordemMun]);

  const totaisTabela1 = useMemo(() => {
    let sumAtracoes = 0;
    let sumValores = 0;
    munsProcessados.forEach(m => {
      sumAtracoes += m.totalAtracoes;
      sumValores += m.totalEstimado;
    });
    const pct = analise.totalValorGlobal > 0 ? (sumValores / analise.totalValorGlobal) * 100 : 0;
    return { atracoes: sumAtracoes, valor: sumValores, pct: pct };
  }, [munsProcessados, analise.totalValorGlobal]);

  const progProcessada = useMemo(() => {
    let filtrado = [...analise.quadroProgramacao];
    if (buscaProg) {
      filtrado = filtrado.filter(p =>
        p.municipio.toLowerCase().includes(buscaProg.toLowerCase()) ||
        p.nomeEvento.toLowerCase().includes(buscaProg.toLowerCase()) ||
        p.atracao.toLowerCase().includes(buscaProg.toLowerCase())
      );
    }
    return filtrado.sort((a, b) => {
      const vA = a[ordemProg.col as keyof typeof a];
      const vB = b[ordemProg.col as keyof typeof b];
      if (typeof vA === 'string' && typeof vB === 'string') return ordemProg.dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      if (vA < vB) return ordemProg.dir === 'asc' ? -1 : 1;
      if (vA > vB) return ordemProg.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [analise.quadroProgramacao, buscaProg, ordemProg]);

  const handleSort = (tabela: 'mun' | 'prog', coluna: string) => {
    if (tabela === 'mun') setOrdemMun(prev => ({ col: coluna, dir: prev.col === coluna && prev.dir === 'desc' ? 'asc' : 'desc' }));
    else setOrdemProg(prev => ({ col: coluna, dir: prev.col === coluna && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const RenderSortIconDark = ({ tabela, coluna }: { tabela: 'mun' | 'prog', coluna: string }) => {
    const estado = tabela === 'mun' ? ordemMun : ordemProg;
    if (estado.col !== coluna) return null;
    return estado.dir === 'asc' ? <ChevronUp size={14} className="inline ml-1 text-[#08325c]" /> : <ChevronDown size={14} className="inline ml-1 text-[#08325c]" />;
  };

  const paginatedMun = useMemo(() => munsProcessados.slice((pageMun - 1) * ITEMS_PER_PAGE_MUN, pageMun * ITEMS_PER_PAGE_MUN), [munsProcessados, pageMun]);
  const paginatedProg = useMemo(() => progProcessada.slice((pageProg - 1) * ITEMS_PER_PAGE_PROG, pageProg * ITEMS_PER_PAGE_PROG), [progProcessada, pageProg]);

  const totalPagesMun = Math.ceil(munsProcessados.length / ITEMS_PER_PAGE_MUN);
  const totalPagesProg = Math.ceil(progProcessada.length / ITEMS_PER_PAGE_PROG);

  const toggleMunicipio = (nome: string) => {
    setMunicipioSelecionado(prev => prev === nome ? null : nome);
    setPageMun(1);
    setPageProg(1);
  };

  return (
    <div className="w-full bg-[#F4F6F8] py-8 border-[#919eab]/20 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-6 xl:px-12 flex flex-col xl:flex-row gap-8 items-start">

        <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-[100px] z-10">
          <FiltrosLaterais
            onConsultar={setFiltrosAtivos}
            opcoesAno={["2024", "2025", "2026", "2027"]}
            opcoesMes={MESES_EXTENSO}
            opcoesMunicipio={opcoesDinamicas.municipios}
            opcoesTipoEvento={opcoesDinamicas.tiposEvento}
            opcoesNomeEvento={opcoesDinamicas.nomesEvento}
            opcoesAtracao={opcoesDinamicas.atracoes}
          />
        </div>

        <div className="flex-1 w-full flex flex-col min-w-0 gap-6">

          {municipioSelecionado && (
            <div className="flex flex-wrap items-center gap-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[13px] font-bold text-[#637381] mr-2">Filtro Ativo:</span>
              <button
                onClick={() => setMunicipioSelecionado(null)}
                className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-[0px_4px_8px_rgba(8,50,92,0.2)]"
              >
                Município: {municipioSelecionado} <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            <div className="lg:col-span-6 flex flex-col">
              <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col h-[700px]">
                
                <div className="bg-[#08325c] p-3 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h4 className="text-[13px] font-extrabold uppercase tracking-wider">Lista de Eventos</h4>
                    <p className="text-[10px] text-white/70 font-normal">Agrupado por Município</p>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#919eab]" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={buscaMun}
                      onChange={e => { setBuscaMun(e.target.value); setPageMun(1); }}
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 focus:bg-white/10 w-[120px] sm:w-[150px] transition-all"
                    />
                  </div>
                </div>
                
                <div className="w-full flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  <table className="w-full text-left min-w-[450px]">
                    <thead className="bg-[#F4F6F8] sticky top-0 shadow-xs text-[11px] font-extrabold text-[#637381] uppercase cursor-pointer select-none z-10">
                      <tr>
                        <th className="py-2.5 px-4 hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('mun', 'municipio')}>
                          Município <RenderSortIconDark tabela="mun" coluna="municipio" />
                        </th>
                        <th className="py-2.5 px-3 hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('mun', 'nomeEvento')}>
                          Nome do Evento <RenderSortIconDark tabela="mun" coluna="nomeEvento" />
                        </th>
                        <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('mun', 'totalAtracoes')}>
                          Nº de Atrações <RenderSortIconDark tabela="mun" coluna="totalAtracoes" />
                        </th>
                        <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('mun', 'totalEstimado')}>
                          Custo das Atrações <RenderSortIconDark tabela="mun" coluna="totalEstimado" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                      {paginatedMun.length > 0 ? (
                        paginatedMun.map((item, i) => {
                          const isSelected = municipioSelecionado === item.municipio;
                          return (
                            <tr 
                              key={i} 
                              onClick={() => toggleMunicipio(item.municipio)}
                              className={`cursor-pointer transition-colors group ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                            >
                              <td className={`py-3 px-4 font-bold ${isSelected ? "text-[#08325c]" : "text-[#212B36] group-hover:text-[#08325c]"}`}>{item.municipio}</td>
                              <td className="py-3 px-3 font-semibold text-[#637381]">{item.nomeEvento}</td>
                              <td className="py-3 px-3 text-center font-bold text-[#00A76F]">
                                <span className="bg-[#00A76F]/10 px-2.5 py-0.5 rounded-full">{item.totalAtracoes}</span>
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-[#08325c]">{formatarMoeda(item.totalEstimado)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan={4} className="py-8 text-center text-[#919eab] italic">Nenhum evento encontrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#F4F6F8] border-t border-[#919eab]/20 flex flex-col mt-auto">
                  <div className="px-4 py-2.5 bg-white flex items-center justify-between text-[11px] font-extrabold text-[#08325c] border-b border-[#919eab]/10">
                    <span className="uppercase tracking-wider">Total Consolidado</span>
                    <div className="flex items-center gap-6">
                      <span className="text-[#212B36]">{totaisTabela1.atracoes} Atrações</span>
                      <span className="text-[#08325c] text-[12px]">{formatarMoeda(totaisTabela1.valor)}</span>
                      <span className="text-[#00A76F]">{totaisTabela1.pct.toFixed(1).replace('.', ',')}%</span>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-[#637381]">
                    <span>
                      Exibindo {munsProcessados.length > 0 ? (pageMun - 1) * ITEMS_PER_PAGE_MUN + 1 : 0} - {Math.min(pageMun * ITEMS_PER_PAGE_MUN, munsProcessados.length)} de {munsProcessados.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="mr-1">Pág {pageMun} de {totalPagesMun || 1}</span>
                      <button 
                        onClick={() => setPageMun(p => Math.max(1, p - 1))} 
                        disabled={pageMun === 1} 
                        className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 text-[#212B36]"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        onClick={() => setPageMun(p => Math.min(totalPagesMun, p + 1))} 
                        disabled={pageMun === totalPagesMun || totalPagesMun === 0} 
                        className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 text-[#212B36]"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col relative h-[700px]">
                <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] mb-4 text-center shrink-0 flex items-center justify-center gap-2">
                  <MapPin size={16} /> Mapa de Gastos
                </h4>

                <div className="w-full flex-1 rounded-xl overflow-hidden bg-[#F4F6F8] relative">
                  {geoData ? (
                    <MapView
                      geoData={geoData}
                      valoresPorMunicipio={analise.valoresPorMunFiltrado}
                      escala={ESCALA_UNIFICADA}
                      municipioSelecionadoMapa={municipioParaMapa}
                      onCityClick={(nome) => toggleMunicipio(nome)}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08325c]"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-dashed border-[#919eab]/30 shrink-0">
                  {ESCALA_UNIFICADA.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5" title={`${contagemEscala[idx]} municípios`}>
                      <span className="w-3 h-3 rounded-[3px] shadow-sm border border-black/10" style={{ backgroundColor: item.cor }}></span>
                      <span className="text-[10px] md:text-[11px] font-bold text-[#637381] uppercase tracking-wide">
                        {item.label} <span className="text-[#08325c]">({contagemEscala[idx]})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="w-full flex flex-col mt-2">
            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col min-h-[420px]">

              <div className="bg-[#08325c] p-3 text-white flex justify-between items-center">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider">Programação por Dia</h4>
                  <p className="text-[10px] text-white/70 font-normal">Grade de shows e atrações musicais</p>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#919eab]" />
                  <input
                    type="text"
                    placeholder="Buscar atração..."
                    value={buscaProg}
                    onChange={e => { setBuscaProg(e.target.value); setPageProg(1); }}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 focus:bg-white/10 w-[140px] sm:w-[180px] transition-all"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[650px]">
                  <thead className="bg-[#F4F6F8] sticky top-0 shadow-xs text-[11px] font-extrabold text-[#637381] uppercase cursor-pointer select-none z-10">
                    <tr>
                      <th className="py-2.5 px-4 hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('prog', 'nomeEvento')}>
                        Nome do Evento <RenderSortIconDark tabela="prog" coluna="nomeEvento" />
                      </th>
                      <th className="py-2.5 px-3 hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('prog', 'municipio')}>
                        Município <RenderSortIconDark tabela="prog" coluna="municipio" />
                      </th>
                      <th className="py-2.5 px-3 hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('prog', 'dataTimestamp')}>
                        Data / Hora <RenderSortIconDark tabela="prog" coluna="dataTimestamp" />
                      </th>
                      <th className="py-2.5 px-4 hover:bg-[#919eab]/10 transition-colors" onClick={() => handleSort('prog', 'atracao')}>
                        Atração <RenderSortIconDark tabela="prog" coluna="atracao" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                    {paginatedProg.length > 0 ? (
                      paginatedProg.map((item) => {
                        const isSelected = municipioSelecionado === item.municipio;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => toggleMunicipio(item.municipio)}
                            className={`cursor-pointer transition-colors group ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                          >
                            <td className="py-3 px-4 font-bold text-[#08325c]">{item.nomeEvento}</td>
                            <td className={`py-3 px-3 font-semibold ${isSelected ? "text-[#08325c]" : "text-[#637381] group-hover:text-[#08325c]"}`}>
                              {item.municipio}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#212B36]">{item.dataFormatada}</span>
                                <span className="text-[10px] text-[#919eab] font-bold flex items-center gap-1">
                                  <Clock size={10} /> {item.horario}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-extrabold text-[#212B36]">{item.atracao}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="py-8 text-center text-[#919eab] italic">Nenhuma atração encontrada.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#F4F6F8] border-t border-[#919eab]/20 p-2.5 shrink-0 flex items-center justify-between text-[11px] font-bold text-[#637381]">
                <span>Exibindo {progProcessada.length > 0 ? (pageProg - 1) * ITEMS_PER_PAGE_PROG + 1 : 0} - {Math.min(pageProg * ITEMS_PER_PAGE_PROG, progProcessada.length)} de {progProcessada.length} atrações</span>
                <div className="flex items-center gap-2">
                  <span className="mr-1">Pág {pageProg} de {totalPagesProg || 1}</span>
                  <button onClick={() => setPageProg(p => Math.max(1, p - 1))} disabled={pageProg === 1} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 text-[#212B36]"><ChevronLeft size={14} /></button>
                  <button onClick={() => setPageProg(p => Math.min(totalPagesProg, p + 1))} disabled={pageProg === totalPagesProg || totalPagesProg === 0} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 text-[#212B36]"><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}