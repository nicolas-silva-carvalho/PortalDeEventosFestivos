package br.gov.ce.tce.festividades.controller;

import br.gov.ce.tce.festividades.domain.contratacao.ContratacaoService;
import br.gov.ce.tce.festividades.domain.contratacao.dto.ContratacaoPublicaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contratacoes")
@RequiredArgsConstructor
public class ContratacaoController {

    private final ContratacaoService service;

    @GetMapping
    public ResponseEntity<List<ContratacaoPublicaDTO>> listar() {
        List<ContratacaoPublicaDTO> dados = service.listarTodasPublico();
        return ResponseEntity.ok(dados);
    }
}