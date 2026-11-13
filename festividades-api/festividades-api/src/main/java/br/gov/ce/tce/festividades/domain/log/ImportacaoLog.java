package br.gov.ce.tce.festividades.domain.log;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "\"ImportacaoLog\"", schema = "festividades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class ImportacaoLog {

    @Id
    @Builder.Default
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String evento;

    @Column(nullable = false)
    private Integer ano;

    private String origem;
    private String autor;

    @Column(name = "\"quantidadeRegistros\"", nullable = false)
    private Integer quantidadeRegistros;

    @Column(name = "\"nomeArquivo\"")
    private String nomeArquivo;

    private String ip;

    @Column(name = "\"userAgent\"")
    private String userAgent;

    @Column(nullable = false)
    private Boolean sucesso = true;

    @Column(name = "\"motivoFalha\"")
    private String motivoFalha;

    @Column(name = "\"criadoEm\"", updatable = false, insertable = false)
    private LocalDateTime criadoEm;
}