import { useMemo } from "react";
import { FestividadeSwitcher } from "@/features/festividades/abas/festividade-switcher";
import { HomeHero } from "@/components/home/home-hero";
import Footer from "@/components/footer/footer";
import {
  useDadosGlobais,
  useUltimaConferencia,
} from "../features/festividades/api/festividades.queries";

export default function Home() {
  const { totalGeral, valoresPorMunicipio, rankingContratacoes, filtros } =
    useDadosGlobais();
  const ultimaConferencia = useUltimaConferencia();

  const kpisHome = useMemo(() => {
    const municipiosParticipantes = Object.keys(valoresPorMunicipio).length;
    const artistasContratados = new Set();
    const anosComContrato = new Set<number>();

    rankingContratacoes.forEach((c: any) => {
      if (c.ano) {
        anosComContrato.add(c.ano);
      } else if (c.anoRef) {
        anosComContrato.add(c.anoRef);
      }

      if (c.categoria === "atracoes" && c.fornecedorOuArtista) {
        artistasContratados.add(c.fornecedorOuArtista);
      }
    });

    let anosVigentes =
      filtros?.anos?.length > 0
        ? filtros.anos
        : Array.from(anosComContrato).sort();

    if (anosVigentes.length === 0) {
      anosVigentes = [new Date().getFullYear()];
    }

    return {
      exercicio: anosVigentes,
      municipios: municipiosParticipantes,
      artistas: artistasContratados.size,
      valorTotal: totalGeral,
    };
  }, [totalGeral, valoresPorMunicipio, rankingContratacoes, filtros]);

  const dataVerificacao = ultimaConferencia?.dataFormatada || "Não disponível";

  return (
    <div className="w-full min-h-screen bg-white font-sans -mt-[72px]">
      <HomeHero
        kpis={kpisHome}
        dataVerificacao={dataVerificacao}
        nomesMunicipios={Object.keys(valoresPorMunicipio)}
      />

      <FestividadeSwitcher />
      <Footer />
    </div>
  );
}
