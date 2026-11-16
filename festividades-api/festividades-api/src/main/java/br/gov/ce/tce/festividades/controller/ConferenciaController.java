package br.gov.ce.tce.festividades.controller;

import br.gov.ce.tce.festividades.domain.importacao.Conversores;
import br.gov.ce.tce.festividades.domain.log.HistoricoConferencia;
import br.gov.ce.tce.festividades.domain.log.HistoricoConferenciaRepository;
import br.gov.ce.tce.festividades.domain.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ConferenciaController {

    private static final ZoneId FORTALEZA = ZoneId.of("America/Fortaleza");
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("dd MMM yyyy", PT_BR);

    private final HistoricoConferenciaRepository repository;

    public record NovaConferenciaDTO(String dataRealizada, String responsavel) {}

    public record UltimaConferenciaDTO(String dataRealizada, String dataFormatada) {}

    public record RespostaRegistro(boolean sucesso, String mensagem, HistoricoConferencia dados) {}

    @GetMapping("/api/publico/ultima-conferencia")
    public ResponseEntity<UltimaConferenciaDTO> ultima() {
        UltimaConferenciaDTO dto = repository.findFirstByOrderByDataRealizadaDesc()
                .map(c -> new UltimaConferenciaDTO(
                        c.getDataRealizada().atOffset(ZoneOffset.UTC).toString(),
                        formatar(c.getDataRealizada())))
                .orElse(new UltimaConferenciaDTO(null, "Pendente"));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(1)).cachePublic())
                .body(dto);
    }

    @PostMapping("/api/conferencias")
    public ResponseEntity<RespostaRegistro> registrar(
            @RequestBody(required = false) NovaConferenciaDTO body,
            Authentication auth) {
        try {
            HistoricoConferencia c = new HistoricoConferencia();
            c.setDataRealizada(body != null && body.dataRealizada() != null && !body.dataRealizada().isBlank()
                    ? paraUtc(body.dataRealizada())
                    : LocalDateTime.now(ZoneOffset.UTC));
            c.setResponsavel(resolverResponsavel(body, auth));
            repository.save(c);

            return ResponseEntity.status(201)
                    .body(new RespostaRegistro(true, "Conferência registrada com sucesso!", c));
        } catch (Exception e) {
            log.error("[conferencias] erro ao registrar", e);
            return ResponseEntity.status(500)
                    .body(new RespostaRegistro(false, "Erro ao registrar conferência.", null));
        }
    }

    @GetMapping("/api/conferencias")
    public ResponseEntity<List<HistoricoConferencia>> historico() {
        return ResponseEntity.ok(repository.findTop20ByOrderByDataRealizadaDesc());
    }

    private static String resolverResponsavel(NovaConferenciaDTO body, Authentication auth) {
        if (body != null && body.responsavel() != null && !body.responsavel().isBlank()) {
            return Conversores.truncar(body.responsavel().trim(), 200);
        }
        if (auth != null && auth.getPrincipal() instanceof Usuario u) return u.getNome();
        return "Auditor Sistema";
    }

    private static LocalDateTime paraUtc(String texto) {
        try {
            return OffsetDateTime.parse(texto).withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
        } catch (Exception e) {
            return LocalDateTime.parse(texto).atZone(FORTALEZA).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        }
    }

    private static String formatar(LocalDateTime utc) {
        ZonedDateTime local = utc.atZone(ZoneOffset.UTC).withZoneSameInstant(FORTALEZA);
        return FORMATO.format(local).replace(".", "").toUpperCase(PT_BR);
    }
}
