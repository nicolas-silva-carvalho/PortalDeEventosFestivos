package br.gov.ce.tce.festividades.domain.municipio;

import br.gov.ce.tce.festividades.domain.contratacao.Contratacao;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Builder
@Entity
@Table(name = "\"Municipio\"", schema = "festividades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Municipio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String evento;

    @Column(nullable = false)
    private Integer ano;

    @OneToMany(mappedBy = "municipio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Contratacao> contratacoes = new ArrayList<>();
}