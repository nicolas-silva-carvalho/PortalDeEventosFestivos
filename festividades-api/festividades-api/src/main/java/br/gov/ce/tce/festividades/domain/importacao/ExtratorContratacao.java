package br.gov.ce.tce.festividades.domain.importacao;

import br.gov.ce.tce.festividades.domain.contratacao.Contratacao;

import java.util.Locale;

import static br.gov.ce.tce.festividades.domain.importacao.Conversores.*;
import static br.gov.ce.tce.festividades.domain.importacao.LeitorExcel.coalesce;
import static br.gov.ce.tce.festividades.domain.importacao.LeitorExcel.temColuna;

public final class ExtratorContratacao {

    private ExtratorContratacao() {
    }

    public enum Categoria {
        ATRACOES("atracoes"), OUTORGA("outorga"), ORGANIZACAO("organizacao");

        private final String valor;

        Categoria(String valor) {
            this.valor = valor;
        }

        public String valor() {
            return valor;
        }
    }

    public static Categoria detectarCategoria(Iterable<String> headers) {
        if (temColuna(headers, "nome", "artista") || temColuna(headers, "nome", "banda")) return Categoria.ATRACOES;
        if (temColuna(headers, "houve", "outorga") || temColuna(headers, "beneficiario")) return Categoria.OUTORGA;
        if (temColuna(headers, "empresa", "organizadora") || temColuna(headers, "gastos", "infraestrutura"))
            return Categoria.ORGANIZACAO;
        return null;
    }

    public static String mapearEventoParaSlug(String eventoBruto) {
        String n = normalizar(eventoBruto);
        if (n.contains("pre carnaval") || n.contains("pre-carnaval") || n.contains("precarnaval")) return "pre_carnaval";
        if (n.contains("sao joao") || n.contains("junino")) return "sao_joao";
        if (n.contains("reveillon")) return "reveillon";
        if (n.contains("carnaval")) return "carnaval";
        if (n.contains("aniversario") || n.contains("emancipacao")) return "aniversario";
        if (n.contains("religiosa") || n.contains("padroeiro")) return "festas_religiosas";
        if (n.contains("natal")) return "natal";
        return "outros";
    }

    public static String nomeMunicipioDaLinha(LeitorExcel l) {
        String nome = textoSeguro(l.campo("municipio"), 200);
        return nome == null ? "" : nome;
    }

    public static String identificarEventoSlug(LeitorExcel l) {
        String tematica = textoSeguro(coalesce(l.campo("tematica"), l.campo("tipo", "evento")), 100);
        if (tematica == null) tematica = "";
        if (normalizar(tematica).contains("outros")) {
            String nomeOutros = textoSeguro(l.campo("nome", "evento"), 100);
            return nomeOutros != null ? mapearEventoParaSlug(nomeOutros) : "outros";
        }
        return mapearEventoParaSlug(tematica);
    }

    public static Contratacao extrair(Categoria categoria, LeitorExcel l) {
        return switch (categoria) {
            case ATRACOES -> extrairAtracoes(l);
            case OUTORGA -> extrairOutorga(l);
            case ORGANIZACAO -> extrairOrganizacao(l);
        };
    }

    private static Contratacao cabecalhoComum(LeitorExcel l, Categoria categoria) {
        Contratacao c = new Contratacao();
        c.setCategoria(categoria.valor());
        c.setCarimbo(parseData(l.campo("carimbo")));
        c.setResponsavelEnvio(textoSeguro(l.campo("responsavel", "envio"), 200));
        c.setEmailContato(textoSeguro(l.campo("e-mail"), 150));
        c.setTelefoneContato(textoSeguro(l.campo("telefone"), 50));
        c.setTematicaEvento(textoSeguro(coalesce(l.campo("tematica"), l.campo("tipo", "evento")), 100));
        c.setNomeEventoOutros(textoSeguro(l.campo("nome", "evento"), 150));
        c.setUrlTce(linkSeguro(l.campo("url", "tce")));
        c.setUrlPncp(linkSeguro(l.campo("url", "pncp")));
        c.setUrlTransparencia(linkSeguro(l.campo("url", "transparencia")));
        String status = textoSeguro(l.campo("status", "auditor"), 50);
        c.setStatusAuditor(status != null ? status : "Novo");
        return c;
    }

    private static boolean respostaNao(String texto) {
        if (texto == null) return false;
        String t = texto.toLowerCase(Locale.ROOT);
        return t.equals("não") || t.equals("nao");
    }

    private static Contratacao extrairAtracoes(LeitorExcel l) {
        String nomeArtista = textoSeguro(coalesce(l.campo("nome", "artista"), l.campo("nome", "banda")), 300);
        if (nomeArtista == null) return null;

        Contratacao c = cabecalhoComum(l, Categoria.ATRACOES);
        c.setFornecedorOuArtista(nomeArtista);
        c.setDataEvento(parseData(coalesce(l.campo("data", "show"), l.campo("data", "evento"))));
        c.setHorarioShow(parseHorario(l.campo("horario", "show")));
        c.setDuracao(parseDuracao(l.campo("duracao")));
        c.setCnpjContratada(textoSeguro(l.campo("cnpj", "empresa"), 20));
        c.setRazaoSocial(textoSeguro(l.campo("razao", "social", "empresa"), 300));
        c.setValor(parseValor(coalesce(l.campo("valor", "contratado"), l.campo("valor", "total"))));
        c.setValorTransporte(parseValor(l.campo("valor", "transporte")));
        c.setModalidade(textoSeguro(l.campo("modalidade"), 100));
        c.setNumeroProcedimento(textoSeguro(l.campo("procedimento"), 100));
        c.setDataContratacao(parseData(l.campo("data", "contratacao")));
        c.setFormaContratacao(textoSeguro(
                coalesce(l.campo("forma de contratacao"), l.campo("tipo de contratacao")), 50));
        c.setRazaoSocialIntermediaria(textoSeguro(l.campo("razao", "social", "direta"), 300));
        c.setCnpjIntermediaria(textoSeguro(l.campo("cnpj", "direta"), 20));
        c.setPagamentoAntecipado(textoSeguro(l.campo("pagamento", "antecipado"), 10));
        c.setFonteRecursos(String.join(", ", multiSelect(l.campo("fonte", "recursos"))));
        c.setRecursosProprios(parseValor(l.campo("recursos", "proprios")));
        c.setRecursosEstaduais(parseValor(l.campo("recursos", "estaduais")));
        c.setRecursosFederais(parseValor(l.campo("recursos", "federais")));
        c.setRecursosOutros(parseValor(l.campo("recursos", "outras")));
        c.setLinkContrato(linkSeguro(l.campo("upload", "contrato")));
        c.setLinkProposta(linkSeguro(l.campo("upload", "proposta")));
        return c;
    }

    private static Contratacao extrairOutorga(LeitorExcel l) {
        String houveOutorga = textoSeguro(coalesce(l.campo("houve", "outorga"), l.campo("cessao")), 10);
        if (respostaNao(houveOutorga)) return null;

        String beneficiario = textoSeguro(coalesce(l.campo("nome", "beneficiario"), l.campo("permissionario")), 300);
        if (beneficiario == null) return null;

        double valorOutorga = parseValor(coalesce(
                l.campo("valor", "envolvido"),
                l.campo("gasto", "receita"),
                l.campo("valor", "outorga")));

        Contratacao c = cabecalhoComum(l, Categoria.OUTORGA);
        c.setFornecedorOuArtista(beneficiario);
        c.setObjeto(textoSeguro(coalesce(l.campo("finalidade"), l.campo("objeto")), 500));
        c.setBeneficiario(beneficiario);
        c.setCnpjBeneficiario(textoSeguro(coalesce(l.campo("cnpj", "beneficiario"), l.campo("cpf", "beneficiario")), 20));
        c.setDataContratacao(parseData(l.campo("data", "contratacao")));
        c.setModalidade(textoSeguro(l.campo("modalidade"), 100));
        c.setNumeroProcedimento(textoSeguro(l.campo("procedimento"), 100));
        c.setValor(valorOutorga);
        c.setLinkContrato(linkSeguro(l.campo("upload", "contrato")));
        c.setLinkProposta(linkSeguro(coalesce(l.campo("upload", "projeto"), l.campo("dimensionamento"))));
        return c;
    }

    private static Contratacao extrairOrganizacao(LeitorExcel l) {
        String contratouInfra = textoSeguro(
                coalesce(l.campo("contratou", "empresa", "organizadora"), l.campo("infraestrutura")), 10);
        if (respostaNao(contratouInfra)) return null;

        String razaoSocial = textoSeguro(l.campo("razao", "social", "empresa"), 300);
        if (razaoSocial == null) return null;

        Contratacao c = cabecalhoComum(l, Categoria.ORGANIZACAO);
        c.setFornecedorOuArtista(razaoSocial);
        c.setObjeto(textoSeguro(coalesce(l.campo("finalidade"), l.campo("objeto")), 500));
        c.setCnpjContratada(textoSeguro(l.campo("cnpj", "empresa"), 20));
        c.setRazaoSocial(razaoSocial);
        c.setValor(parseValor(coalesce(l.campo("valor", "total"), l.campo("valor", "contratado"))));
        c.setDataContratacao(parseData(l.campo("data", "contratacao")));
        c.setModalidade(textoSeguro(l.campo("modalidade"), 100));
        c.setNumeroProcedimento(textoSeguro(l.campo("procedimento"), 100));
        c.setValorProporcional(parseValor(l.campo("somente", "evento")));
        c.setLinkContrato(linkSeguro(l.campo("upload", "contrato")));
        c.setLinkProposta(linkSeguro(l.campo("upload", "detalhamento")));
        return c;
    }
}
