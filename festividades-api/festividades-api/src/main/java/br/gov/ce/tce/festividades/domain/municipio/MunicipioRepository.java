package br.gov.ce.tce.festividades.domain.municipio;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MunicipioRepository extends JpaRepository<Municipio, Integer> {

    Optional<Municipio> findBySlugAndEventoAndAno(String slug, String evento, Integer ano);
}