package br.gov.ce.tce.festividades.controller;

import br.gov.ce.tce.festividades.domain.importacao.ImportacaoException;
import br.gov.ce.tce.festividades.domain.importacao.ImportacaoService;
import br.gov.ce.tce.festividades.domain.importacao.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.Arrays;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/importar-planilha")
@RequiredArgsConstructor
public class ImportacaoController {

    private static final Duration JANELA_RATE_LIMIT = Duration.ofSeconds(60);
    private static final int MAX_TENTATIVAS = 5;

    private final ImportacaoService importacaoService;
    private final RateLimiter rateLimiter;

    @Value("${IMPORT_ALLOWED_IPS:}")
    private String ipsPermitidos;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> importarPlanilha(
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo,
            HttpServletRequest request,
            Authentication authentication
    ) {
        String ip = obterIp(request);
        String userAgent = request.getHeader("User-Agent") != null ? request.getHeader("User-Agent") : "desconhecido";

        if (!ipAutorizado(ip)) {
            return falha(403, "Não autorizado.", "IP fora da allowlist", null, ip, userAgent);
        }

        if (!rateLimiter.permitir("import:" + ip, JANELA_RATE_LIMIT, MAX_TENTATIVAS)) {
            return falha(429, "Muitas tentativas. Aguarde e tente novamente.", "Rate limit excedido", null, ip, userAgent);
        }

        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return falha(401, "Não autorizado.", "Token JWT ausente, inválido ou expirado", null, ip, userAgent);
        }

        if (arquivo == null) {
            return falha(400, "Campo 'arquivo' ausente.", "Arquivo ausente", null, ip, userAgent);
        }

        try {
            return ResponseEntity.ok(toMap(importacaoService.processar(arquivo, authentication.getName(), ip, userAgent)));
        } catch (ImportacaoException e) {
            return falha(e.getStatus(), e.getMessage(), e.getMotivoLog(), e.getAno(), ip, userAgent);
        } catch (Exception e) {
            log.error("[importar-planilha] erro inesperado", e);
            return falha(500, "Erro interno ao processar a importação.", "Erro inesperado", null, ip, userAgent);
        }
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> tamanhoExcedido(HttpServletRequest request) {
        return falha(413, "Arquivo excede o tamanho máximo permitido (15 MB).",
                "Arquivo muito grande (limite do servidor)", null, obterIp(request), request.getHeader("User-Agent"));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, Object>> corpoInvalido(HttpServletRequest request) {
        return falha(400, "Requisição inválida.", "Corpo da requisição inválido",
                null, obterIp(request), request.getHeader("User-Agent"));
    }

    private ResponseEntity<Map<String, Object>> falha(int status, String mensagem, String motivo,
                                                      Integer ano, String ip, String userAgent) {
        importacaoService.registrarFalha(ip, userAgent, motivo, null, ano);
        return ResponseEntity.status(status).body(Map.of("erro", mensagem));
    }

    private static Map<String, Object> toMap(br.gov.ce.tce.festividades.domain.importacao.ImportacaoResultado r) {
        Map<String, Object> corpo = new java.util.LinkedHashMap<>();
        corpo.put("sucesso", r.sucesso());
        corpo.put("evento", r.evento());
        corpo.put("ano", r.ano());
        corpo.put("municipios_eventos", r.municipiosEventos());
        corpo.put("registrosImportados", r.registrosImportados());
        if (r.abasIgnoradas() != null && !r.abasIgnoradas().isEmpty()) {
            corpo.put("abasIgnoradas", r.abasIgnoradas());
        }
        return corpo;
    }

    private boolean ipAutorizado(String ip) {
        if (ipsPermitidos == null || ipsPermitidos.isBlank()) return true;
        return Arrays.stream(ipsPermitidos.split(",")).map(String::trim).anyMatch(ip::equals);
    }

    private static String obterIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
