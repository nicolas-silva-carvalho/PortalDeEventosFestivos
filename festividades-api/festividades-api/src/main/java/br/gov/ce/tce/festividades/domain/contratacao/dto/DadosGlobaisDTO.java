package br.gov.ce.tce.festividades.domain.contratacao.dto;

import java.util.List;
import java.util.Map;

public record DadosGlobaisDTO(
        Integer ano,
        Double totalGeral,
        Map<String, Double> totaisPorCategoria,
        Map<String, Double> valoresPorMunicipio,
        List<RankingArtista> rankingArtistas,
        List<ContratacaoFrontDTO> rankingContratacoes,
        List<MunicipioAgrupado> municipios,
        Filtros filtros
) {
    public record RankingArtista(String nome, Double valor, long ocorrencias) {}

    public record MunicipioAgrupado(
            String municipio,
            Double totalGasto,
            List<ContratacaoFrontDTO> contratacoes
    ) {}

    public record Filtros(
            List<Integer> anos,
            List<String> municipios,
            List<String> eventos,
            List<String> atracoes
    ) {}
}