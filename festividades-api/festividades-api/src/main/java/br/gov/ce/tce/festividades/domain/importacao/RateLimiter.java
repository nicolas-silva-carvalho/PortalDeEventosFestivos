package br.gov.ce.tce.festividades.domain.importacao;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiter {

    private static final int LIMITE_CHAVES_ANTES_DE_LIMPAR = 10_000;

    private final ConcurrentHashMap<String, Deque<Long>> acessos = new ConcurrentHashMap<>();

    public boolean permitir(String chave, Duration janela, int maxTentativas) {
        long agora = System.currentTimeMillis();
        long janelaMs = janela.toMillis();

        if (acessos.size() > LIMITE_CHAVES_ANTES_DE_LIMPAR) limpar(agora, janelaMs);

        Deque<Long> fila = acessos.computeIfAbsent(chave, k -> new ArrayDeque<>());
        synchronized (fila) {
            while (!fila.isEmpty() && agora - fila.peekFirst() >= janelaMs) fila.pollFirst();
            if (fila.size() >= maxTentativas) return false;
            fila.addLast(agora);
            return true;
        }
    }

    private void limpar(long agora, long janelaMs) {
        acessos.entrySet().removeIf(e -> {
            Deque<Long> fila = e.getValue();
            synchronized (fila) {
                return fila.isEmpty() || agora - fila.peekLast() >= janelaMs;
            }
        });
    }
}
