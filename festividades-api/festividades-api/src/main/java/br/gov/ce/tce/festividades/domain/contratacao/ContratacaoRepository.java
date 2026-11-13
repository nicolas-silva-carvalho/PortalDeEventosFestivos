package br.gov.ce.tce.festividades.domain.contratacao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContratacaoRepository extends JpaRepository<Contratacao, String>, JpaSpecificationExecutor<Contratacao> {

    @Modifying
    @Query("DELETE FROM Contratacao c WHERE c.municipio.id = :municipioId")
    void deleteByMunicipioId(@Param("municipioId") Integer municipioId);

    @Query("select c from Contratacao c join fetch c.municipio")
    List<Contratacao> findAllComMunicipio();
}