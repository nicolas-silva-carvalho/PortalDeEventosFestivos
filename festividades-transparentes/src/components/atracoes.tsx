// src/components/atracoes.tsx
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Mic2,
  Users,
  Building2,
  MapPin,
  X
} from "lucide-react";
import { FiltrosLaterais } from "./filtros/filtros-laterais";
import type { EventoConfig } from "@/config/eventos";
import { slugify } from "@/lib/slugify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { CustomTooltip } from "./ui/custom-tooltip";
import { formatarCpfCnpj } from "@/lib/utils";
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
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

function getCorEvento(nome: string) {
  const map: Record<string, string> = {
    "Pré-Carnaval": "#00B8D9", Carnaval: "#346699", "Festejos Juninos": "#d35400", "São João": "#d35400",
    "Emancipação Política/Aniversário do Município": "#8E33FF", Aniversários: "#8E33FF",
    "Festas Religiosas": "#00A76F", Religiosas: "#00A76F", Natal: "#FF5630", Réveillon: "#b8860b", Outros: "#637381",
  };
  return map[nome] || "#94af20";
}

interface AbaAtracoesProps {
  dadosGlobais: any;
  configGlobal: EventoConfig;
}

export function AbaAtracoes({ dadosGlobais, configGlobal }: AbaAtracoesProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, any>>({});
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string | null>(null);

  useEffect(() => {
    fetch(CEARA_GEOJSON_URL).then((res) => res.json()).then(setGeoData).catch(console.error);
  }, []);

  const [pageArtistas, setPageArtistas] = useState(1);
  const [pageRep, setPageRep] = useState(1);
  const [pageMunEvt, setPageMunEvt] = useState(1);
  const [pageMun, setPageMun] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [buscaArtista, setBuscaArtista] = useState("");
  const [buscaRep, setBuscaRep] = useState("");

  const [ordemArtistas, setOrdemArtistas] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "total", dir: "desc" });
  const [ordemRep, setOrdemRep] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "total", dir: "desc" });
  const [ordemMunEvt, setOrdemMunEvt] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "total", dir: "desc" });
  const [ordemMun, setOrdemMun] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "totalGasto", dir: "desc" });

  const toggleMunicipio = (nome: string | null) => {
    setMunicipioSelecionado((prev) => (prev === nome ? null : nome));
    setPageArtistas(1);
    setPageRep(1);
    setPageMunEvt(1);
    setPageMun(1);
  };

  const analise = useMemo(() => {
    const contratosBrutos = dadosGlobais?.rankingContratacoes || [];
    const municipiosBase = dadosGlobais?.municipios || [];
    
    const atracoesMap = new Map();
    const repMap = new Map();
    const munEvtArtMap = new Map();
    
    const totalPorFestividadeMes: Record<string, Record<string, number>> = {};
    const totalPorMes: Record<string, number> = {};
    let totalGastoAtracoes = 0;
    const valoresPorMunFiltrado: Record<string, number> = {};

    contratosBrutos.forEach((c: any) => {
      let dataGasto = c.dataEvento ? new Date(c.dataEvento) : c.dataContratacao ? new Date(c.dataContratacao) : null;
      let anoContrato = dataGasto ? dataGasto.getUTCFullYear() : c.ano || null;
      let mesIndex = dataGasto ? dataGasto.getUTCMonth() : -1;
      const mesNome = mesIndex >= 0 ? MESES_EXTENSO[mesIndex] : "Não Informado";

      if (filtrosAtivos.ano && filtrosAtivos.ano !== "Todos" && String(anoContrato) !== String(filtrosAtivos.ano)) return;
      if (filtrosAtivos.municipios?.length > 0 && !filtrosAtivos.municipios.includes(c.municipio)) return;
      if (filtrosAtivos.tiposEvento?.length > 0 && !filtrosAtivos.tiposEvento.includes(c.nomeEvento)) return;
      if (filtrosAtivos.meses?.length > 0 && filtrosAtivos.meses.length < 12 && !filtrosAtivos.meses.includes(mesNome)) return;
      
      if (filtrosAtivos.nomesEventos?.length > 0 && !filtrosAtivos.nomesEventos.includes(c.nomeEvento)) return;
      
      const atracoesSelecionadas = filtrosAtivos.atracoes || filtrosAtivos.atracao || [];
      if (atracoesSelecionadas.length > 0 && !atracoesSelecionadas.includes(c.fornecedorOuArtista)) return;
      
      if (c.categoria !== "atracoes") return;

      const valor = Number(c.valor) || 0;
      
      if (c.municipio) {
        const slug = slugify(c.municipio);
        valoresPorMunFiltrado[slug] = (valoresPorMunFiltrado[slug] || 0) + valor;
      }

      if (municipioSelecionado && c.municipio !== municipioSelecionado) return;

      const festividade = c.nomeEvento || "Outros";
      const artista = c.fornecedorOuArtista || "Não informado";
      const razao = c.razaoSocial || "Não informado";
      const cnpj = c.cnpjContratada || razao;
      const municipio = c.municipio || "Não informado";

      totalGastoAtracoes += valor;

      if (!atracoesMap.has(artista)) {
        atracoesMap.set(artista, { nome: artista, count: 0, min: Infinity, max: -Infinity, total: 0 });
      }
      const artObj = atracoesMap.get(artista);
      artObj.count++;
      artObj.total += valor;
      if (valor < artObj.min) artObj.min = valor;
      if (valor > artObj.max) artObj.max = valor;

      if (!repMap.has(cnpj)) {
        repMap.set(cnpj, { cnpj, razaoSocial: razao, atracoesSet: new Set(), count: 0, total: 0 });
      }
      const repObj = repMap.get(cnpj);
      repObj.count++;
      repObj.total += valor;
      if (artista !== "Não informado") repObj.atracoesSet.add(artista);

      const meaKey = `${municipio}|${festividade}|${artista}`;
      if (!munEvtArtMap.has(meaKey)) {
        munEvtArtMap.set(meaKey, { municipio, festividade, artista, count: 0, total: 0 });
      }
      const meaObj = munEvtArtMap.get(meaKey);
      meaObj.count++;
      meaObj.total += valor;

      if (!totalPorFestividadeMes[mesNome]) totalPorFestividadeMes[mesNome] = {};
      totalPorFestividadeMes[mesNome][festividade] = (totalPorFestividadeMes[mesNome][festividade] || 0) + valor;
      totalPorMes[mesNome] = (totalPorMes[mesNome] || 0) + valor;
    });

    const rankingArtistas = Array.from(atracoesMap.values()).map(a => ({
      ...a, min: a.min === Infinity ? 0 : a.min, max: a.max === -Infinity ? 0 : a.max
    }));

    const rankingRep = Array.from(repMap.values()).map(r => ({
      ...r, qtdAtracoes: r.atracoesSet.size
    }));

    const listaMunEvtArt = Array.from(munEvtArtMap.values());

    const mapaMunicipiosUnicos = new Map();
    
    municipiosBase.forEach((m: any) => {
      if (!mapaMunicipiosUnicos.has(m.municipio)) {
        mapaMunicipiosUnicos.set(m.municipio, { 
          municipio: m.municipio, 
          contratacoes: [] 
        });
      }
      if (m.contratacoes) {
        mapaMunicipiosUnicos.get(m.municipio).contratacoes.push(...m.contratacoes);
      }
    });

    const listaMunicipios = Array.from(mapaMunicipiosUnicos.values())
      .filter((m: any) => !municipioSelecionado || m.municipio === municipioSelecionado)
      .map((m: any) => {
        const contMun = (m.contratacoes || []).filter((c: any) => {
          if (c.categoria !== "atracoes") return false;
          let d = c.dataEvento ? new Date(c.dataEvento) : null;
          let anoCont = d ? d.getUTCFullYear() : c.ano;
          
          if (filtrosAtivos.ano && filtrosAtivos.ano !== "Todos" && String(anoCont) !== String(filtrosAtivos.ano)) return false;
          if (filtrosAtivos.tiposEvento?.length > 0 && !filtrosAtivos.tiposEvento.includes(c.nomeEvento)) return false;
          if (filtrosAtivos.nomesEventos?.length > 0 && !filtrosAtivos.nomesEventos.includes(c.nomeEvento)) return false;
          
          const atracoesSelecionadas = filtrosAtivos.atracoes || filtrosAtivos.atracao || [];
          if (atracoesSelecionadas.length > 0 && !atracoesSelecionadas.includes(c.fornecedorOuArtista)) return false;

          return true;
        });
        
        const gastoMun = contMun.reduce((acc: number, c: any) => acc + (Number(c.valor) || 0), 0);
        
        return {
          municipio: m.municipio,
          temFestividade: gastoMun > 0,
          qtdContratações: contMun.length,
          totalGasto: gastoMun,
          percentual: totalGastoAtracoes > 0 ? (gastoMun / totalGastoAtracoes) * 100 : 0
        };
      });

    const chartFestMes = MESES_EXTENSO.filter(mes => totalPorFestividadeMes[mes])
      .map(mes => ({ name: mes, ...totalPorFestividadeMes[mes] }));
    
    const chartDespesaMes = MESES_EXTENSO.filter(mes => totalPorMes[mes])
      .map(mes => ({ name: mes, value: totalPorMes[mes] }));

    return {
      rankingArtistas,
      rankingRep,
      listaMunEvtArt,
      listaMunicipios,
      chartFestMes,
      chartDespesaMes,
      totalGastoAtracoes,
      valoresPorMunFiltrado
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
    const eventosSet = new Set<string>();
    const munsSet = new Set<string>();
    const atracoesSet = new Set<string>();

    (dadosGlobais?.rankingContratacoes || []).forEach((c: any) => {
      if (c.nomeEvento) eventosSet.add(c.nomeEvento);
      if (c.municipio) munsSet.add(c.municipio);
      if (c.categoria === "atracoes" && c.fornecedorOuArtista) {
        atracoesSet.add(c.fornecedorOuArtista);
      }
    });

    return { 
      eventos: Array.from(eventosSet).sort(), 
      municipios: Array.from(munsSet).sort(),
      atracoes: Array.from(atracoesSet).sort()
    };
  }, [dadosGlobais]);

  function aplicarFiltroEOrdenacao(lista: any[], busca: string, colBusca: string[], configOrdem: { col: string, dir: string }) {
    let filtrado = [...lista];
    if (busca) {
      const q = busca.toLowerCase();
      filtrado = filtrado.filter(item => 
        colBusca.some(col => (item[col] || "").toString().toLowerCase().includes(q))
      );
    }
    return filtrado.sort((a, b) => {
      let vA = a[configOrdem.col];
      let vB = b[configOrdem.col];
      if (typeof vA === "string") vA = vA.toLowerCase();
      if (typeof vB === "string") vB = vB.toLowerCase();
      if (vA < vB) return configOrdem.dir === "asc" ? -1 : 1;
      if (vA > vB) return configOrdem.dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const artProcessados = aplicarFiltroEOrdenacao(analise.rankingArtistas, buscaArtista, ["nome"], ordemArtistas);
  const repProcessados = aplicarFiltroEOrdenacao(analise.rankingRep, buscaRep, ["razaoSocial", "cnpj"], ordemRep);
  const munEvtProcessados = aplicarFiltroEOrdenacao(analise.listaMunEvtArt, "", [], ordemMunEvt);
  const munProcessados = aplicarFiltroEOrdenacao(analise.listaMunicipios, "", [], ordemMun);

  const RenderSortIcon = ({ estadoOrdem, coluna }: { estadoOrdem: any, coluna: string }) => {
    if (estadoOrdem.col !== coluna) return null;
    return estadoOrdem.dir === "asc" ? <ChevronUp size={12} className="inline ml-1 text-[#08325c]" /> : <ChevronDown size={12} className="inline ml-1 text-[#08325c]" />;
  };

  const alternarOrdem = (setOrdem: any, coluna: string) => {
    setOrdem((prev: any) => ({ col: coluna, dir: prev.col === coluna && prev.dir === "desc" ? "asc" : "desc" }));
  };

  const PaginationControls = ({ page, setPage, totalItems }: { page: number, setPage: any, totalItems: number }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    return (
      <div className="bg-[#F4F6F8] border-t border-[#919eab]/20 p-2.5 shrink-0 flex items-center justify-between text-[11px] font-bold text-[#637381]">
        <span>Exibindo {totalItems > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(page * ITEMS_PER_PAGE, totalItems)} de {totalItems}</span>
        <div className="flex items-center gap-2">
          <span className="mr-1">Pág {page} de {totalPages || 1}</span>
          <button onClick={() => setPage((p: number) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
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
            opcoesTipoEvento={opcoesDinamicas.eventos}
            opcoesNomeEvento={opcoesDinamicas.eventos}
            opcoesAtracao={opcoesDinamicas.atracoes}
          />
        </div>

        <div className="flex-1 w-full flex flex-col min-w-0 gap-6">
          
          {municipioSelecionado && (
            <div className="flex flex-wrap items-center gap-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[13px] font-bold text-[#637381] mr-2">Filtro Ativo no Mapa:</span>
              <button
                onClick={() => toggleMunicipio(null)}
                className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-[0px_4px_8px_rgba(8,50,92,0.2)]"
              >
                Município: {municipioSelecionado} <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col relative h-[700px]">
              <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] mb-4 text-center shrink-0 flex items-center justify-center gap-2">
                <MapPin size={16} /> Mapa de Atrações
              </h4>
              <div className="w-full flex-1 rounded-xl overflow-hidden bg-[#F4F6F8] relative">
                {geoData ? (
                  <MapView
                    geoData={geoData}
                    valoresPorMunicipio={analise.valoresPorMunFiltrado}
                    escala={ESCALA_UNIFICADA}
                    municipioSelecionadoMapa={municipioSelecionado}
                    onCityClick={(nome: string) => toggleMunicipio(nome)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08325c]"></div></div>
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

            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#919eab]/24 shadow-[0_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col h-[700px]">
              <div className="border-b border-dashed border-[#919eab]/30 p-4 shrink-0">
                <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                  <MapPin size={16} /> Município / Evento / Atração
                </h4>
              </div>
              
              <div className="w-full flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left min-w-[380px]">
                  <thead className="bg-[#F4F6F8] text-[10px] font-extrabold text-[#637381] uppercase select-none cursor-pointer sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="py-2.5 px-4 hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMunEvt, "artista")}>
                        Local e Atração <RenderSortIcon estadoOrdem={ordemMunEvt} coluna="artista" />
                      </th>
                      <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMunEvt, "count")}>
                        Nº Contratos <RenderSortIcon estadoOrdem={ordemMunEvt} coluna="count" />
                      </th>
                      <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMunEvt, "total")}>
                        Valor Total <RenderSortIcon estadoOrdem={ordemMunEvt} coluna="total" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                    {munEvtProcessados.slice((pageMunEvt - 1) * ITEMS_PER_PAGE, pageMunEvt * ITEMS_PER_PAGE).map((item, idx) => {
                      const isSelected = municipioSelecionado === item.municipio;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => toggleMunicipio(item.municipio)}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[#08325c]">{item.artista}</span>
                              <span className="text-[#637381] text-[10px]">{item.municipio} • {item.festividade}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.count}</td>
                          <td className="py-2.5 px-4 text-right font-extrabold">{formatarMoeda(item.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={pageMunEvt} setPage={setPageMunEvt} totalItems={munEvtProcessados.length} />
            </div>

          </div>

          <div className="flex flex-col gap-6">

            <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-[450px]">
              <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                    <TrendingUp size={16} /> Festividade Mês a Mês
                  </h4>
                  <p className="text-[10px] text-[#637381] font-medium mt-0.5">Evolução dos gastos de atrações por tipo de evento</p>
                </div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analise.chartFestMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#637381", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#637381" }} width={60} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      cursor={{ stroke: "rgba(145, 158, 171, 0.2)", strokeWidth: 2, strokeDasharray: "3 3" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const itensComValor = payload.filter((item) => item.value && Number(item.value) > 0);
                          if (itensComValor.length === 0) return null;
                          return (
                            <div className="bg-[#212B36] p-3.5 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex flex-col gap-2 border-none outline-none">
                              <span className="text-white text-[13px] font-bold border-b border-white/10 pb-1.5 mb-0.5">{label}</span>
                              {itensComValor.map((entry: any, i: number) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCorEvento(entry.name) }} />
                                    <span className="text-[#919eab] text-[12px] font-semibold">{entry.name}:</span>
                                  </div>
                                  <span className="text-white text-[12px] font-extrabold">{formatarMoeda(entry.value)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px", fontWeight: 600, color: "#637381" }} iconType="circle" />
                    {opcoesDinamicas.eventos.map((evento) => (
                      <Line key={evento} type="monotone" dataKey={evento} stroke={getCorEvento(evento)} strokeWidth={3} dot={{ r: 3, fill: getCorEvento(evento), strokeWidth: 0 }} activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-[350px]">
              <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                    <BarChart3 size={16} /> Despesa Consolidada
                  </h4>
                  <p className="text-[10px] text-[#637381] font-medium mt-0.5">Total gasto em atrações por mês (Todos os Eventos)</p>
                </div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analise.chartDespesaMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#637381", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#637381" }} width={60} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(145, 158, 171, 0.08)" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#212B36] p-3.5 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex flex-col gap-2 border-none outline-none">
                              <span className="text-[#919eab] text-[11px] font-semibold uppercase">{label}</span>
                              <span className="text-white text-[14px] font-extrabold">{formatarMoeda(payload[0].value as number)}</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#08325c" radius={[4, 4, 0, 0]} barSize={32} className="transition-all duration-300 hover:brightness-110 cursor-pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col">
              <div className="bg-[#08325c] p-3 flex justify-between items-center">
                <div>
                  <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Mic2 size={16} /> Ranking de Cachês por Artista
                  </h4>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#919eab]" />
                  <input type="text" placeholder="Buscar artista..." value={buscaArtista} onChange={(e) => { setBuscaArtista(e.target.value); setPageArtistas(1); }} className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 w-[180px] transition-all" />
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-[#F4F6F8] text-[11px] font-extrabold text-[#637381] uppercase select-none cursor-pointer">
                    <tr>
                      <th className="py-3 px-4 hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemArtistas, "nome")}>
                        Nome da Atração <RenderSortIcon estadoOrdem={ordemArtistas} coluna="nome" />
                      </th>
                      <th className="py-3 px-3 text-center hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemArtistas, "count")}>
                        Contratações <RenderSortIcon estadoOrdem={ordemArtistas} coluna="count" />
                      </th>
                      <th className="py-3 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemArtistas, "min")}>
                        Menor Cachê <RenderSortIcon estadoOrdem={ordemArtistas} coluna="min" />
                      </th>
                      <th className="py-3 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemArtistas, "max")}>
                        Maior Cachê <RenderSortIcon estadoOrdem={ordemArtistas} coluna="max" />
                      </th>
                      <th className="py-3 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemArtistas, "total")}>
                        Total Arrecadado <RenderSortIcon estadoOrdem={ordemArtistas} coluna="total" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                    {artProcessados.slice((pageArtistas - 1) * ITEMS_PER_PAGE, pageArtistas * ITEMS_PER_PAGE).map((art, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F6F8] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#08325c] truncate max-w-[250px]">
                          <CustomTooltip content={art.nome} position="top">
                            <span className="cursor-default">{art.nome}</span>
                          </CustomTooltip>
                        </td>
                        <td className="py-3 px-3 text-center"><span className="bg-[#919eab]/10 px-2 py-0.5 rounded-md font-bold">{art.count}</span></td>
                        <td className="py-3 px-4 text-right text-[#637381]">{formatarMoeda(art.min)}</td>
                        <td className="py-3 px-4 text-right text-[#637381]">{formatarMoeda(art.max)}</td>
                        <td className="py-3 px-4 text-right font-extrabold">{formatarMoeda(art.total)}</td>
                      </tr>
                    ))}
                    {artProcessados.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-[#919eab] italic font-semibold">Nenhum artista encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={pageArtistas} setPage={setPageArtistas} totalItems={artProcessados.length} />
            </div>

            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col">
              <div className="bg-[#08325c] p-3 flex justify-between items-center">
                <div>
                  <h4 className="text-[13px] font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} /> Contratações por Representante Legal
                  </h4>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#919eab]" />
                  <input type="text" placeholder="Buscar CNPJ ou Razão..." value={buscaRep} onChange={(e) => { setBuscaRep(e.target.value); setPageRep(1); }} className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 w-[180px] transition-all" />
                </div>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-[#F4F6F8] text-[11px] font-extrabold text-[#637381] uppercase select-none cursor-pointer">
                    <tr>
                      <th className="py-3 px-4 hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemRep, "razaoSocial")}>
                        Razão Social / Credor <RenderSortIcon estadoOrdem={ordemRep} coluna="razaoSocial" />
                      </th>
                      <th className="py-3 px-4 hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemRep, "cnpj")}>
                        CNPJ / CPF <RenderSortIcon estadoOrdem={ordemRep} coluna="cnpj" />
                      </th>
                      <th className="py-3 px-3 text-center hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemRep, "qtdAtracoes")}>
                        Qtd. Atrações <RenderSortIcon estadoOrdem={ordemRep} coluna="qtdAtracoes" />
                      </th>
                      <th className="py-3 px-3 text-center hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemRep, "count")}>
                        Total Contratos <RenderSortIcon estadoOrdem={ordemRep} coluna="count" />
                      </th>
                      <th className="py-3 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemRep, "total")}>
                        Valor Total <RenderSortIcon estadoOrdem={ordemRep} coluna="total" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                    {repProcessados.slice((pageRep - 1) * ITEMS_PER_PAGE, pageRep * ITEMS_PER_PAGE).map((rep, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F6F8] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#08325c] truncate max-w-[250px]">
                          <CustomTooltip content={rep.razaoSocial || "-"} position="top">
                            <span className="cursor-default">{rep.razaoSocial || "-"}</span>
                          </CustomTooltip>
                        </td>
                        <td className="py-3 px-4 text-[#637381] tracking-wide">{formatarCpfCnpj(rep.cnpj)}</td>
                        <td className="py-3 px-3 text-center"><span className="bg-[#00A76F]/10 text-[#00A76F] px-2 py-0.5 rounded-md font-bold">{rep.qtdAtracoes}</span></td>
                        <td className="py-3 px-3 text-center"><span className="bg-[#919eab]/10 px-2 py-0.5 rounded-md font-bold">{rep.count}</span></td>
                        <td className="py-3 px-4 text-right font-extrabold">{formatarMoeda(rep.total)}</td>
                      </tr>
                    ))}
                    {repProcessados.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-[#919eab] italic font-semibold">Nenhum representante encontrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={pageRep} setPage={setPageRep} totalItems={repProcessados.length} />
            </div>

            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col h-[550px]">
              <div className="border-b border-dashed border-[#919eab]/30 p-4 shrink-0 flex items-center justify-between">
                <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                  <Building2 size={16} /> Desdobramento por Municípios
                </h4>
                <div className="text-right">
                  <span className="text-[10px] text-[#637381] font-medium uppercase tracking-wide block">Total de Atrações</span>
                  <span className="text-[14px] font-extrabold text-[#00A76F]">{formatarMoeda(analise.totalGastoAtracoes)}</span>
                </div>
              </div>
              
              <div className="w-full flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left min-w-[380px]">
                  <thead className="bg-[#F4F6F8] text-[10px] font-extrabold text-[#637381] uppercase select-none cursor-pointer sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="py-2.5 px-4 hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMun, "municipio")}>
                        Município <RenderSortIcon estadoOrdem={ordemMun} coluna="municipio" />
                      </th>
                      <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMun, "temFestividade")}>
                        Festividade? <RenderSortIcon estadoOrdem={ordemMun} coluna="temFestividade" />
                      </th>
                      <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMun, "qtdContratações")}>
                        Contratos <RenderSortIcon estadoOrdem={ordemMun} coluna="qtdContratações" />
                      </th>
                      <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMun, "totalGasto")}>
                        Valor Total <RenderSortIcon estadoOrdem={ordemMun} coluna="totalGasto" />
                      </th>
                      <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => alternarOrdem(setOrdemMun, "percentual")}>
                        % do Total <RenderSortIcon estadoOrdem={ordemMun} coluna="percentual" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                    {munProcessados.slice((pageMun - 1) * ITEMS_PER_PAGE, pageMun * ITEMS_PER_PAGE).map((m: any, idx: number) => {
                      const isSelected = municipioSelecionado === m.municipio;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => toggleMunicipio(m.municipio)} 
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                        >
                          <td className="py-2.5 px-4 font-bold text-[#08325c]">{m.municipio}</td>
                          <td className="py-2.5 px-3 text-center">
                            {m.temFestividade ? (
                              <span className="bg-[#00A76F]/10 text-[#00A76F] px-2 py-0.5 rounded text-[9px] font-bold uppercase">Sim</span>
                            ) : (
                              <span className="bg-[#919eab]/10 text-[#637381] px-2 py-0.5 rounded text-[9px] font-bold uppercase">Não</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{m.qtdContratações}</td>
                          <td className="py-2.5 px-4 text-right font-extrabold">{formatarMoeda(m.totalGasto)}</td>
                          <td className="py-2.5 px-4 text-right text-[#637381] font-bold">{m.percentual.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls page={pageMun} setPage={setPageMun} totalItems={munProcessados.length} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}