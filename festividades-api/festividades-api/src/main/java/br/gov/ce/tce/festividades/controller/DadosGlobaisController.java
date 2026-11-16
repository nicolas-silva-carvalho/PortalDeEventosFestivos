package br.gov.ce.tce.festividades.controller;

import br.gov.ce.tce.festividades.domain.contratacao.DadosGlobaisService;
import br.gov.ce.tce.festividades.domain.contratacao.dto.DadosGlobaisDTO;
import br.gov.ce.tce.festividades.domain.contratacao.dto.ContratacaoFrontDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/publico")
@RequiredArgsConstructor
public class DadosGlobaisController {

    private final DadosGlobaisService service;

    @GetMapping("/dados-globais")
    public ResponseEntity<DadosGlobaisDTO> dadosGlobais(@RequestParam(required = false) Integer ano) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(service.montar(ano));
    }

    @GetMapping("/contratacoes")
    public ResponseEntity<List<ContratacaoFrontDTO>> contratacoes(@RequestParam(required = false) Integer ano) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(service.montar(ano).rankingContratacoes());
    }

    @GetMapping("/filtros")
    public ResponseEntity<DadosGlobaisDTO.Filtros> filtros() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(service.montar(null).filtros());
    }
}
