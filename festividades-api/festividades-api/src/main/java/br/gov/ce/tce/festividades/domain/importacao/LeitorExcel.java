package br.gov.ce.tce.festividades.domain.importacao;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static br.gov.ce.tce.festividades.domain.importacao.Conversores.normalizar;

public class LeitorExcel {

    public record AbaLida(String nome, List<String> cabecalhos, List<LeitorExcel> linhas) {
    }

    private final Map<String, Object> porChave = new LinkedHashMap<>();

    public LeitorExcel(Map<String, Object> linhaOriginal) {
        linhaOriginal.forEach((chave, valor) -> porChave.putIfAbsent(normalizar(chave), valor));
    }

    public Object campo(String... palavrasChave) {
        String[] alvo = Arrays.stream(palavrasChave).map(Conversores::normalizar).toArray(String[]::new);
        for (Map.Entry<String, Object> e : porChave.entrySet()) {
            boolean todas = true;
            for (String p : alvo) {
                if (!e.getKey().contains(p)) {
                    todas = false;
                    break;
                }
            }
            if (todas) return e.getValue();
        }
        return null;
    }

    public static Object coalesce(Object... valores) {
        for (Object v : valores) {
            if (v != null) return v;
        }
        return null;
    }

    public static boolean temColuna(Iterable<String> cabecalhos, String... palavrasChave) {
        String[] alvo = Arrays.stream(palavrasChave).map(Conversores::normalizar).toArray(String[]::new);
        for (String h : cabecalhos) {
            String hn = normalizar(h);
            boolean todas = true;
            for (String p : alvo) {
                if (!hn.contains(p)) {
                    todas = false;
                    break;
                }
            }
            if (todas) return true;
        }
        return false;
    }

    public static AbaLida lerAba(Sheet sheet) {
        DataFormatter fmt = new DataFormatter();
        int primeira = sheet.getFirstRowNum();
        Row cab = sheet.getRow(primeira);
        if (cab == null) return new AbaLida(sheet.getSheetName(), List.of(), List.of());

        int ultimaColuna = Math.max(cab.getLastCellNum(), 0);
        String[] nomes = new String[ultimaColuna];
        List<String> cabecalhos = new ArrayList<>();
        Set<String> usados = new HashSet<>();

        for (int c = 0; c < ultimaColuna; c++) {
            Cell cell = cab.getCell(c);
            String nome = cell == null ? "" : fmt.formatCellValue(cell).trim();
            if (nome.isEmpty()) continue;
            String unico = nome;
            int n = 1;
            while (!usados.add(unico)) unico = nome + "_" + n++;
            nomes[c] = unico;
            cabecalhos.add(unico);
        }

        List<LeitorExcel> linhas = new ArrayList<>();
        for (int r = primeira + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            Map<String, Object> valores = new LinkedHashMap<>();
            boolean vazia = true;
            for (int c = 0; c < ultimaColuna; c++) {
                if (nomes[c] == null) continue;
                Object v = valorDaCelula(row.getCell(c));
                if (!(v instanceof String s && s.isBlank())) vazia = false;
                valores.put(nomes[c], v);
            }
            if (!vazia) linhas.add(new LeitorExcel(valores));
        }
        return new AbaLida(sheet.getSheetName(), cabecalhos, linhas);
    }

    private static Object valorDaCelula(Cell cell) {
        if (cell == null) return "";
        CellType tipo = cell.getCellType();
        if (tipo == CellType.FORMULA) tipo = cell.getCachedFormulaResultType();
        switch (tipo) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return Double.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return Boolean.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}
