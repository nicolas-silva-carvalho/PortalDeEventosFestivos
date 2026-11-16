package br.gov.ce.tce.festividades.controller;

import br.gov.ce.tce.festividades.domain.importacao.Conversores;
import br.gov.ce.tce.festividades.domain.importacao.RateLimiter;
import br.gov.ce.tce.festividades.domain.log.AcessoLog;
import br.gov.ce.tce.festividades.domain.log.AcessoLogRepository;
import br.gov.ce.tce.festividades.domain.usuario.Usuario;
import br.gov.ce.tce.festividades.domain.usuario.dto.AutenticacaoDTO;
import br.gov.ce.tce.festividades.infra.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    private static final Duration JANELA_RATE_LIMIT = Duration.ofSeconds(60);
    private static final int MAX_TENTATIVAS = 10;

    private final AuthenticationManager manager;
    private final TokenService tokenService;
    private final AcessoLogRepository logRepository;
    private final RateLimiter rateLimiter;

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody @Valid AutenticacaoDTO.Requisicao dados, HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = Conversores.truncar(request.getHeader("User-Agent"), 500);

        if (!rateLimiter.permitir("login:" + ip, JANELA_RATE_LIMIT, MAX_TENTATIVAS)) {
            log.warn("[login] rate limit excedido para {}", ip);
            return ResponseEntity.status(429).body(Map.of("erro", "Muitas tentativas. Aguarde e tente novamente."));
        }

        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
            var authentication = manager.authenticate(authenticationToken);

            var usuario = (Usuario) authentication.getPrincipal();
            var tokenJWT = tokenService.gerarToken(usuario);

            salvarLog(dados.email(), ip, userAgent, true, null);

            return ResponseEntity.ok(new AutenticacaoDTO.Resposta(
                    tokenJWT,
                    tokenService.dataExpiracao().toString(),
                    usuario.getNome()
            ));

        } catch (AuthenticationException e) {
            salvarLog(dados.email(), ip, userAgent, false, "Usuário ou senha inválidos");
            return ResponseEntity.status(401).body(Map.of("erro", "Usuário ou senha inválidos."));
        } catch (Exception e) {
            log.error("[login] erro inesperado", e);
            return ResponseEntity.status(500).body(Map.of("erro", "Erro interno."));
        }
    }

    private void salvarLog(String email, String ip, String userAgent, boolean sucesso, String motivo) {
        try {
            AcessoLog registro = new AcessoLog();
            registro.setEmail(Conversores.truncar(email, 150));
            registro.setIp(ip);
            registro.setUserAgent(userAgent);
            registro.setSucesso(sucesso);
            registro.setMotivo(motivo);
            logRepository.save(registro);
        } catch (Exception e) {
            log.warn("[login] não foi possível gravar o AcessoLog", e);
        }
    }
}
