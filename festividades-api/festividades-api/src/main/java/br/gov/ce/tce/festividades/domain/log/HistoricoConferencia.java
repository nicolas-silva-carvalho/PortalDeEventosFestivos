package br.gov.ce.tce.festividades.domain.log;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "\"HistoricoConferencia\"", schema = "festividades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class HistoricoConferencia {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(name = "\"dataRealizada\"", nullable = false)
    private LocalDateTime dataRealizada;

    private String responsavel;

    @Column(name = "\"createdAt\"", updatable = false, insertable = false)
    private LocalDateTime createdAt;
}