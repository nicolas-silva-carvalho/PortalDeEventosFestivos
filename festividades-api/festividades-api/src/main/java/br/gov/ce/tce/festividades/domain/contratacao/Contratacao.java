package br.gov.ce.tce.festividades.domain.contratacao;

import br.gov.ce.tce.festividades.domain.municipio.Municipio;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "\"Contratacao\"", schema = "festividades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Contratacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"municipioId\"", nullable = false)
    private Municipio municipio;

    @Column(nullable = false)
    private String categoria;

    private LocalDateTime carimbo;

    @Column(name = "\"responsavelEnvio\"")
    private String responsavelEnvio;

    @Column(name = "\"emailContato\"")
    private String emailContato;

    @Column(name = "\"telefoneContato\"")
    private String telefoneContato;

    @Column(name = "\"tematicaEvento\"")
    private String tematicaEvento;

    @Column(name = "\"nomeEventoOutros\"")
    private String nomeEventoOutros;

    @Column(name = "\"fornecedorOuArtista\"", nullable = false)
    private String fornecedorOuArtista;

    @Column(name = "\"cnpjContratada\"")
    private String cnpjContratada;

    @Column(name = "\"razaoSocial\"")
    private String razaoSocial;

    @Column(nullable = false)
    private Double valor;

    @Column(name = "\"valorTransporte\"")
    private Double valorTransporte;

    @Column(name = "\"valorProporcional\"")
    private Double valorProporcional;

    @Column(name = "\"dataEvento\"")
    private LocalDateTime dataEvento;

    @Column(name = "\"horarioShow\"")
    private String horarioShow;

    private String duracao;
    private String objeto;
    private String modalidade;

    @Column(name = "\"numeroProcedimento\"")
    private String numeroProcedimento;

    @Column(name = "\"dataContratacao\"")
    private LocalDateTime dataContratacao;

    @Column(name = "\"formaContratacao\"")
    private String formaContratacao;

    @Column(name = "\"razaoSocialIntermediaria\"")
    private String razaoSocialIntermediaria;

    @Column(name = "\"cnpjIntermediaria\"")
    private String cnpjIntermediaria;

    @Column(name = "\"pagamentoAntecipado\"")
    private String pagamentoAntecipado;

    @Column(name = "\"fonteRecursos\"")
    private String fonteRecursos;

    @Column(name = "\"recursosProprios\"")
    private Double recursosProprios;

    @Column(name = "\"recursosEstaduais\"")
    private Double recursosEstaduais;

    @Column(name = "\"recursosFederais\"")
    private Double recursosFederais;

    @Column(name = "\"recursosOutros\"")
    private Double recursosOutros;

    private String beneficiario;

    @Column(name = "\"cnpjBeneficiario\"")
    private String cnpjBeneficiario;

    @Column(name = "\"linkContrato\"")
    private String linkContrato;

    @Column(name = "\"linkProposta\"")
    private String linkProposta;

    @Column(name = "\"urlTce\"")
    private String urlTce;

    @Column(name = "\"urlPncp\"")
    private String urlPncp;

    @Column(name = "\"urlTransparencia\"")
    private String urlTransparencia;

    @Column(name = "\"statusAuditor\"")
    private String statusAuditor = "Novo";

    @Column(name = "\"criadoEm\"", updatable = false, insertable = false)
    private LocalDateTime criadoEm;
}