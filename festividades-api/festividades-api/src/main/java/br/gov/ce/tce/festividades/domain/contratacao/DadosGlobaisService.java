package br.gov.ce.tce.festividades.domain.contratacao;

import br.gov.ce.tce.festividades.domain.contratacao.dto.ContratacaoFrontDTO;
import br.gov.ce.tce.festividades.domain.contratacao.dto.DadosGlobaisDTO;
import br.gov.ce.tce.festividades.domain.contratacao.dto.DadosGlobaisDTO.Filtros;
import br.gov.ce.tce.festividades.domain.contratacao.dto.DadosGlobaisDTO.MunicipioAgrupado;
import br.gov.ce.tce.festividades.domain.contratacao.dto.DadosGlobaisDTO.RankingArtista;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DadosGlobaisService {

    private final ContratacaoRepository repository;

    private static final Map<String, String> TEMATICA_PARA_ID = Map.of(
            "Pré-Carnaval", "pre_carnaval",
            "Carnaval", "carnaval",
            "Festejos Juninos", "sao_joao",
            "Emancipação Política/Aniversário do Município", "aniversario",
            "Festas Religiosas", "festas_religiosas",
            "Natal", "natal",
            "Réveillon", "reveillon",
            "Outros", "outros"
    );

    @Transactional(readOnly = true)
    public DadosGlobaisDTO montar(Integer ano) {
        List<ContratacaoFrontDTO> todas = repository.findAllComMunicipio().stream()
                .map(this::paraDto)
                .toList();

        List<Integer> anosDisponiveis = todas.stream()
                .map(ContratacaoFrontDTO::ano)
                .filter(Objects::nonNull)
                .distinct().sorted().toList();

        List<ContratacaoFrontDTO> lista = todas.stream()
                .filter(c -> ano == null || Objects.equals(c.ano(), ano))
                .sorted(Comparator.comparing(ContratacaoFrontDTO::valor,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        double totalGeral = 0;
        Map<String, Double> totaisPorCategoria = new LinkedHashMap<>();
        Map<String, Double> valoresPorMunicipio = new LinkedHashMap<>();
        Collator collator = Collator.getInstance(Locale.forLanguageTag("pt-BR"));
        Map<String, List<ContratacaoFrontDTO>> porMunicipio = new TreeMap<>(collator::compare);
        Map<String, RankingArtista> artistas = new HashMap<>();

        for (ContratacaoFrontDTO c : lista) {
            double v = nz(c.valor());
            totalGeral += v;
            totaisPorCategoria.merge(c.categoria(), v, Double::sum);

            if (c.municipio() != null) {
                valoresPorMunicipio.merge(slugify(c.municipio()), v, Double::sum);
                porMunicipio.computeIfAbsent(c.municipio(), k -> new ArrayList<>()).add(c);
            }

            if ("atracoes".equals(c.categoria()) && c.fornecedorOuArtista() != null) {
                artistas.merge(c.fornecedorOuArtista(),
                        new RankingArtista(c.fornecedorOuArtista(), v, 1),
                        (a, b) -> new RankingArtista(a.nome(), a.valor() + b.valor(), a.ocorrencias() + 1));
            }
        }

        List<MunicipioAgrupado> municipios = porMunicipio.entrySet().stream()
                .map(e -> new MunicipioAgrupado(
                        e.getKey(),
                        e.getValue().stream().mapToDouble(x -> nz(x.valor())).sum(),
                        e.getValue()))
                .toList();

        List<RankingArtista> rankingArtistas = artistas.values().stream()
                .sorted(Comparator.comparing(RankingArtista::valor).reversed())
                .toList();

        Filtros filtros = new Filtros(
                anosDisponiveis,
                lista.stream().map(ContratacaoFrontDTO::municipio).filter(Objects::nonNull).distinct().sorted().toList(),
                lista.stream().map(ContratacaoFrontDTO::nomeEvento).filter(Objects::nonNull).distinct().sorted().toList(),
                lista.stream().filter(c -> "atracoes".equals(c.categoria()))
                        .map(ContratacaoFrontDTO::fornecedorOuArtista)
                        .filter(Objects::nonNull).distinct().sorted().toList()
        );

        return new DadosGlobaisDTO(ano, totalGeral, totaisPorCategoria, valoresPorMunicipio,
                rankingArtistas, lista, municipios, filtros);
    }

    private ContratacaoFrontDTO paraDto(Contratacao c) {
        String tematica = c.getTematicaEvento();
        String tipoId = TEMATICA_PARA_ID.getOrDefault(tematica == null ? "Outros" : tematica, "outros");
        String nomeEvento = firstNonBlank(tematica, c.getNomeEventoOutros(), "Outros");

        Integer ano = c.getDataEvento() != null ? c.getDataEvento().getYear()
                : c.getDataContratacao() != null ? c.getDataContratacao().getYear()
                : c.getCarimbo() != null ? c.getCarimbo().getYear() : null;

        return new ContratacaoFrontDTO(
                c.getId(),
                c.getMunicipio().getNome(),
                normalizarCategoria(c.getCategoria()),
                c.getFornecedorOuArtista(),
                c.getValor(),
                ano,
                soData(c.getCarimbo()),
                soData(c.getDataEvento()),
                soData(c.getDataContratacao()),
                tipoId,
                tematica,
                nomeEvento,
                c.getNomeEventoOutros(),
                c.getHorarioShow(),
                c.getDuracao(),
                c.getObjeto(),
                c.getModalidade(),
                c.getNumeroProcedimento(),
                c.getFormaContratacao(),
                c.getRazaoSocial(),
                c.getCnpjContratada(),
                c.getRazaoSocialIntermediaria(),
                c.getCnpjIntermediaria(),
                c.getPagamentoAntecipado(),
                c.getFonteRecursos(),
                c.getValorTransporte(),
                c.getValorProporcional(),
                c.getRecursosProprios(),
                c.getRecursosEstaduais(),
                c.getRecursosFederais(),
                c.getRecursosOutros(),
                c.getStatusAuditor(),
                c.getLinkContrato(),
                c.getLinkProposta(),
                c.getUrlTce(),
                c.getUrlPncp(),
                c.getUrlTransparencia()
        );
    }

    private static String normalizarCategoria(String cat) {
        if (cat == null) return "outros";
        String s = slugify(cat).replace("-", "");
        if (s.startsWith("atrac")) return "atracoes";
        if (s.startsWith("organiz")) return "organizacao";
        if (s.startsWith("outorg")) return "outorga";
        return s;
    }

    static String slugify(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private static String soData(LocalDateTime d) { return d == null ? null : d.toLocalDate().toString(); }
    private static double nz(Double v) { return v == null ? 0 : v; }

    private static String firstNonBlank(String... vals) {
        for (String v : vals) if (v != null && !v.isBlank()) return v;
        return null;
    }
}