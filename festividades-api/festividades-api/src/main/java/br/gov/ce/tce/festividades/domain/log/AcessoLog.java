package br.gov.ce.tce.festividades.domain.log;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "\"AcessoLog\"", schema = "festividades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class AcessoLog {

    @Id
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String email;

    private String ip;

    @Column(name = "\"userAgent\"")
    private String userAgent;

    @Column(nullable = false)
    private Boolean sucesso;

    private String motivo;

    @Column(name = "\"criadoEm\"", updatable = false, insertable = false)
    private LocalDateTime criadoEm;
}