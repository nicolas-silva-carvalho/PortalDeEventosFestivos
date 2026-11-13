package br.gov.ce.tce.festividades.domain.importacao;

public class ImportacaoException extends RuntimeException {

    private final int status;
    private final String motivoLog;
    private final Integer ano;

    public ImportacaoException(int status, String mensagem, String motivoLog, Integer ano) {
        super(mensagem);
        this.status = status;
        this.motivoLog = motivoLog;
        this.ano = ano;
    }

    public int getStatus() {
        return status;
    }

    public String getMotivoLog() {
        return motivoLog;
    }

    public Integer getAno() {
        return ano;
    }
}
