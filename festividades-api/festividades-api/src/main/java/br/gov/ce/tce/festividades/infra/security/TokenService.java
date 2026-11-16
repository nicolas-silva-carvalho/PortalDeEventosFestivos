package br.gov.ce.tce.festividades.infra.security;

import br.gov.ce.tce.festividades.domain.usuario.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class TokenService {

    private static final Duration VALIDADE = Duration.ofHours(2);

    @Value("${api.security.token.secret}")
    private String secret;

    private SecretKey key;

    @PostConstruct
    void inicializar() {
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "api.security.token.secret deve ter pelo menos 32 caracteres (defina via variável de ambiente).");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public String gerarToken(Usuario usuario) {
        return Jwts.builder()
                .issuer("API Festividades TCE-CE")
                .subject(usuario.getId())
                .claim("nome", usuario.getNome())
                .expiration(Date.from(dataExpiracao()))
                .signWith(key)
                .compact();
    }

    public String getSubject(String tokenJWT) {
        try {
            return Jwts.parser()
                    .requireIssuer("API Festividades TCE-CE")
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(tokenJWT)
                    .getPayload()
                    .getSubject();
        } catch (Exception exception) {
            throw new RuntimeException("Token JWT inválido ou expirado!");
        }
    }

    public Instant dataExpiracao() {
        return Instant.now().plus(VALIDADE);
    }
}
