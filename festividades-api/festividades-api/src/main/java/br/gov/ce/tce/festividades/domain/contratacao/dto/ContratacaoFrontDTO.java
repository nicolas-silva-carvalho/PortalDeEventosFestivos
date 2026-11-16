package br.gov.ce.tce.festividades.domain.contratacao.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ContratacaoFrontDTO(
        String id,
        String municipio,
        String categoria,
        String fornecedorOuArtista,
        Double valor,
        Integer ano,
        String carimbo,
        String dataEvento,
        String dataContratacao,
        String tipoEvento,
        String tematicaEvento,
        String nomeEvento,
        String nomeEventoOutros,
        String horarioShow,
        String duracao,
        String objeto,
        String modalidade,
        String numeroProcedimento,
        String formaContratacao,
        String razaoSocial,
        String cnpjContratada,
        String razaoSocialIntermediaria,
        String cnpjIntermediaria,
        String pagamentoAntecipado,
        String fonteRecursos,
        Double valorTransporte,
        Double valorCarnaval,
        Double recursosProprios,
        Double recursosEstaduais,
        Double recursosFederais,
        Double recursosOutros,
        String linkContrato,
        String linkProposta,
        String urlTce,
        String urlPncp,
        String urlTransparencia
) {
}
