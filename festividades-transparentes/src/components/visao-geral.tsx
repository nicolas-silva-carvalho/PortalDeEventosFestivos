"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, ChevronUp, ChevronDown, Building2, FileText, CircleDollarSign, Mic2, Calendar, PieChart, ChevronLeft, ChevronRight, MapPin, MapPinOff } from "lucide-react";
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

const MESES_MAP: Record<string, number> = { "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7, "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11 };
const NOME_MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MESES_EXTENSO = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const CAT_MAP: Record<string, string> = { "Atrações Musicais": "atracoes", "Organização": "organizacao", "Outorga": "outorga" };

const CORES_FESTIVIDADE: Record<string, string> = { pre_carnaval: "#00B8D9", carnaval: "#08325c", sao_joao: "#d35400", reveillon: "#b8860b", aniversario: "#8E33FF", festas_religiosas: "#00A76F", natal: "#FF5630", outros: "#637381" };
const NOMES_FESTIVIDADE: Record<string, string> = { pre_carnaval: "Pré-Carnaval", carnaval: "Carnaval", sao_joao: "São João", reveillon: "Réveillon", aniversario: "Aniversários", festas_religiosas: "Religiosas", natal: "Natal", outros: "Outros" };

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

function formatarMoeda(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }

function formatarMoedaCompacta(valor: number) {
  if (valor >= 1e9) {
    return `R$ ${(valor / 1e9).toFixed(2).replace('.', ',')} Bi`;
  }
  if (valor >= 1e6) {
    return `R$ ${(valor / 1e6).toFixed(2).replace('.', ',')} Mi`;
  }
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface VisaoGeralProps {
    dadosGlobais: any;
    configGlobal: EventoConfig;
}

export function VisaoGeral({ dadosGlobais, configGlobal }: VisaoGeralProps) {
    const [geoData, setGeoData] = useState<any>(null);
    const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, any>>({});

    const [municipioSelecionado, setMunicipioSelecionado] = useState<string | null>(null);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);

    const [eventoSelecionado, setEventoSelecionado] = useState<string | null>(null);
    const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

    const [buscaMun, setBuscaMun] = useState("");
    const [ordemMun, setOrdemMun] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'valor', dir: 'desc' });
    const [buscaCat, setBuscaCat] = useState("");
    const [ordemCat, setOrdemCat] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'valor', dir: 'desc' });

    useEffect(() => {
        fetch(CEARA_GEOJSON_URL).then((res) => res.json()).then(setGeoData).catch((err) => console.error("Erro mapa:", err));
    }, []);


    const analise = useMemo(() => {
        const contratosBrutos = dadosGlobais?.rankingContratacoes || [];

        let totalValorGeral = 0; let totalEmpenhosGeral = 0;
        const catsCalcGeral: Record<string, { valor: number, qtd: number }> = {
            atracoes: { valor: 0, qtd: 0 }, organizacao: { valor: 0, qtd: 0 }, outorga: { valor: 0, qtd: 0 }, outros: { valor: 0, qtd: 0 }
        };

        let totalValorFiltrado = 0; let totalEmpenhosFiltrado = 0;
        const catsCalc: Record<string, { categoria: string, valor: number, qtd: number, pct: number }> = {};
        const munsCalc: Record<string, { nome: string, valor: number, qtd: number, pct: number }> = {};

        const mesesCalc = Array(12).fill(0).map((_, i) => ({ mes: NOME_MESES[i], total: 0, porEvento: {} as Record<string, number> }));

        contratosBrutos.forEach((c: any) => {
            let dataGasto = c.dataEvento ? new Date(c.dataEvento) : c.dataContratacao ? new Date(c.dataContratacao) : null;
            let anoContrato = dataGasto ? dataGasto.getUTCFullYear() : (c.ano || null);

            if (filtrosAtivos.ano && filtrosAtivos.ano !== "Todos") {
                if (String(anoContrato) !== String(filtrosAtivos.ano)) return;
            }

            if (filtrosAtivos.municipios?.length > 0 && !filtrosAtivos.municipios.includes(c.municipio)) return;
            if (filtrosAtivos.atracoes?.length > 0 && !filtrosAtivos.atracoes.includes(c.fornecedorOuArtista)) return;
            if (filtrosAtivos.categoria && filtrosAtivos.categoria !== "Todos" && c.categoria !== CAT_MAP[filtrosAtivos.categoria]) return;
            // LÓGICA ATUALIZADA: Garante que o Pré-Carnaval seja lido corretamente
            const tipoRotulo = ROTULOS_TIPO_EVENTO[c.tipoEvento] || c.tipoEvento || c.tematicaEvento;
            if (filtrosAtivos.tiposEvento?.length > 0 && !filtrosAtivos.tiposEvento.includes(tipoRotulo)) return;

            const nomeReal = c.nomeEventoOutros || c.nomeEvento || c.tematicaEvento || tipoRotulo || "Evento Não Identificado";
            if (filtrosAtivos.nomesEventos?.length > 0 && !filtrosAtivos.nomesEventos.includes(nomeReal)) return;

            let mesIndex = dataGasto ? dataGasto.getUTCMonth() : -1;

            if (filtrosAtivos.meses?.length > 0 && filtrosAtivos.meses.length < 12 && mesIndex >= 0) {
                const nomeMesExtenso = MESES_EXTENSO[mesIndex];
                if (nomeMesExtenso && !filtrosAtivos.meses.includes(nomeMesExtenso)) return;
            }

            const cat = c.categoria || "outros";
            const eventoId = c.tipoEvento || c.evento || "outros";

            if (municipioSelecionado && c.municipio !== municipioSelecionado) return;
            if (categoriaSelecionada && c.categoria !== categoriaSelecionada) return;
            if (eventoSelecionado && eventoId !== eventoSelecionado) return;
            if (mesSelecionado && NOME_MESES[mesIndex] !== mesSelecionado) return;

            const valor = Number(c.valor) || 0;

            totalValorGeral += valor;
            totalEmpenhosGeral += 1;
            if (catsCalcGeral[cat]) { catsCalcGeral[cat].valor += valor; catsCalcGeral[cat].qtd += 1; }

            if (categoriaSelecionada && c.categoria !== categoriaSelecionada) return;

            totalValorFiltrado += valor;
            totalEmpenhosFiltrado += 1;

            if (mesIndex >= 0 && mesIndex <= 11) {
                mesesCalc[mesIndex].total += valor;
                mesesCalc[mesIndex].porEvento[eventoId] = (mesesCalc[mesIndex].porEvento[eventoId] || 0) + valor;
            }

            if (!catsCalc[cat]) catsCalc[cat] = { categoria: cat, valor: 0, qtd: 0, pct: 0 };
            catsCalc[cat].valor += valor; catsCalc[cat].qtd += 1;

            if (c.municipio) {
                const slug = slugify(c.municipio);
                if (!munsCalc[slug]) munsCalc[slug] = { nome: c.municipio, valor: 0, qtd: 0, pct: 0 };
                munsCalc[slug].valor += valor; munsCalc[slug].qtd += 1;
            }
        });

        Object.values(catsCalc).forEach(c => c.pct = totalValorFiltrado > 0 ? (c.valor / totalValorFiltrado) * 100 : 0);
        Object.values(munsCalc).forEach(m => m.pct = totalValorFiltrado > 0 ? (m.valor / totalValorFiltrado) * 100 : 0);

        const tabelaMunicipios = Object.values(munsCalc);
        const tabelaCategorias = Object.values(catsCalc);

        const valoresPorMunFiltrado: Record<string, number> = {};
        Object.keys(munsCalc).forEach(slug => { valoresPorMunFiltrado[slug] = munsCalc[slug].valor; });

        const qtdMunicipiosComFesta = Object.keys(munsCalc).length;
        const qtdMunicipiosSemFesta = Math.max(0, 184 - qtdMunicipiosComFesta);

        return {
            totalValorGeral, totalEmpenhosGeral, catsCalcGeral,
            totalValorFiltrado, totalEmpenhosFiltrado, valoresPorMunFiltrado,
            tabelaMunicipios, tabelaCategorias, mesesCalc,
            qtdMunicipiosComFesta, qtdMunicipiosSemFesta
        };
    }, [dadosGlobais, filtrosAtivos, municipioSelecionado, categoriaSelecionada, eventoSelecionado, mesSelecionado]);

    const contagemEscala = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        let comRegistro = 0;

        Object.values(analise.valoresPorMunFiltrado).forEach(val => {
            if (val >= 5000000) counts[0]++; else if (val >= 1000000) counts[1]++; else if (val >= 500000) counts[2]++; else if (val > 0) counts[3]++;
            if (val > 0) comRegistro++;
        });

        counts[4] = Math.max(0, 184 - comRegistro);
        return counts;
    }, [analise.valoresPorMunFiltrado]);

    const munsProcessados = useMemo(() => {
        let filtrado = [...analise.tabelaMunicipios];

        if (buscaMun) {
            filtrado = filtrado.filter(m => m.nome.toLowerCase().includes(buscaMun.toLowerCase()));
        }

        return filtrado.sort((a, b) => {
            const vA = a[ordemMun.col as keyof typeof a];
            const vB = b[ordemMun.col as keyof typeof b];

            if (typeof vA === 'string' && typeof vB === 'string') {
                return ordemMun.dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
            }

            if (vA < vB) return ordemMun.dir === 'asc' ? -1 : 1;
            if (vA > vB) return ordemMun.dir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [analise.tabelaMunicipios, buscaMun, ordemMun]);

    const ITEMS_PER_PAGE_MUN = 5;

    const [pageMun, setPageMun] = useState(1);

    const totalPagesMun = Math.ceil(munsProcessados.length / ITEMS_PER_PAGE_MUN);
    const paginatedMuns = useMemo(() => {
        return munsProcessados.slice((pageMun - 1) * ITEMS_PER_PAGE_MUN, pageMun * ITEMS_PER_PAGE_MUN);
    }, [munsProcessados, pageMun]);

    const catsProcessadas = useMemo(() => {
        let filtrado = [...analise.tabelaCategorias];

        if (buscaCat) {
            filtrado = filtrado.filter(c => c.categoria.toLowerCase().includes(buscaCat.toLowerCase()));
        }

        return filtrado.sort((a, b) => {
            const vA = a[ordemCat.col as keyof typeof a];
            const vB = b[ordemCat.col as keyof typeof b];

            if (typeof vA === 'string' && typeof vB === 'string') {
                return ordemCat.dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
            }

            if (vA < vB) return ordemCat.dir === 'asc' ? -1 : 1;
            if (vA > vB) return ordemCat.dir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [analise.tabelaCategorias, buscaCat, ordemCat]);

    const handleSort = (tabela: 'mun' | 'cat', coluna: string) => {
        if (tabela === 'mun') setOrdemMun(prev => ({ col: coluna, dir: prev.col === coluna && prev.dir === 'desc' ? 'asc' : 'desc' }));
        else setOrdemCat(prev => ({ col: coluna, dir: prev.col === coluna && prev.dir === 'desc' ? 'asc' : 'desc' }));
    };

    const RenderSortIcon = ({ tabela, coluna }: { tabela: 'mun' | 'cat', coluna: string }) => {
        const estado = tabela === 'mun' ? ordemMun : ordemCat;
        if (estado.col !== coluna) return null;
        return estado.dir === 'asc' ? <ChevronUp size={14} className="inline ml-1 text-[#08325c]" /> : <ChevronDown size={14} className="inline ml-1 text-[#08325c]" />;
    };

    const ITEMS_PER_PAGE_CAT = 5;

    const [pageCat, setPageCat] = useState(1);

    const totalPagesCat = Math.ceil(catsProcessadas.length / ITEMS_PER_PAGE_CAT);
    const paginatedCats = useMemo(() => {
        return catsProcessadas.slice((pageCat - 1) * ITEMS_PER_PAGE_CAT, pageCat * ITEMS_PER_PAGE_CAT);
    }, [catsProcessadas, pageCat]);

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

            const nomeReal = c.nomeEventoOutros || c.nomeEvento || c.tematicaEvento || tipoRotulo;
            if (nomeReal) nomesSet.add(nomeReal);

            if (c.categoria === "atracoes" && c.fornecedorOuArtista) {
                atracoesSet.add(c.fornecedorOuArtista);
            }
        });

        return {
            municipios: Array.from(muns).sort(),
            tiposEvento: Array.from(tiposSet).sort(),
            nomesEvento: Array.from(nomesSet).sort(),
            atracoes: Array.from(atracoesSet).sort()
        };
    }, [dadosGlobais]);

    const kpiCards = [
        {
            id: "total",
            titulo: "Gasto Total",
            isMonetario: true,
            valorPrimario: analise.totalValorGeral,
            destaqueSecundario: `${analise.totalEmpenhosGeral} Contratos`,
            textoTerciario: "100% do valor gasto",
            icone: CircleDollarSign,
            corBg: "bg-[#2171B5]/10",
            corTxt: "text-[#2171B5]"
        },
        {
            id: "atracoes",
            titulo: "Atrações Artísticas",
            isMonetario: true,
            valorPrimario: analise.catsCalcGeral.atracoes.valor,
            destaqueSecundario: `${analise.catsCalcGeral.atracoes.qtd} Contratos`,
            textoTerciario: `${((analise.catsCalcGeral.atracoes.valor / (analise.totalValorGeral || 1)) * 100).toFixed(1).replace('.', ',')}% do total`,
            icone: Mic2,
            corBg: "bg-[#00A76F]/10",
            corTxt: "text-[#00A76F]"
        },
        {
            id: "organizacao",
            titulo: "Infraestrutura / Organização",
            isMonetario: true,
            valorPrimario: analise.catsCalcGeral.organizacao.valor,
            destaqueSecundario: `${analise.catsCalcGeral.organizacao.qtd} Contratos`,
            textoTerciario: `${((analise.catsCalcGeral.organizacao.valor / (analise.totalValorGeral || 1)) * 100).toFixed(1).replace('.', ',')}% do total`,
            icone: Building2,
            corBg: "bg-[#FFAB00]/10",
            corTxt: "text-[#FFAB00]"
        },
        {
            id: "outorga",
            titulo: "Outorga / Cessão de Espaços",
            isMonetario: true,
            valorPrimario: analise.catsCalcGeral.outorga.valor,
            destaqueSecundario: `${analise.catsCalcGeral.outorga.qtd} Contratos`,
            textoTerciario: `${((analise.catsCalcGeral.outorga.valor / (analise.totalValorGeral || 1)) * 100).toFixed(1).replace('.', ',')}% do total`,
            icone: FileText,
            corBg: "bg-[#8E33FF]/10",
            corTxt: "text-[#8E33FF]"
        },
        // {
        //     id: "com_festa",
        //     titulo: "Com Festividade",
        //     isMonetario: false,
        //     valorPrimario: analise.qtdMunicipiosComFesta,
        //     destaqueSecundario: "Base: 184 Mun.",
        //     textoTerciario: `${((analise.qtdMunicipiosComFesta / 184) * 100).toFixed(1).replace('.', ',')}% do Estado`,
        //     icone: MapPin,
        //     corBg: "bg-[#08325c]/10",
        //     corTxt: "text-[#08325c]"
        // },
        // {
        //     id: "sem_festa",
        //     titulo: "Sem Festividade",
        //     isMonetario: false,
        //     valorPrimario: analise.qtdMunicipiosSemFesta,
        //     destaqueSecundario: "Base: 184 Mun.",
        //     textoTerciario: `${((analise.qtdMunicipiosSemFesta / 184) * 100).toFixed(1).replace('.', ',')}% do Estado`,
        //     icone: MapPinOff,
        //     corBg: "bg-[#FF5630]/10",
        //     corTxt: "text-[#FF5630]"
        // }
    ];

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
                    {(municipioSelecionado || categoriaSelecionada) && (
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-[13px] font-bold text-[#637381] mr-2">Filtros Ativos na Tela:</span>
                            {municipioSelecionado && (
                                <button onClick={() => setMunicipioSelecionado(null)} className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-sm">
                                    Município: {municipioSelecionado} <X size={14} />
                                </button>
                            )}
                            {categoriaSelecionada && (
                                <button onClick={() => setCategoriaSelecionada(null)} className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-sm">
                                    Categoria: {categoriaSelecionada === "atracoes" ? "Atrações Musicais" : categoriaSelecionada} <X size={14} />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-4 lg:gap-5 w-full items-start">
                        {kpiCards.map((cat, idx) => {
                            const isClickable = true;
                            const isSelected = categoriaSelecionada === cat.id || (!categoriaSelecionada && cat.id === 'total');

                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setCategoriaSelecionada(cat.id === "total" ? null : cat.id);
                                    }}
                                    className={`flex-auto min-w-[160px] h-fit bg-white rounded-xl py-3 px-4 flex flex-col text-left transition-all duration-300 border cursor-pointer hover:-translate-y-1 hover:shadow-md ${isSelected ? "border-[#08325c]/70 bg-[#08325c]/[0.03] shadow-sm" : "border-[#919eab]/24 shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 ${cat.corBg}`}>
                                            <cat.icone className={`w-5 h-5 ${cat.corTxt}`} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-semibold text-[#637381] leading-tight whitespace-nowrap mb-0.5">
                                                {cat.titulo}
                                            </span>
                                            <span className="text-[18px] font-extrabold text-[#212B36] leading-none whitespace-nowrap">
                                                {cat.isMonetario ? formatarMoeda(cat.valorPrimario) : cat.valorPrimario}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col border-t border-dashed border-[#919eab]/30 pt-2 mt-2">
                                        <span className="text-[11px] font-medium text-[#919eab] leading-tight mb-1 whitespace-nowrap">
                                            {cat.destaqueSecundario}
                                        </span>
                                        <span className="text-[14px] font-bold text-[#212B36] leading-none whitespace-nowrap">
                                            {cat.textoTerciario}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-6 flex flex-col gap-6 h-fit">
                            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col h-fit min-h-[320px]">
                                <div>
                                    <div className="bg-[#08325c] p-3 text-white flex justify-between items-center">
                                        <div>
                                            <h4 className="text-[13px] font-extrabold uppercase tracking-wider">Despesas por Tipo de Gasto</h4>
                                            <p className="text-[10px] text-white/70 font-normal">Volume e proporção financeira por categoria</p>
                                        </div>
                                        <div className="relative">
                                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#919eab]" />
                                            <input
                                                type="text"
                                                placeholder="Buscar gasto..."
                                                value={buscaCat}
                                                onChange={e => {
                                                    setBuscaCat(e.target.value);
                                                    setPageCat(1);
                                                }}
                                                className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 focus:bg-white/10 w-full sm:w-[180px] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-left min-w-[380px]">
                                            <thead className="bg-[#F4F6F8] sticky top-0 shadow-xs text-[11px] font-extrabold text-[#637381] uppercase cursor-pointer select-none">
                                                <tr>
                                                    <th className="py-2.5 px-4 hover:bg-[#919eab]/10" onClick={() => handleSort('cat', 'categoria')}>
                                                        Tipo de Gasto <RenderSortIcon tabela="cat" coluna="categoria" />
                                                    </th>
                                                    <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10" onClick={() => handleSort('cat', 'qtd')}>
                                                        Qtd. Contratações <RenderSortIcon tabela="cat" coluna="qtd" />
                                                    </th>
                                                    <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => handleSort('cat', 'valor')}>
                                                        Valor Total (R$) <RenderSortIcon tabela="cat" coluna="valor" />
                                                    </th>
                                                    <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => handleSort('cat', 'pct')}>
                                                        % do Total <RenderSortIcon tabela="cat" coluna="pct" />
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                                                {paginatedCats.length > 0 ? (
                                                    paginatedCats.map((c, i) => {
                                                        const nomeExibicao =
                                                            c.categoria === "atracoes" ? "Atrações Artísticas" :
                                                                c.categoria === "organizacao" ? "Infraestrutura / Organização" :
                                                                    c.categoria === "outorga" ? "Outorga / Espaço Público" :
                                                                        c.categoria;

                                                        const isSelected = categoriaSelecionada === c.categoria;

                                                        return (
                                                            <tr
                                                                key={i}
                                                                onClick={() => setCategoriaSelecionada(prev => prev === c.categoria ? null : c.categoria)}
                                                                className={`cursor-pointer transition-colors ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                                                            >
                                                                <td className={`py-2.5 px-4 font-bold ${isSelected ? "text-[#08325c]" : "text-[#212B36]"}`}>
                                                                    {nomeExibicao}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-center font-semibold text-[#637381]">
                                                                    {c.qtd}
                                                                </td>
                                                                <td className="py-2.5 px-4 text-right font-bold text-[#08325c]">
                                                                    {formatarMoeda(c.valor)}
                                                                </td>
                                                                <td className="py-2.5 px-4 text-right font-extrabold text-[#00A76F]">
                                                                    {c.pct.toFixed(1).replace('.', ',')}%
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="py-8 text-center text-[#919eab] italic">
                                                            Nenhum registro encontrado para este tipo de gasto.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="bg-[#F4F6F8] border-t border-[#919eab]/20 flex flex-col divide-y divide-[#919eab]/15 mt-auto">
                                    <div className="px-4 py-2.5 bg-white flex items-center justify-between text-[11px] font-extrabold text-[#08325c]">
                                        <span className="uppercase tracking-wider">Total Geral</span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[#212B36]">{analise.totalEmpenhosFiltrado} Contratos</span>
                                            <span className="text-[#08325c] text-[12px]">{formatarMoeda(analise.totalValorFiltrado)}</span>
                                            <span className="text-[#00A76F]">100,0%</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 flex items-center justify-between text-[11px] font-bold text-[#637381]">
                                        <span>
                                            Exibindo {catsProcessadas.length > 0 ? (pageCat - 1) * ITEMS_PER_PAGE_CAT + 1 : 0} - {Math.min(pageCat * ITEMS_PER_PAGE_CAT, catsProcessadas.length)} de {catsProcessadas.length} categorias
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="mr-1">Pág {pageCat} de {totalPagesCat || 1}</span>
                                            <button
                                                onClick={() => setPageCat(p => Math.max(1, p - 1))}
                                                disabled={pageCat === 1}
                                                className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button
                                                onClick={() => setPageCat(p => Math.min(totalPagesCat, p + 1))}
                                                disabled={pageCat === totalPagesCat || totalPagesCat === 0}
                                                className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col h-fit min-h-[380px]">
                                <div>
                                    <div className="bg-[#08325c] p-4 md:p-3.5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-3">
                                        <div className="w-full md:w-auto">
                                            <div>
                                                <h4 className="text-[13px] font-extrabold uppercase tracking-wider">
                                                    Desdobramento por Município
                                                </h4>
                                                <p className="text-[10px] text-white/70 font-normal">
                                                    Volume financeiro e quantidade de contratos por cidade
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 mt-3 text-[10px] font-bold">
                                                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1.5 md:py-1 rounded-md shadow-sm border border-white/5">
                                                    <span className="w-2 h-2 rounded-full bg-[#00A76F] shrink-0"></span>
                                                    <span className="text-white/80 whitespace-nowrap">
                                                        Com Festividade:
                                                        <span className="text-white font-extrabold ml-1">
                                                            {munsProcessados.filter((m: any) => m.valor > 0).length}
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1.5 md:py-1 rounded-md shadow-sm border border-white/5">
                                                    <span className="w-2 h-2 rounded-full bg-[#919eab] shrink-0"></span>
                                                    <span className="text-white/80 whitespace-nowrap">
                                                        Sem Festividade:
                                                        <span className="text-white font-extrabold ml-1">
                                                            {184 - munsProcessados.filter((m: any) => m.valor > 0).length}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative w-full md:w-[180px] shrink-0">
                                            <Search
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Buscar município..."
                                                value={buscaMun}
                                                onChange={e => {
                                                    setBuscaMun(e.target.value);
                                                    setPageMun(1);
                                                }}
                                                className="pl-8 pr-3 py-2 md:py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 focus:bg-white/10 w-full transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-left min-w-[380px]">
                                            <thead className="bg-[#F4F6F8] sticky top-0 shadow-xs text-[11px] font-extrabold text-[#637381] uppercase cursor-pointer select-none">
                                                <tr>
                                                    <th className="py-2.5 px-4 hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'nome')}>
                                                        Município <RenderSortIcon tabela="mun" coluna="nome" />
                                                    </th>
                                                    <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'qtd')}>
                                                        Qtd. Contratações <RenderSortIcon tabela="mun" coluna="qtd" />
                                                    </th>
                                                    <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'valor')}>
                                                        Valor Total (R$) <RenderSortIcon tabela="mun" coluna="valor" />
                                                    </th>
                                                    <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'pct')}>
                                                        % do Estado <RenderSortIcon tabela="mun" coluna="pct" />
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                                                {paginatedMuns.length > 0 ? (
                                                    paginatedMuns.map((m, i) => {
                                                        const isSelected = municipioSelecionado === m.nome;
                                                        return (
                                                            <tr
                                                                key={i}
                                                                onClick={() => setMunicipioSelecionado(prev => prev === m.nome ? null : m.nome)}
                                                                className={`cursor-pointer transition-colors ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                                                            >
                                                                <td className={`py-2 px-4 font-bold ${isSelected ? "text-[#08325c]" : "text-[#212B36]"}`}>
                                                                    {m.nome}
                                                                </td>
                                                                <td className="py-2 px-3 text-center font-semibold text-[#637381]">
                                                                    {m.qtd}
                                                                </td>
                                                                <td className="py-2 px-4 text-right font-bold text-[#08325c]">
                                                                    {formatarMoeda(m.valor)}
                                                                </td>
                                                                <td className="py-2 px-4 text-right font-extrabold text-[#00A76F]">
                                                                    {m.pct.toFixed(1).replace('.', ',')}%
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="py-8 text-center text-[#919eab] italic">
                                                            Nenhum município encontrado.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="bg-[#F4F6F8] border-t border-[#919eab]/20 flex flex-col divide-y divide-[#919eab]/15 mt-auto">
                                    <div className="px-4 py-2.5 bg-white flex items-center justify-between text-[11px] font-extrabold text-[#08325c]">
                                        <span className="uppercase tracking-wider">Total Geral Consolidado</span>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[#212B36]">{analise.totalEmpenhosFiltrado} Contratos</span>
                                            <span className="text-[#08325c] text-[12px]">{formatarMoeda(analise.totalValorFiltrado)}</span>
                                            <span className="text-[#00A76F]">100,0%</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 flex items-center justify-between text-[11px] font-bold text-[#637381]">
                                        <span>
                                            Exibindo {munsProcessados.length > 0 ? (pageMun - 1) * ITEMS_PER_PAGE_MUN + 1 : 0} - {Math.min(pageMun * ITEMS_PER_PAGE_MUN, munsProcessados.length)} de {munsProcessados.length} municípios
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <span className="mr-1">Pág {pageMun} de {totalPagesMun || 1}</span>
                                            <button
                                                onClick={() => setPageMun(p => Math.max(1, p - 1))}
                                                disabled={pageMun === 1}
                                                className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button
                                                onClick={() => setPageMun(p => Math.min(totalPagesMun, p + 1))}
                                                disabled={pageMun === totalPagesMun || totalPagesMun === 0}
                                                className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col relative h-full min-h-[700px]">
                            <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] mb-4 text-center">
                                Mapa de Gastos
                            </h4>
                            <div className="w-full flex-1 rounded-xl overflow-hidden z-0 bg-[#F4F6F8]">
                                {geoData ? (
                                    <MapView
                                        geoData={geoData}
                                        valoresPorMunicipio={analise.valoresPorMunFiltrado}
                                        escala={ESCALA_UNIFICADA}
                                        municipioSelecionadoMapa={municipioSelecionado}
                                        onCityClick={(nome) => setMunicipioSelecionado(prev => prev === nome ? null : nome)}
                                    />
                                ) : <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08325c]"></div></div>}
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 pt-3 border-t border-dashed border-[#919eab]/30">
                                {ESCALA_UNIFICADA.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5" title={`${contagemEscala[idx]} municípios`}>
                                        <span className="w-3 h-3 rounded-[3px] shadow-sm border border-black/5" style={{ backgroundColor: item.cor }}></span>
                                        <span className="text-[10px] md:text-[11px] font-bold text-[#637381] uppercase tracking-wide">
                                            {item.label} <span className="text-[#08325c]">({contagemEscala[idx]})</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-full">
                            <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                                <div>
                                    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                                        <PieChart size={16} /> Festividade Mês a Mês
                                    </h4>
                                    <p className="text-[10px] text-[#637381] font-medium">Volume e proporção por evento ao longo do ano</p>
                                </div>
                            </div>
                            <div className="flex flex-row items-end justify-between flex-1 w-full gap-1.5 pt-2 relative z-10 min-h-[240px]">
                                {analise.mesesCalc.map((item, idx) => {
                                    const maxTotal = Math.max(...analise.mesesCalc.map(m => m.total)) || 1;
                                    const temGasto = item.total > 0;
                                    const heightPct = temGasto ? (item.total / maxTotal) * 100 : 0;
                                    const isMesSelecionado = mesSelecionado === item.mes;

                                    return (
                                        <div key={idx} className={`flex flex-col items-center justify-end h-full flex-1 relative hover:z-50 transition-all duration-300 ${isMesSelecionado ? 'opacity-100 z-40' : mesSelecionado ? 'opacity-40 z-0' : 'z-10'}`}>
                                            {temGasto && (
                                                <div className="group/mes flex flex-col items-center justify-end w-full h-full cursor-pointer" onClick={() => setMesSelecionado(prev => prev === item.mes ? null : item.mes)}>
                                                    <div className={`hidden group-hover/mes:flex absolute -top-8 ${idx > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2'} bg-[#212B36] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 items-center gap-1.5`}>
                                                        <span className="text-[#919eab]">{item.mes}:</span>
                                                        <span>{formatarMoeda(item.total)}</span>
                                                    </div>
                                                    <div className={`w-full max-w-[28px] bg-[#F4F6F8] rounded-t-md flex flex-col justify-end border-x border-t border-[#919eab]/10 relative transition-all ${isMesSelecionado ? 'ring-2 ring-offset-1 ring-[#08325c]' : ''}`} style={{ height: '100%' }}>
                                                        {temGasto && (
                                                            <div
                                                                className="w-full flex flex-col-reverse transition-all duration-700 ease-out relative"
                                                                style={{ height: `${heightPct}%` }}
                                                            >
                                                                {(() => {
                                                                    const segmentos = Object.entries(item.porEvento).filter(([_, valor]) => valor > 0);

                                                                    return segmentos.map(([evento, valor], segIdx) => {
                                                                        const segmentHeight = `${(valor / item.total) * 100}%`;
                                                                        const cor = CORES_FESTIVIDADE[evento] || CORES_FESTIVIDADE.outros;
                                                                        const nome = NOMES_FESTIVIDADE[evento] || "Outros";
                                                                        const isEvtSelected = eventoSelecionado === evento;
                                                                        const isDimmed = eventoSelecionado && !isEvtSelected;
                                                                        const isTopo = segIdx === segmentos.length - 1;

                                                                        return (
                                                                            <div
                                                                                key={evento}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEventoSelecionado(prev => prev === evento ? null : evento);
                                                                                }}
                                                                                className={`w-full group/segment transition-all duration-300 cursor-pointer border-b border-white/20 last:border-0 relative ${isDimmed ? 'opacity-30 grayscale' : 'hover:brightness-110'} ${isEvtSelected ? 'ring-2 ring-inset ring-white z-20' : 'z-10'} ${isTopo ? 'rounded-t-[5px]' : ''}`}
                                                                                style={{ height: segmentHeight, backgroundColor: cor }}
                                                                            >
                                                                                <div className={`hidden group-hover/segment:flex absolute top-1/2 -translate-y-1/2 ${idx > 7 ? 'right-full mr-2.5' : 'left-full ml-2.5'} bg-[#212B36] text-white text-[11px] font-bold px-3 py-2 rounded-lg shadow-[0px_8px_16px_rgba(0,0,0,0.24)] pointer-events-none whitespace-nowrap z-[100] items-center gap-2`}>
                                                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cor }}></span>
                                                                                    <span className="text-[#919eab]">{nome}:</span>
                                                                                    <span>{formatarMoeda(valor)}</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    });
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <span
                                                onClick={() => temGasto && setMesSelecionado(prev => prev === item.mes ? null : item.mes)}
                                                className={`text-[10px] mt-2 font-bold transition-colors ${temGasto ? "cursor-pointer text-[#212B36] hover:text-[#08325c]" : "text-[#919eab]"}`}
                                            >
                                                {item.mes}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 mt-auto border-t border-dashed border-[#919eab]/30 shrink-0">
                                {Object.entries(NOMES_FESTIVIDADE).map(([chave, nome]) => {
                                    const isSelected = eventoSelecionado === chave;
                                    const isDimmed = eventoSelecionado && !isSelected;

                                    return (
                                        <div
                                            key={chave}
                                            onClick={() => setEventoSelecionado(prev => prev === chave ? null : chave)}
                                            className={`flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-100 ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}`}
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: CORES_FESTIVIDADE[chave] }}></span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-[#08325c]' : 'text-[#637381]'}`}>{nome}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col h-full">
                            <div className="flex items-center justify-between border-b border-dashed border-[#919eab]/30 pb-3 mb-4 shrink-0">
                                <div>
                                    <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] flex items-center gap-2">
                                        <Calendar size={16} /> Despesa Mês a Mês Consolidado
                                    </h4>
                                    <p className="text-[10px] text-[#637381] font-medium">Evolução temporal das despesas nos 12 meses do ano</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between flex-1 w-full gap-1.5 pb-1">
                                {analise.mesesCalc.map((item, idx) => {
                                    const max = Math.max(...analise.mesesCalc.map(m => m.total)) || 1;
                                    const percentualBarra = item.total > 0 ? (item.total / max) * 100 : 0;
                                    const temGasto = item.total > 0;

                                    const isMesSelecionado = mesSelecionado === item.mes;
                                    const isDimmed = mesSelecionado && !isMesSelecionado;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => temGasto && setMesSelecionado(prev => prev === item.mes ? null : item.mes)}
                                            className={`flex items-center gap-3 w-full group/row relative transition-all duration-300 ${temGasto ? 'cursor-pointer hover:z-50' : 'cursor-default'} ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100 z-10'}`}
                                        >
                                            <span className={`w-8 shrink-0 text-[11px] font-bold transition-colors ${temGasto ? (isMesSelecionado ? "text-[#08325c]" : "text-[#212B36] group-hover/row:text-[#08325c]") : "text-[#919eab]"}`}>
                                                {item.mes}
                                            </span>
                                            <div className={`flex-1 bg-[#F4F6F8] h-[26px] rounded-md relative border border-[#919eab]/10 transition-all ${isMesSelecionado ? 'ring-2 ring-offset-1 ring-[#2171B5]' : ''}`}>
                                                {temGasto ? (
                                                    <div
                                                        className="bg-[#2171B5] group-hover/row:bg-[#08325c] h-full rounded-md transition-all duration-700 ease-out relative group/bar flex items-center justify-end"
                                                        style={{ width: `${percentualBarra}%` }}
                                                    >
                                                        <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute bottom-full right-0 mb-2 bg-[#212B36] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-[0px_8px_16px_rgba(0,0,0,0.24)] pointer-events-none whitespace-nowrap z-[100] flex items-center gap-2">
                                                            <span className="text-[#919eab]">{item.mes}:</span>
                                                            <span>{formatarMoeda(item.total)}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-[#919eab]/5 rounded-md"></div>
                                                )}
                                            </div>
                                            <span className={`w-[75px] text-right shrink-0 text-[11px] transition-colors ${temGasto ? (isMesSelecionado ? "text-[#08325c] font-extrabold" : "text-[#212B36] font-semibold group-hover/row:text-[#08325c]") : "text-[#919eab]/70 font-semibold"}`}>
                                                {formatarMoedaCompacta(item.total)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}