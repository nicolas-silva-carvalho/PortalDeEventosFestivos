package br.gov.ce.tce.festividades.domain.importacao;

import br.gov.ce.tce.festividades.domain.contratacao.Contratacao;
import br.gov.ce.tce.festividades.domain.contratacao.ContratacaoRepository;
import br.gov.ce.tce.festividades.domain.importacao.ExtratorContratacao.Categoria;
import br.gov.ce.tce.festividades.domain.importacao.LeitorExcel.AbaLida;
import br.gov.ce.tce.festividades.domain.log.ImportacaoLog;
import br.gov.ce.tce.festividades.domain.log.ImportacaoLogRepository;
import br.gov.ce.tce.festividades.domain.municipio.Municipio;
import br.gov.ce.tce.festividades.domain.municipio.MunicipioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static br.gov.ce.tce.festividades.domain.importacao.Conversores.slugify;
import static br.gov.ce.tce.festividades.domain.importacao.Conversores.textoSeguro;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImportacaoService {

    private static final long MAX_TAMANHO_BYTES = 15L * 1024 * 1024;
    private static final int MAX_LINHAS_TOTAL = 20_000;
    private static final String EXTENSAO_PERMITIDA = ".xlsx";

    private final MunicipioRepository municipioRepository;
    private final ContratacaoRepository contratacaoRepository;
    private final ImportacaoLogRepository logRepository;
    private final TransactionTemplate transactionTemplate;

    private static final class Grupo {
        final String municipio;
        final String slugMunicipio;
        final String evento;
        final List<Contratacao> contratacoes = new ArrayList<>();

        Grupo(String municipio, String slugMunicipio, String evento) {
            this.municipio = municipio;
            this.slugMunicipio = slugMunicipio;
            this.evento = evento;
        }
    }

    private record Leitura(Map<String, Grupo> grupos, List<String> abasIgnoradas) {
    }

    public ImportacaoResultado processar(MultipartFile arquivo, String email, String ip, String userAgent) {
        String nomeArquivo = arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "";
        int anoUpload = Conversores.anoDoNomeArquivo(nomeArquivo);

        if (!nomeArquivo.toLowerCase(Locale.ROOT).endsWith(EXTENSAO_PERMITIDA)) {
            throw new ImportacaoException(400, "Apenas arquivos .xlsx são aceitos.",
                    "Extensão inválida: " + nomeArquivo, anoUpload);
        }
        if (arquivo.getSize() > MAX_TAMANHO_BYTES) {
            throw new ImportacaoException(413, "Arquivo excede o tamanho máximo permitido (15 MB).",
                    "Arquivo muito grande: " + arquivo.getSize() + " bytes", anoUpload);
        }

        Leitura leitura = lerPlanilha(arquivo, anoUpload);

        if (leitura.grupos().isEmpty()) {
            throw new ImportacaoException(400,
                    "Nenhum dado reconhecido no arquivo. Verifique se as abas correspondem aos formulários esperados.",
                    "Nenhuma linha válida reconhecida", anoUpload);
        }

        int totalRegistros;
        try {
            totalRegistros = gravar(leitura.grupos(), anoUpload, nomeArquivo, email, ip, userAgent);
        } catch (Exception e) {
            log.error("[importar-planilha] erro na transação", e);
            throw new ImportacaoException(500, "Erro interno ao processar a importação.",
                    "Erro ao gravar no banco", anoUpload);
        }

        return new ImportacaoResultado(true, "Upload Global", anoUpload,
                leitura.grupos().size(), totalRegistros, leitura.abasIgnoradas());
    }

    private Leitura lerPlanilha(MultipartFile arquivo, int anoUpload) {
        Map<String, Grupo> grupos = new LinkedHashMap<>();
        List<String> abasIgnoradas = new ArrayList<>();
        int totalLinhas = 0;

        try (InputStream is = arquivo.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {

            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);

                int linhasBrutas = sheet.getLastRowNum() - sheet.getFirstRowNum();
                if (linhasBrutas <= 0) continue;

                totalLinhas += linhasBrutas;
                if (totalLinhas > MAX_LINHAS_TOTAL) {
                    throw new ImportacaoException(413,
                            "O total de linhas excede o limite de " + MAX_LINHAS_TOTAL + ".",
                            "Total de linhas excede limite: " + totalLinhas, anoUpload);
                }

                AbaLida aba = LeitorExcel.lerAba(sheet);
                if (aba.linhas().isEmpty()) continue;

                Categoria categoria = ExtratorContratacao.detectarCategoria(aba.cabecalhos());
                if (categoria == null) {
                    abasIgnoradas.add(aba.nome());
                    continue;
                }

                for (LeitorExcel linha : aba.linhas()) {
                    String nomeMunicipio = ExtratorContratacao.nomeMunicipioDaLinha(linha);
                    if (nomeMunicipio.isEmpty()) continue;

                    Contratacao contratacao = ExtratorContratacao.extrair(categoria, linha);
                    if (contratacao == null) continue;

                    String slugEvento = ExtratorContratacao.identificarEventoSlug(linha);
                    String slugMunicipio = slugify(nomeMunicipio);
                    String chave = slugMunicipio + ":::" + slugEvento;

                    grupos.computeIfAbsent(chave, k -> new Grupo(nomeMunicipio, slugMunicipio, slugEvento))
                            .contratacoes.add(contratacao);
                }
            }
        } catch (ImportacaoException e) {
            throw e;
        } catch (Exception e) {
            log.warn("[importar-planilha] falha ao ler .xlsx", e);
            throw new ImportacaoException(400, "Não foi possível ler o arquivo enviado.",
                    "Falha ao fazer parsing do .xlsx", anoUpload);
        }

        return new Leitura(grupos, abasIgnoradas);
    }

    private int gravar(Map<String, Grupo> grupos, int anoUpload, String nomeArquivo,
                       String email, String ip, String userAgent) {
        Integer total = transactionTemplate.execute(status -> {
            int registros = 0;

            for (Grupo grupo : grupos.values()) {
                Municipio municipio = municipioRepository
                        .findBySlugAndEventoAndAno(grupo.slugMunicipio, grupo.evento, anoUpload)
                        .orElseGet(() -> municipioRepository.save(Municipio.builder()
                                .nome(grupo.municipio)
                                .slug(grupo.slugMunicipio)
                                .evento(grupo.evento)
                                .ano(anoUpload)
                                .build()));

                contratacaoRepository.deleteByMunicipioId(municipio.getId());

                for (Contratacao c : grupo.contratacoes) {
                    c.setMunicipio(municipio);
                }
                contratacaoRepository.saveAll(grupo.contratacoes);
                registros += grupo.contratacoes.size();
            }

            logRepository.save(ImportacaoLog.builder()
                    .evento("Upload Global")
                    .ano(anoUpload)
                    .quantidadeRegistros(registros)
                    .nomeArquivo(textoSeguro(nomeArquivo, 255))
                    .origem("upload-manual-global")
                    .autor(email)
                    .ip(ip)
                    .userAgent(Conversores.truncar(userAgent, 500))
                    .sucesso(true)
                    .build());

            return registros;
        });
        return total == null ? 0 : total;
    }

    public void registrarFalha(String ip, String userAgent, String motivo, String evento, Integer ano) {
        try {
            logRepository.save(ImportacaoLog.builder()
                    .evento(evento != null ? evento : "Global")
                    .ano(ano != null ? ano : java.time.LocalDate.now().getYear())
                    .quantidadeRegistros(0)
                    .ip(ip)
                    .userAgent(Conversores.truncar(userAgent, 500))
                    .sucesso(false)
                    .motivoFalha(Conversores.truncar(motivo, 500))
                    .build());
        } catch (Exception e) {
            log.warn("Não foi possível registrar a falha de importação: {}", motivo, e);
        }
    }
}
