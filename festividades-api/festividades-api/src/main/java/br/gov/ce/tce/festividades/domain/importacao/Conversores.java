package br.gov.ce.tce.festividades.domain.importacao;

import java.math.BigDecimal;
import java.net.URI;
import java.text.Normalizer;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class Conversores {

    private Conversores() {
    }

    private static final Pattern DIACRITICOS = Pattern.compile("\\p{M}+");
    private static final Pattern DATA_ISO = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}");
    private static final Pattern DATA_BR = Pattern.compile("(\\d{1,2})[/\\-](\\d{1,2})[/\\-](\\d{2,4})");
    private static final Pattern HORARIO = Pattern.compile("^(\\d{1,2}):(\\d{2})");
    private static final Pattern NUMERO_INICIAL = Pattern.compile("^[+-]?(\\d+\\.?\\d*|\\.\\d+)");
    private static final Pattern MILHAR = Pattern.compile("\\.(?=\\d{3}(,|$))");
    private static final Pattern ANO_NO_NOME = Pattern.compile("20\\d{2}");

    public static String normalizar(String texto) {
        if (texto == null) return "";
        String semAcento = DIACRITICOS.matcher(Normalizer.normalize(texto, Normalizer.Form.NFD)).replaceAll("");
        return semAcento.toLowerCase(Locale.ROOT).trim();
    }

    public static String slugify(String texto) {
        return normalizar(texto).replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
    }

    public static int anoDoNomeArquivo(String nome) {
        if (nome != null) {
            Matcher m = ANO_NO_NOME.matcher(nome);
            if (m.find()) return Integer.parseInt(m.group());
        }
        return LocalDate.now().getYear();
    }

    public static String truncar(String texto, int max) {
        if (texto == null) return null;
        return texto.length() > max ? texto.substring(0, max) : texto;
    }

    private static String paraTexto(Object v) {
        if (v instanceof Double d) {
            if (d.isNaN() || d.isInfinite()) return d.toString();
            if (d == Math.rint(d) && Math.abs(d) < 1e15) return Long.toString(d.longValue());
            return BigDecimal.valueOf(d).toPlainString();
        }
        return String.valueOf(v);
    }

    public static String textoSeguro(Object valor, int maxLen) {
        if (valor == null) return null;
        String texto = truncar(paraTexto(valor).trim(), maxLen);
        return texto.isEmpty() ? null : texto;
    }

    public static List<String> multiSelect(Object valor) {
        String texto = textoSeguro(valor, 500);
        if (texto == null) return List.of();
        return Arrays.stream(texto.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .limit(20)
                .toList();
    }

    public static double parseValor(Object bruto) {
        if (bruto instanceof Number n) return n.doubleValue();
        if (bruto == null) return 0;
        if (bruto instanceof Boolean b) return 0;
        String s = bruto.toString();
        if (s.isEmpty()) return 0;

        String limpo = s.replaceAll("[^\\d,.-]", "");
        limpo = MILHAR.matcher(limpo).replaceAll("");
        limpo = limpo.replaceFirst(",", ".");

        Matcher m = NUMERO_INICIAL.matcher(limpo);
        if (!m.find()) return 0;
        try {
            double d = Double.parseDouble(m.group());
            return Double.isNaN(d) ? 0 : d;
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public static LocalDateTime parseData(Object bruto) {
        if (bruto == null) return null;
        if (bruto instanceof LocalDateTime ldt) return ldt;

        if (bruto instanceof Number n) {
            double serial = n.doubleValue();
            if (serial == 0 || Double.isNaN(serial) || Double.isInfinite(serial)) return null;
            long segundos = Math.round((serial - 25569) * 86400d);
            try {
                return LocalDateTime.ofEpochSecond(segundos, 0, ZoneOffset.UTC);
            } catch (DateTimeException e) {
                return null;
            }
        }

        String texto = bruto.toString().trim();
        if (texto.isEmpty()) return null;

        if (DATA_ISO.matcher(texto).find()) {
            try {
                return LocalDate.parse(texto.substring(0, 10)).atTime(12, 0);
            } catch (DateTimeException e) {
                return null;
            }
        }

        Matcher br = DATA_BR.matcher(texto);
        if (br.find()) {
            String ano = br.group(3);
            String anoCompleto = ano.length() == 2 ? "20" + ano : ano;
            try {
                return LocalDate.of(
                        Integer.parseInt(anoCompleto),
                        Integer.parseInt(br.group(2)),
                        Integer.parseInt(br.group(1))
                ).atTime(12, 0);
            } catch (DateTimeException | NumberFormatException e) {
                return null;
            }
        }

        try {
            return LocalDateTime.parse(texto);
        } catch (DateTimeException ignorado) {
            try {
                return OffsetDateTime.parse(texto).toLocalDateTime();
            } catch (DateTimeException ignorado2) {
                return null;
            }
        }
    }

    public static String linkSeguro(Object valor) {
        String texto = textoSeguro(valor, 500);
        if (texto == null) return null;
        try {
            URI uri = new URI(texto);
            String esquema = uri.getScheme();
            boolean http = "http".equalsIgnoreCase(esquema) || "https".equalsIgnoreCase(esquema);
            return http && uri.getHost() != null ? texto : null;
        } catch (Exception e) {
            return null;
        }
    }

    private static String horaDeFracaoDeDia(double fracao) {
        long minutosTotais = Math.round(fracao * 24 * 60);
        return String.format("%02d:%02d", minutosTotais / 60, minutosTotais % 60);
    }

    public static String parseDuracao(Object valor) {
        if (valor instanceof Number n && n.doubleValue() < 1) {
            return horaDeFracaoDeDia(n.doubleValue());
        }
        return textoSeguro(valor, 50);
    }

    public static String parseHorario(Object valor) {
        if (valor == null) return null;
        if (valor instanceof String s && s.isEmpty()) return null;

        if (valor instanceof Number n && n.doubleValue() >= 0 && n.doubleValue() <= 1) {
            return horaDeFracaoDeDia(n.doubleValue());
        }

        String texto = valor.toString().trim();
        Matcher m = HORARIO.matcher(texto);
        if (m.find()) {
            String hora = m.group(1).length() == 1 ? "0" + m.group(1) : m.group(1);
            return hora + ":" + m.group(2);
        }
        return textoSeguro(valor, 50);
    }
}
