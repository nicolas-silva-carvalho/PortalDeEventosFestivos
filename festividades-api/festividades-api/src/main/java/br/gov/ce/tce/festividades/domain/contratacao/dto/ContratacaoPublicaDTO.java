package br.gov.ce.tce.festividades.domain.contratacao.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContratacaoPublicaDTO {
    private String id;

    private Integer municipioId;
    private String municipioNome;

    private String categoria;
    private LocalDateTime carimbo;
    private String responsavelEnvio;
    private String emailContato;
    private String telefoneContato;
    private String tematicaEvento;
    private String nomeEventoOutros;
    private String fornecedorOuArtista;
    private String cnpjContratada;
    private String razaoSocial;
    private Double valor;
    private Double valorTransporte;
    private Double valorProporcional;
    private LocalDateTime dataEvento;
    private String horarioShow;
    private String duracao;
    private String objeto;
    private String modalidade;
    private String numeroProcedimento;
    private LocalDateTime dataContratacao;
    private String formaContratacao;
    private String razaoSocialIntermediaria;
    private String cnpjIntermediaria;
    private String pagamentoAntecipado;
    private String fonteRecursos;
    private Double recursosProprios;
    private Double recursosEstaduais;
    private Double recursosFederais;
    private Double recursosOutros;
    private String statusAuditor;

    private LinksDTO links;

    @Data
    public static class LinksDTO {
        private String contrato;
        private String proposta;
        private String tce;
        private String pncp;
        private String transparencia;
    }
}