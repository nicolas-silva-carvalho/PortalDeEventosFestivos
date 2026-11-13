package br.gov.ce.tce.festividades.domain.log;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistoricoConferenciaRepository extends JpaRepository<HistoricoConferencia, String> {

    HistoricoConferencia findTopByOrderByCreatedAtDesc();

    Optional<HistoricoConferencia> findFirstByOrderByDataRealizadaDesc();

    List<HistoricoConferencia> findTop20ByOrderByDataRealizadaDesc();
}