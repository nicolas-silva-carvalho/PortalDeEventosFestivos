"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Link as LinkIcon,
  Building2,
  Mic2,
  MapPin,
  X,
  PieChart,
  TrendingUp,
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
  Cell,
} from "recharts";

import { ModalDetalhesContrato } from "./modal/modal-detalhes";
import { CustomTooltip } from "./ui/custom-tooltip";
import MapView from "./map-view";

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

const CEARA_GEOJSON_URL =
  "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-23-mun.json";

const ESCALA_UNIFICADA = [
  {
    min: 5000000,
    cor: "#08306B",
    label: "Acima de R$ 5 mi",
    textColor: "#ffffff",
  },
  {
    min: 1000000,
    cor: "#2171B5",
    label: "R$ 1 mi a 5 mi",
    textColor: "#ffffff",
  },
  {
    min: 500000,
    cor: "#6BAED6",
    label: "R$ 500k a 1 mi",
    textColor: "#ffffff",
  },
  { min: 1, cor: "#C6DBEF", label: "Até R$ 500k", textColor: "#08306B" },
  { min: 0, cor: "#F0F3F7", label: "Sem registros", textColor: "#637381" },
];

const MESES_EXTENSO = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

interface MunicipiosProps {
  dadosGlobais: any;
  configGlobal: EventoConfig;
}

export function Municipios({ dadosGlobais, configGlobal }: MunicipiosProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, any>>({});
  const [municipioSelecionado, setMunicipioSelecionado] = useState<
    string | null
  >(null);

  const [buscaDoc, setBuscaDoc] = useState("");
  const [ordemDoc, setOrdemDoc] = useState<{
    col: string;
    dir: "asc" | "desc";
  }>({ col: "valor", dir: "desc" });
  const [pageDoc, setPageDoc] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [tipoDocModal, setTipoDocModal] = useState<"contrato" | "proposta">(
    "contrato",
  );

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetch(CEARA_GEOJSON_URL)
      .then((res) => res.json())
      .then(setGeoData)
      .catch((err) => console.error("Erro ao carregar GeoJSON:", err));
  }, []);

  const municipioParaMapa = useMemo(() => {
    if (municipioSelecionado) return municipioSelecionado;
    if (filtrosAtivos.municipios && filtrosAtivos.municipios.length === 1)
      return filtrosAtivos.municipios[0];
    return null;
  }, [municipioSelecionado, filtrosAtivos.municipios]);

  const analise = useMemo(() => {
    const contratosBrutos = dadosGlobais?.rankingContratacoes || [];
    const dadosFiltrados: any[] = [];
    const valoresPorMunFiltrado: Record<string, number> = {};

    const totalPorFestividade: Record<string, number> = {};
    const totalPorCategoria: Record<string, number> = {};
    const totalPorFestividadeMes: Record<string, Record<string, number>> = {};
    const totalFestCatMes: Record<string, any> = {};

    contratosBrutos.forEach((c: any) => {
      let dataGasto = c.dataEvento
        ? new Date(c.dataEvento)
        : c.dataContratacao
          ? new Date(c.dataContratacao)
          : null;
      let anoContrato = dataGasto ? dataGasto.getUTCFullYear() : c.ano || null;
      let mesIndex = dataGasto ? dataGasto.getUTCMonth() : -1;
      const mesNome = mesIndex >= 0 ? MESES_EXTENSO[mesIndex] : "Não Informado";

      if (
        filtrosAtivos.ano &&
        filtrosAtivos.ano !== "Todos" &&
        String(anoContrato) !== String(filtrosAtivos.ano)
      )
        return;
      if (
        filtrosAtivos.municipios?.length > 0 &&
        !filtrosAtivos.municipios.includes(c.municipio)
      )
        return;
      if (
        filtrosAtivos.atracoes?.length > 0 &&
        c.categoria === "atracoes" &&
        !filtrosAtivos.atracoes.includes(c.fornecedorOuArtista)
      )
        return;
      if (
        filtrosAtivos.tiposEvento?.length > 0 &&
        !filtrosAtivos.tiposEvento.includes(c.nomeEvento)
      )
        return;
      if (
        filtrosAtivos.nomesEventos?.length > 0 &&
        !filtrosAtivos.nomesEventos.includes(c.nomeEvento)
      )
        return;
      if (
        filtrosAtivos.meses?.length > 0 &&
        filtrosAtivos.meses.length < 12 &&
        !filtrosAtivos.meses.includes(mesNome)
      )
        return;

      const valor = Number(c.valor) || 0;
      const festividade = c.nomeEvento || "Outros";
      const categoria = c.categoria || "Geral";
      const categoriaFormatada =
        categoria.charAt(0).toUpperCase() + categoria.slice(1);

      if (c.municipio) {
        const slug = slugify(c.municipio);
        valoresPorMunFiltrado[slug] =
          (valoresPorMunFiltrado[slug] || 0) + valor;
      }

      if (municipioSelecionado && c.municipio !== municipioSelecionado) return;

      dadosFiltrados.push({
        ...c,
        festividade,
        categoriaFormatada,
      });

      totalPorFestividade[festividade] =
        (totalPorFestividade[festividade] || 0) + valor;
      totalPorCategoria[categoriaFormatada] =
        (totalPorCategoria[categoriaFormatada] || 0) + valor;

      if (!totalPorFestividadeMes[mesNome])
        totalPorFestividadeMes[mesNome] = {};
      totalPorFestividadeMes[mesNome][festividade] =
        (totalPorFestividadeMes[mesNome][festividade] || 0) + valor;

      const chaveMesFest = `${mesNome} - ${festividade}`;
      if (!totalFestCatMes[chaveMesFest]) {
        // Agora usamos a chave completa e guardamos o mesIndex para ordenar depois
        totalFestCatMes[chaveMesFest] = {
          name: chaveMesFest,
          mesIndex: mesIndex,
          festividade: festividade,
        };
      }
      totalFestCatMes[chaveMesFest][categoriaFormatada] =
        (totalFestCatMes[chaveMesFest][categoriaFormatada] || 0) + valor;
    }); // Fim do forEach

    const chartFestividade = Object.entries(totalPorFestividade)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const chartCategoria = Object.entries(totalPorCategoria)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const chartFestMes = MESES_EXTENSO.filter(
      (mes) => totalPorFestividadeMes[mes],
    ).map((mes) => ({ name: mes, ...totalPorFestividadeMes[mes] }));

    // CORREÇÃO: Transforma o objeto em array e ordena cronologicamente!
    const chartFestCatMes = Object.values(totalFestCatMes).sort(
      (a: any, b: any) => {
        // 1º: Ordena pelo mês cronologicamente (Jan, Fev, Mar...)
        if (a.mesIndex !== b.mesIndex) return a.mesIndex - b.mesIndex;
        // 2º: Se for o mesmo mês, ordena por ordem alfabética da festividade
        return a.festividade.localeCompare(b.festividade);
      },
    );

    return {
      dadosFiltrados,
      chartFestividade,
      chartCategoria,
      chartFestMes,
      chartFestCatMes, // <-- Retornando a versão corrigida
      valoresPorMunFiltrado,
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

  const cores = [
    "#08325c",
    "#00A76F",
    "#FF5630",
    "#FFAB00",
    "#00B8D9",
    "#2171B5",
    "#8E33FF",
  ];

  const opcoesDinamicas = useMemo(() => {
    const contratos = dadosGlobais?.rankingContratacoes || [];
    const muns = new Set<string>();
    const eventosSet = new Set<string>();
    const atracoesSet = new Set<string>();

    contratos.forEach((c: any) => {
      if (c.municipio) muns.add(c.municipio);
      if (c.nomeEvento) eventosSet.add(c.nomeEvento);
      if (c.categoria === "atracoes" && c.fornecedorOuArtista)
        atracoesSet.add(c.fornecedorOuArtista);
    });

    return {
      municipios: Array.from(muns).sort(),
      eventos: Array.from(eventosSet).sort(),
      atracoes: Array.from(atracoesSet).sort(),
    };
  }, [dadosGlobais]);

  const dadosTabelaProcessados = useMemo(() => {
    let filtrado = [...analise.dadosFiltrados];
    if (buscaDoc) {
      const q = buscaDoc.toLowerCase();
      filtrado = filtrado.filter(
        (d) =>
          (d.municipio || "").toLowerCase().includes(q) ||
          (d.fornecedorOuArtista || "").toLowerCase().includes(q) ||
          (d.razaoSocial || "").toLowerCase().includes(q),
      );
    }
    return filtrado.sort((a, b) => {
      let vA = a[ordemDoc.col];
      let vB = b[ordemDoc.col];
      if (vA == null) vA = "";
      if (vB == null) vB = "";
      if (typeof vA === "string" && typeof vB === "string")
        return ordemDoc.dir === "asc"
          ? vA.localeCompare(vB)
          : vB.localeCompare(vA);
      return ordemDoc.dir === "asc" ? (vA > vB ? 1 : -1) : vA < vB ? 1 : -1;
    });
  }, [analise.dadosFiltrados, buscaDoc, ordemDoc]);

  const handleSort = (coluna: string) =>
    setOrdemDoc((prev) => ({
      col: coluna,
      dir: prev.col === coluna && prev.dir === "desc" ? "asc" : "desc",
    }));
  const paginatedDocs = useMemo(
    () =>
      dadosTabelaProcessados.slice(
        (pageDoc - 1) * ITEMS_PER_PAGE,
        pageDoc * ITEMS_PER_PAGE,
      ),
    [dadosTabelaProcessados, pageDoc],
  );
  const totalPagesDoc = Math.ceil(
    dadosTabelaProcessados.length / ITEMS_PER_PAGE,
  );

  const abrirModal = (
    item: any,
    tipo: "contrato" | "proposta" = "contrato",
  ) => {
    setItemSelecionado(item);
    setTipoDocModal(tipo);
    setModalOpen(true);
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
              <span className="text-[13px] font-bold text-[#637381] mr-2">
                Filtro Ativo:
              </span>
              <button
                onClick={() => setMunicipioSelecionado(null)}
                className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-[0px_4px_8px_rgba(8,50,92,0.2)]"
              >
                Município: {municipioSelecionado} <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-[350px]">
                <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                  <div>
                    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                      <PieChart size={16} /> Gasto por Festividade
                    </h4>
                    <p className="text-[10px] text-[#637381] font-medium">
                      Volume financeiro total investido por tipo de evento
                    </p>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analise.chartFestividade}
                      layout="vertical"
                      margin={{ left: 10, right: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#E5E8EB"
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 10, fill: "#637381" }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{
                          fontSize: 11,
                          fill: "#212B36",
                          fontWeight: 600,
                        }}
                      />

                      <RechartsTooltip
                        cursor={{ fill: "rgba(145, 158, 171, 0.08)" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const nome = payload[0].payload.name;
                            const valor = Number(payload[0].value);
                            const cor = getCorEvento(nome);

                            return (
                              <div className="bg-[#212B36] px-3.5 py-2 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex items-center gap-2 border-none outline-none pointer-events-none">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: cor }}
                                ></span>
                                <span className="text-[#919eab] text-[12px] font-semibold">
                                  {nome}:
                                </span>
                                <span className="text-white text-[12px] font-extrabold">
                                  {formatarMoeda(valor)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                        {analise.chartFestividade?.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getCorEvento(entry.name)}
                              className="cursor-pointer transition-all duration-300 hover:brightness-110"
                            />
                          ),
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-[350px]">
                <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                  <div>
                    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                      <PieChart size={16} /> Gasto por Categoria Econômica
                    </h4>
                    <p className="text-[10px] text-[#637381] font-medium mt-0.5">
                      Distribuição financeira entre atrações e infraestrutura
                    </p>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analise.chartCategoria}
                      layout="vertical"
                      margin={{ left: 10, right: 30 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#E5E8EB"
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 10, fill: "#637381" }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{
                          fontSize: 11,
                          fill: "#212B36",
                          fontWeight: 600,
                        }}
                      />

                      <RechartsTooltip
                        cursor={{ fill: "rgba(145, 158, 171, 0.08)" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const nome = payload[0].payload.name;
                            const valor = Number(payload[0].value);

                            let cor = "#08325c";
                            if (nome.toLowerCase().includes("atraç"))
                              cor = "#00A76F";
                            if (
                              nome.toLowerCase().includes("infra") ||
                              nome.toLowerCase().includes("organiza")
                            )
                              cor = "#FFAB00";
                            if (nome.toLowerCase().includes("outorga"))
                              cor = "#8E33FF";

                            return (
                              <div className="bg-[#212B36] px-3.5 py-2 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex items-center gap-2 border-none outline-none pointer-events-none">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: cor }}
                                ></span>
                                <span className="text-[#919eab] text-[12px] font-semibold">
                                  {nome}:
                                </span>
                                <span className="text-white text-[12px] font-extrabold">
                                  {formatarMoeda(valor)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                        {analise.chartCategoria?.map(
                          (entry: any, index: number) => {
                            const nome = entry.name;
                            let cor = "#08325c";
                            if (nome.toLowerCase().includes("atraç"))
                              cor = "#00A76F";
                            if (
                              nome.toLowerCase().includes("infra") ||
                              nome.toLowerCase().includes("organiza")
                            )
                              cor = "#FFAB00";
                            if (nome.toLowerCase().includes("outorga"))
                              cor = "#8E33FF";

                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={cor}
                                className="cursor-pointer transition-all duration-300 hover:brightness-110"
                              />
                            );
                          },
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-sm flex flex-col relative h-full min-h-[700px]">
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
                      onCityClick={(nome) => {
                        setMunicipioSelecionado((prev) =>
                          prev === nome ? null : nome,
                        );
                        setPageDoc(1);
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08325c]"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-dashed border-[#919eab]/30 shrink-0">
                  {ESCALA_UNIFICADA.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5"
                      title={`${contagemEscala[idx]} municípios`}
                    >
                      <span
                        className="w-3 h-3 rounded-[3px] shadow-sm border border-black/10"
                        style={{ backgroundColor: item.cor }}
                      ></span>
                      <span className="text-[10px] md:text-[11px] font-bold text-[#637381] uppercase tracking-wide">
                        {item.label}{" "}
                        <span className="text-[#08325c]">
                          ({contagemEscala[idx]})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-2">
            <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                    <TrendingUp size={16} /> Evolução por Festividade
                  </h4>
                  <p className="text-[10px] text-[#637381] font-medium mt-0.5">
                    Gastos mês a mês separados por festividade
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analise.chartFestMes}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E8EB"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#637381", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
                      tick={{ fontSize: 10, fill: "#637381" }}
                      width={70}
                      axisLine={false}
                      tickLine={false}
                    />

                    <RechartsTooltip
                      cursor={{
                        stroke: "rgba(145, 158, 171, 0.2)",
                        strokeWidth: 2,
                        strokeDasharray: "3 3",
                      }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const itensComValor = payload.filter(
                            (item) => item.value && Number(item.value) > 0,
                          );

                          if (itensComValor.length === 0) return null;

                          return (
                            <div className="bg-[#212B36] p-3.5 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex flex-col gap-2 border-none outline-none pointer-events-none">
                              <span className="text-white text-[13px] font-bold border-b border-white/10 pb-1.5 mb-0.5">
                                {label}
                              </span>
                              {itensComValor.map(
                                (entry: any, index: number) => (
                                  <div
                                    key={`item-${index}`}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                          backgroundColor: getCorEvento(
                                            entry.name,
                                          ),
                                        }}
                                      />
                                      <span className="text-[#919eab] text-[12px] font-semibold">
                                        {entry.name}:
                                      </span>
                                    </div>
                                    <span className="text-white text-[12px] font-extrabold">
                                      {formatarMoeda(entry.value)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        paddingTop: "10px",
                        fontWeight: 600,
                        color: "#637381",
                      }}
                      iconType="circle"
                    />

                    {opcoesDinamicas.eventos.map((evento) => {
                      const cor = getCorEvento(evento);
                      return (
                        <Line
                          key={evento}
                          type="monotone"
                          dataKey={evento}
                          stroke={cor}
                          strokeWidth={3}
                          dot={{ r: 3, fill: cor, strokeWidth: 0 }}
                          activeDot={{
                            r: 6,
                            fill: cor,
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                    <PieChart size={16} /> Categorias por Mês e Festividade
                  </h4>
                  <p className="text-[10px] text-[#637381] font-medium mt-0.5">
                    Composição dos gastos ao longo do tempo
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analise.chartFestCatMes}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E8EB"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#637381", fontWeight: 500 }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`}
                      tick={{ fontSize: 10, fill: "#637381" }}
                      width={70}
                      axisLine={false}
                      tickLine={false}
                    />

                    <RechartsTooltip
                      cursor={{ fill: "rgba(145, 158, 171, 0.08)" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const itensComValor = payload.filter(
                            (item) => item.value && Number(item.value) > 0,
                          );

                          if (itensComValor.length === 0) return null;

                          return (
                            <div className="bg-[#212B36] p-3.5 rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex flex-col gap-2 border-none outline-none pointer-events-none">
                              <span className="text-white text-[13px] font-bold border-b border-white/10 pb-1.5 mb-0.5">
                                {label}
                              </span>
                              {itensComValor.map(
                                (entry: any, index: number) => (
                                  <div
                                    key={`item-${index}`}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-[#919eab] text-[12px] font-semibold">
                                        {entry.name}:
                                      </span>
                                    </div>
                                    <span className="text-white text-[12px] font-extrabold">
                                      {formatarMoeda(entry.value)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        paddingTop: "10px",
                        fontWeight: 600,
                        color: "#637381",
                      }}
                      iconType="circle"
                    />

                    {Array.from(
                      new Set(
                        analise.dadosFiltrados.map(
                          (d: any) => d.categoriaFormatada,
                        ),
                      ),
                    ).map((cat: any, idx: number) => (
                      <Bar
                        key={cat}
                        dataKey={cat}
                        stackId="a"
                        fill={cores[(idx + 1) % cores.length]}
                        radius={idx === 0 ? [0, 0, 4, 4] : [0, 0, 0, 0]}
                        className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col mt-2">
            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col min-h-[500px]">
              <div className="bg-[#08325c] p-3 text-white flex justify-between items-center">
                <div>
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider">
                    Dados Analíticos das Contratações
                  </h4>
                  <p className="text-[10px] text-white/70 font-normal">
                    Detalhamento por fornecedor, categoria e links oficiais
                  </p>
                </div>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#919eab]"
                  />
                  <input
                    type="text"
                    placeholder="Buscar credor, artista..."
                    value={buscaDoc}
                    onChange={(e) => {
                      setBuscaDoc(e.target.value);
                      setPageDoc(1);
                    }}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 focus:bg-white/10 w-[160px] sm:w-[220px] transition-all"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-[#F4F6F8] sticky top-0 shadow-xs text-[11px] font-extrabold text-[#637381] uppercase cursor-pointer select-none z-10">
                    <tr>
                      <th
                        className="py-3 px-4 hover:bg-[#919eab]/10"
                        onClick={() => handleSort("municipio")}
                      >
                        Município{" "}
                        <ChevronDown size={12} className="inline opacity-50" />
                      </th>
                      <th
                        className="py-3 px-3 hover:bg-[#919eab]/10"
                        onClick={() => handleSort("categoriaFormatada")}
                      >
                        Categoria{" "}
                        <ChevronDown size={12} className="inline opacity-50" />
                      </th>
                      <th
                        className="py-3 px-3 hover:bg-[#919eab]/10"
                        onClick={() => handleSort("fornecedorOuArtista")}
                      >
                        Artista / Objeto{" "}
                        <ChevronDown size={12} className="inline opacity-50" />
                      </th>
                      <th
                        className="py-3 px-3 hover:bg-[#919eab]/10"
                        onClick={() => handleSort("razaoSocial")}
                      >
                        Credor / Razão Social{" "}
                        <ChevronDown size={12} className="inline opacity-50" />
                      </th>
                      <th
                        className="py-3 px-4 text-right hover:bg-[#919eab]/10"
                        onClick={() => handleSort("valor")}
                      >
                        Valor (R$){" "}
                        <ChevronDown size={12} className="inline opacity-50" />
                      </th>
                      <th className="py-3 px-4 text-center">Documentos</th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                    {paginatedDocs.length > 0 ? (
                      paginatedDocs.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#F4F6F8] transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-[#08325c]">
                            {item.municipio}
                          </td>

                          <td className="py-3 px-3 text-[#637381] font-bold">
                            <span className="bg-[#919eab]/10 px-2 py-1 rounded-md">
                              {item.categoriaFormatada}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {item.categoria === "atracoes" ? (
                                <Mic2
                                  size={14}
                                  className="text-[#637381] shrink-0"
                                />
                              ) : (
                                <Building2
                                  size={14}
                                  className="text-[#637381] shrink-0"
                                />
                              )}
                              <span className="font-bold line-clamp-2">
                                {item.fornecedorOuArtista ||
                                  item.objeto ||
                                  "Não informado"}
                              </span>
                            </div>
                          </td>

                          <td className="w-[150px] max-w-[150px] py-3 px-3 text-[#637381]">
                            <CustomTooltip
                              content={
                                item.razaoSocial ||
                                item.fornecedorOuArtista ||
                                "-"
                              }
                              position="top"
                            >
                              <div className="w-[150px] truncate cursor-default">
                                {item.razaoSocial ||
                                  item.fornecedorOuArtista ||
                                  "-"}
                              </div>
                            </CustomTooltip>
                          </td>

                          <td className="py-3 px-4 text-right font-extrabold text-[#212B36]">
                            {formatarMoeda(item.valor)}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {item.linkContrato ? (
                                <CustomTooltip
                                  content="Ver Contrato"
                                  position="top"
                                >
                                  <button
                                    onClick={() => abrirModal(item, "contrato")}
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#08325c]/10 text-[#08325c] rounded-md hover:bg-[#08325c]/20 transition-colors"
                                  >
                                    <FileText size={14} />
                                  </button>
                                </CustomTooltip>
                              ) : (
                                <CustomTooltip
                                  content="Contrato Indisponível"
                                  position="top"
                                >
                                  <span className="p-1.5 opacity-20 cursor-not-allowed">
                                    <FileText size={14} />
                                  </span>
                                </CustomTooltip>
                              )}

                              {/* Botão de Proposta */}
                              {item.linkProposta ? (
                                <CustomTooltip
                                  content="Ver Proposta"
                                  position="top"
                                >
                                  <button
                                    onClick={() => abrirModal(item, "proposta")}
                                    rel="noreferrer"
                                    className="p-1.5 bg-[#00A76F]/10 text-[#00A76F] rounded-md hover:bg-[#00A76F]/20 transition-colors"
                                  >
                                    <LinkIcon size={14} />
                                  </button>
                                </CustomTooltip>
                              ) : (
                                <CustomTooltip
                                  content="Proposta Indisponível"
                                  position="top"
                                >
                                  <span className="p-1.5 opacity-20 cursor-not-allowed">
                                    <LinkIcon size={14} />
                                  </span>
                                </CustomTooltip>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-[#919eab] italic font-semibold"
                        >
                          Nenhuma contratação encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#F4F6F8] border-t border-[#919eab]/20 p-2.5 shrink-0 flex items-center justify-between text-[11px] font-bold text-[#637381]">
                <span>
                  Exibindo{" "}
                  {dadosTabelaProcessados.length > 0
                    ? (pageDoc - 1) * ITEMS_PER_PAGE + 1
                    : 0}{" "}
                  -{" "}
                  {Math.min(
                    pageDoc * ITEMS_PER_PAGE,
                    dadosTabelaProcessados.length,
                  )}{" "}
                  de {dadosTabelaProcessados.length} registros
                </span>
                <div className="flex items-center gap-2">
                  <span className="mr-1">
                    Pág {pageDoc} de {totalPagesDoc || 1}
                  </span>
                  <button
                    onClick={() => setPageDoc((p) => Math.max(1, p - 1))}
                    disabled={pageDoc === 1}
                    className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 text-[#212B36] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setPageDoc((p) => Math.min(totalPagesDoc, p + 1))
                    }
                    disabled={pageDoc === totalPagesDoc || totalPagesDoc === 0}
                    className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 text-[#212B36] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ModalDetalhesContrato
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          item={itemSelecionado}
          tipoDocumento={tipoDocModal}
        />
      </div>
    </div>
  );
}
