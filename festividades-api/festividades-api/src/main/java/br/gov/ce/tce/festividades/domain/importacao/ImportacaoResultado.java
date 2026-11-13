package br.gov.ce.tce.festividades.domain.importacao;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ImportacaoResultado(
        boolean sucesso,
        String evento,
        int ano,
        @JsonProperty("municipios_eventos") int municipiosEventos,
        int registrosImportados,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> abasIgnoradas
) {
}
