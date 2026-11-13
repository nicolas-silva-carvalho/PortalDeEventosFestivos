package br.gov.ce.tce.festividades.controller;

import br.gov.ce.tce.festividades.domain.log.AcessoLog;
import br.gov.ce.tce.festividades.domain.log.AcessoLogRepository;
import br.gov.ce.tce.festividades.domain.usuario.Usuario;
import br.gov.ce.tce.festividades.domain.usuario.dto.AutenticacaoDTO;
import br.gov.ce.tce.festividades.infra.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AcessoLogRepository logRepository;

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody @Valid AutenticacaoDTO.Requisicao dados, HttpServletRequest request) {

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null) ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

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

        } catch (Exception e) {
            salvarLog(dados.email(), ip, userAgent, false, "Usuário ou senha inválidos");
            return ResponseEntity.status(401).body("Usuário ou senha inválidos.");
        }
    }

    private void salvarLog(String email, String ip, String userAgent, boolean sucesso, String motivo) {
        AcessoLog log = new AcessoLog();
        log.setEmail(email);
        log.setIp(ip);
        log.setUserAgent(userAgent);
        log.setSucesso(sucesso);
        log.setMotivo(motivo);
        logRepository.save(log);
    }
}