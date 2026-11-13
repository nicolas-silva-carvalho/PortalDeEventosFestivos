"use client";

import { useState } from "react";
import { Search, ChevronUp, ChevronDown, Building2, FileText, CircleDollarSign, Mic2, Calendar, PieChart, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FiltrosLaterais } from "@/components/filtros/filtros-laterais";
import MapView from "./map-view";
import { useGeoData } from "@/features/festividades/hooks/use-geo-data";
import { useVisaoGeral } from "@/features/festividades/hooks/use-abas";
import { ESCALA_UNIFICADA, CORES_FESTIVIDADE, NOMES_FESTIVIDADE, MESES_EXTENSO } from "@/features/festividades/domain/constants";

function formatarMoeda(valor: number) { 
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); 
}

function formatarMoedaCompacta(valor: number) {
  if (valor >= 1e9) return `R$ ${(valor / 1e9).toFixed(2).replace('.', ',')} Bi`;
  if (valor >= 1e6) return `R$ ${(valor / 1e6).toFixed(2).replace('.', ',')} Mi`;
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function VisaoGeral() {
  const geoData = useGeoData();
  const { filtros, setFiltros, opcoes, selecao, alternar, analise } = useVisaoGeral();

  const [buscaMun, setBuscaMun] = useState("");
  const [ordemMun, setOrdemMun] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'valor', dir: 'desc' });
  const [buscaCat, setBuscaCat] = useState("");
  const [ordemCat, setOrdemCat] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'valor', dir: 'desc' });

  const munsProcessados = (() => {
    let filtrado = [...analise.tabelaMunicipios];
    if (buscaMun) filtrado = filtrado.filter(m => m.nome.toLowerCase().includes(buscaMun.toLowerCase()));
    return filtrado.sort((a, b) => {
      const vA = a[ordemMun.col as keyof typeof a];
      const vB = b[ordemMun.col as keyof typeof b];
      if (typeof vA === 'string' && typeof vB === 'string') return ordemMun.dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      if (vA < vB) return ordemMun.dir === 'asc' ? -1 : 1;
      if (vA > vB) return ordemMun.dir === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  const ITEMS_PER_PAGE_MUN = 5;
  const [pageMun, setPageMun] = useState(1);
  const totalPagesMun = Math.ceil(munsProcessados.length / ITEMS_PER_PAGE_MUN);
  const paginatedMuns = munsProcessados.slice((pageMun - 1) * ITEMS_PER_PAGE_MUN, pageMun * ITEMS_PER_PAGE_MUN);

  const catsProcessadas = (() => {
    let filtrado = [...analise.tabelaCategorias];
    if (buscaCat) filtrado = filtrado.filter(c => c.categoria.toLowerCase().includes(buscaCat.toLowerCase()));
    return filtrado.sort((a, b) => {
      const vA = a[ordemCat.col as keyof typeof a];
      const vB = b[ordemCat.col as keyof typeof b];
      if (typeof vA === 'string' && typeof vB === 'string') return ordemCat.dir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      if (vA < vB) return ordemCat.dir === 'asc' ? -1 : 1;
      if (vA > vB) return ordemCat.dir === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  const ITEMS_PER_PAGE_CAT = 5;
  const [pageCat, setPageCat] = useState(1);
  const totalPagesCat = Math.ceil(catsProcessadas.length / ITEMS_PER_PAGE_CAT);
  const paginatedCats = catsProcessadas.slice((pageCat - 1) * ITEMS_PER_PAGE_CAT, pageCat * ITEMS_PER_PAGE_CAT);

  const handleSort = (tabela: 'mun' | 'cat', coluna: string) => {
    if (tabela === 'mun') setOrdemMun(prev => ({ col: coluna, dir: prev.col === coluna && prev.dir === 'desc' ? 'asc' : 'desc' }));
    else setOrdemCat(prev => ({ col: coluna, dir: prev.col === coluna && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const RenderSortIcon = ({ tabela, coluna }: { tabela: 'mun' | 'cat', coluna: string }) => {
    const estado = tabela === 'mun' ? ordemMun : ordemCat;
    if (estado.col !== coluna) return null;
    return estado.dir === 'asc' ? <ChevronUp size={14} className="inline ml-1 text-[#08325c]" /> : <ChevronDown size={14} className="inline ml-1 text-[#08325c]" />;
  };

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
    }
  ];

  return (
    <div className="w-full bg-[#F4F6F8] py-8 border-[#919eab]/20 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-6 xl:px-12 flex flex-col xl:flex-row gap-8 items-start">
        <div className="w-full xl:w-[280px] shrink-0 xl:sticky xl:top-[100px] z-10">
          <FiltrosLaterais
            filtrosAtivos={filtros}
            onConsultar={setFiltros}
            opcoesAno={opcoes.anos}
            opcoesMes={MESES_EXTENSO}
            opcoesMunicipio={opcoes.municipios}
            opcoesTipoEvento={opcoes.tiposEvento}
            opcoesNomeEvento={opcoes.nomesEvento}
            opcoesAtracao={opcoes.atracoes}
          />
        </div>
        <div className="flex-1 w-full flex flex-col min-w-0 gap-6">
          {(selecao.municipio || selecao.categoria) && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-[13px] font-bold text-[#637381] mr-2">Filtros Ativos na Tela:</span>
              {selecao.municipio && (
                <button onClick={() => alternar('municipio', selecao.municipio!)} className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-sm">
                  Município: {selecao.municipio} <X size={14} />
                </button>
              )}
              {selecao.categoria && (
                <button onClick={() => alternar('categoria', selecao.categoria!)} className="flex items-center gap-1.5 bg-[#08325c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#0b427a] transition-colors shadow-sm">
                  Categoria: {selecao.categoria === "atracoes" ? "Atrações Musicais" : selecao.categoria} <X size={14} />
                </button>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-4 lg:gap-5 w-full items-start">
            {kpiCards.map((cat, idx) => {
              const isSelected = selecao.categoria === cat.id || (!selecao.categoria && cat.id === 'total');
              return (
                <div
                  key={idx}
                  onClick={() => alternar('categoria', cat.id === "total" ? selecao.categoria! : cat.id)}
                  className={`flex-auto min-w-[160px] h-fit bg-white rounded-xl py-3 px-4 flex flex-col text-left transition-all duration-300 border cursor-pointer hover:-translate-y-1 hover:shadow-md ${isSelected ? "border-[#08325c]/70 bg-[#08325c]/[0.03] shadow-sm" : "border-[#919eab]/24 shadow-sm"}`}
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
              {/* Despesas por Tipo de Gasto */}
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
                        onChange={e => { setBuscaCat(e.target.value); setPageCat(1); }}
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
                            const nomeExibicao = c.categoria === "atracoes" ? "Atrações Artísticas" : c.categoria === "organizacao" ? "Infraestrutura / Organização" : c.categoria === "outorga" ? "Outorga / Espaço Público" : c.categoria;
                            const isSelected = selecao.categoria === c.categoria;
                            return (
                              <tr
                                key={i}
                                onClick={() => alternar('categoria', c.categoria)}
                                className={`cursor-pointer transition-colors ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}
                              >
                                <td className={`py-2.5 px-4 font-bold ${isSelected ? "text-[#08325c]" : "text-[#212B36]"}`}>{nomeExibicao}</td>
                                <td className="py-2.5 px-3 text-center font-semibold text-[#637381]">{c.qtd}</td>
                                <td className="py-2.5 px-4 text-right font-bold text-[#08325c]">{formatarMoeda(c.valor)}</td>
                                <td className="py-2.5 px-4 text-right font-extrabold text-[#00A76F]">{c.pct.toFixed(1).replace('.', ',')}%</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={4} className="py-8 text-center text-[#919eab] italic">Nenhum registro encontrado para este tipo de gasto.</td></tr>
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
                    <span>Exibindo {catsProcessadas.length > 0 ? (pageCat - 1) * ITEMS_PER_PAGE_CAT + 1 : 0} - {Math.min(pageCat * ITEMS_PER_PAGE_CAT, catsProcessadas.length)} de {catsProcessadas.length} categorias</span>
                    <div className="flex items-center gap-2">
                      <span className="mr-1">Pág {pageCat} de {totalPagesCat || 1}</span>
                      <button onClick={() => setPageCat(p => Math.max(1, p - 1))} disabled={pageCat === 1} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"><ChevronLeft size={14} /></button>
                      <button onClick={() => setPageCat(p => Math.min(totalPagesCat, p + 1))} disabled={pageCat === totalPagesCat || totalPagesCat === 0} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desdobramento por Município */}
              <div className="bg-white rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] overflow-hidden flex flex-col h-fit min-h-[380px]">
                <div>
                  <div className="bg-[#08325c] p-4 md:p-3.5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-3">
                    <div className="w-full md:w-auto">
                      <div>
                        <h4 className="text-[13px] font-extrabold uppercase tracking-wider">Desdobramento por Município</h4>
                        <p className="text-[10px] text-white/70 font-normal">Volume financeiro e quantidade de contratos por cidade</p>
                      </div>
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 mt-3 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1.5 md:py-1 rounded-md shadow-sm border border-white/5">
                          <span className="w-2 h-2 rounded-full bg-[#00A76F] shrink-0"></span>
                          <span className="text-white/80 whitespace-nowrap">Com Festividade: <span className="text-white font-extrabold ml-1">{analise.qtdMunicipiosComFesta}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1.5 md:py-1 rounded-md shadow-sm border border-white/5">
                          <span className="w-2 h-2 rounded-full bg-[#919eab] shrink-0"></span>
                          <span className="text-white/80 whitespace-nowrap">Sem Festividade: <span className="text-white font-extrabold ml-1">{analise.qtdMunicipiosSemFesta}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-full md:w-[180px] shrink-0">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        placeholder="Buscar município..."
                        value={buscaMun}
                        onChange={e => { setBuscaMun(e.target.value); setPageMun(1); }}
                        className="pl-8 pr-3 py-2 md:py-1.5 rounded-lg bg-white/5 text-white text-[12px] placeholder-white/50 outline-none border border-white/10 focus:border-white/30 focus:bg-white/10 w-full transition-all"
                      />
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[380px]">
                      <thead className="bg-[#F4F6F8] sticky top-0 shadow-xs text-[11px] font-extrabold text-[#637381] uppercase cursor-pointer select-none">
                        <tr>
                          <th className="py-2.5 px-4 hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'nome')}>Município <RenderSortIcon tabela="mun" coluna="nome" /></th>
                          <th className="py-2.5 px-3 text-center hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'qtd')}>Qtd. Contratações <RenderSortIcon tabela="mun" coluna="qtd" /></th>
                          <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'valor')}>Valor Total (R$) <RenderSortIcon tabela="mun" coluna="valor" /></th>
                          <th className="py-2.5 px-4 text-right hover:bg-[#919eab]/10" onClick={() => handleSort('mun', 'pct')}>% do Estado <RenderSortIcon tabela="mun" coluna="pct" /></th>
                        </tr>
                      </thead>
                      <tbody className="text-[12px] text-[#212B36] font-medium divide-y divide-[#919eab]/10">
                        {paginatedMuns.length > 0 ? (
                          paginatedMuns.map((m, i) => {
                            const isSelected = selecao.municipio === m.nome;
                            return (
                              <tr key={i} onClick={() => alternar('municipio', m.nome)} className={`cursor-pointer transition-colors ${isSelected ? "bg-[#08325c]/10" : "hover:bg-[#F4F6F8]"}`}>
                                <td className={`py-2 px-4 font-bold ${isSelected ? "text-[#08325c]" : "text-[#212B36]"}`}>{m.nome}</td>
                                <td className="py-2 px-3 text-center font-semibold text-[#637381]">{m.qtd}</td>
                                <td className="py-2 px-4 text-right font-bold text-[#08325c]">{formatarMoeda(m.valor)}</td>
                                <td className="py-2 px-4 text-right font-extrabold text-[#00A76F]">{m.pct.toFixed(1).replace('.', ',')}%</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={4} className="py-8 text-center text-[#919eab] italic">Nenhum município encontrado.</td></tr>
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
                    <span>Exibindo {munsProcessados.length > 0 ? (pageMun - 1) * ITEMS_PER_PAGE_MUN + 1 : 0} - {Math.min(pageMun * ITEMS_PER_PAGE_MUN, munsProcessados.length)} de {munsProcessados.length} municípios</span>
                    <div className="flex items-center gap-2">
                      <span className="mr-1">Pág {pageMun} de {totalPagesMun || 1}</span>
                      <button onClick={() => setPageMun(p => Math.max(1, p - 1))} disabled={pageMun === 1} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"><ChevronLeft size={14} /></button>
                      <button onClick={() => setPageMun(p => Math.min(totalPagesMun, p + 1))} disabled={pageMun === totalPagesMun || totalPagesMun === 0} className="p-1 rounded-md bg-white border border-[#919eab]/30 shadow-xs hover:bg-[#F4F6F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#212B36] transition-colors"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#919eab]/24 shadow-[0px_4px_16px_rgba(145,158,171,0.06)] flex flex-col relative h-full min-h-[700px]">
              <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-[#08325c] mb-4 text-center">Mapa de Gastos</h4>
              <div className="w-full flex-1 rounded-xl overflow-hidden z-0 bg-[#F4F6F8]">
                {geoData ? (
                  <MapView
                    geoData={geoData}
                    valoresPorMunicipio={analise.valoresPorMunFiltrado}
                    escala={ESCALA_UNIFICADA}
                    municipioSelecionadoMapa={selecao.municipio}
                    onCityClick={(nome) => alternar('municipio', nome)}
                  />
                ) : <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#08325c]"></div></div>}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 pt-3 border-t border-dashed border-[#919eab]/30">
                {ESCALA_UNIFICADA.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5" title={`${analise.contagemEscala[idx]} municípios`}>
                    <span className="w-3 h-3 rounded-[3px] shadow-sm border border-black/5" style={{ backgroundColor: item.cor }}></span>
                    <span className="text-[10px] md:text-[11px] font-bold text-[#637381] uppercase tracking-wide">
                      {item.label} <span className="text-[#08325c]">({analise.contagemEscala[idx]})</span>
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
                  const isMesSelecionado = selecao.mes === item.mes;

                  return (
                    <div key={idx} className={`flex flex-col items-center justify-end h-full flex-1 relative hover:z-50 transition-all duration-300 ${isMesSelecionado ? 'opacity-100 z-40' : selecao.mes ? 'opacity-40 z-0' : 'z-10'}`}>
                      {temGasto && (
                        <div className="group/mes flex flex-col items-center justify-end w-full h-full cursor-pointer" onClick={() => alternar('mes', item.mes)}>
                          <div className={`hidden group-hover/mes:flex absolute -top-8 ${idx > 7 ? 'right-0' : 'left-1/2 -translate-x-1/2'} bg-[#212B36] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 items-center gap-1.5`}>
                            <span className="text-[#919eab]">{item.mes}:</span>
                            <span>{formatarMoeda(item.total)}</span>
                          </div>
                          <div className={`w-full max-w-[28px] bg-[#F4F6F8] rounded-t-md flex flex-col justify-end border-x border-t border-[#919eab]/10 relative transition-all ${isMesSelecionado ? 'ring-2 ring-offset-1 ring-[#08325c]' : ''}`} style={{ height: '100%' }}>
                            {temGasto && (
                              <div className="w-full flex flex-col-reverse transition-all duration-700 ease-out relative" style={{ height: `${heightPct}%` }}>
                                {(() => {
                                  const segmentos = Object.entries(item.porEvento).filter(([_, valor]) => valor > 0);
                                  return segmentos.map(([evento, valor], segIdx) => {
                                    const segmentHeight = `${(valor / item.total) * 100}%`;
                                    const cor = CORES_FESTIVIDADE[evento] || CORES_FESTIVIDADE.outros;
                                    const nome = NOMES_FESTIVIDADE[evento] || "Outros";
                                    const isEvtSelected = selecao.evento === evento;
                                    const isDimmed = selecao.evento && !isEvtSelected;
                                    const isTopo = segIdx === segmentos.length - 1;

                                    return (
                                      <div
                                        key={evento}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          alternar('evento', evento);
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
                      <span onClick={() => temGasto && alternar('mes', item.mes)} className={`text-[10px] mt-2 font-bold transition-colors ${temGasto ? "cursor-pointer text-[#212B36] hover:text-[#08325c]" : "text-[#919eab]"}`}>
                        {item.mes}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 mt-auto border-t border-dashed border-[#919eab]/30 shrink-0">
                {Object.entries(NOMES_FESTIVIDADE).map(([chave, nome]) => {
                  const isSelected = selecao.evento === chave;
                  const isDimmed = selecao.evento && !isSelected;
                  return (
                    <div
                      key={chave}
                      onClick={() => alternar('evento', chave)}
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
                  const isMesSelecionado = selecao.mes === item.mes;
                  const isDimmed = selecao.mes && !isMesSelecionado;

                  return (
                    <div
                      key={idx}
                      onClick={() => temGasto && alternar('mes', item.mes)}
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