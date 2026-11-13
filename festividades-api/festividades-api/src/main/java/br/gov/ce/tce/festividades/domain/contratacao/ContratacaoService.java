package br.gov.ce.tce.festividades.domain.contratacao;

import br.gov.ce.tce.festividades.domain.contratacao.dto.ContratacaoPublicaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContratacaoService {

    private final ContratacaoRepository repository;

    @Transactional(readOnly = true)
    public List<ContratacaoPublicaDTO> listarTodasPublico() {
        return repository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    private ContratacaoPublicaDTO converterParaDTO(Contratacao c) {
        ContratacaoPublicaDTO dto = new ContratacaoPublicaDTO();

        dto.setId(c.getId());
        dto.setCategoria(c.getCategoria());
        dto.setCarimbo(c.getCarimbo());
        dto.setResponsavelEnvio(c.getResponsavelEnvio());
        dto.setEmailContato(c.getEmailContato());
        dto.setTelefoneContato(c.getTelefoneContato());
        dto.setTematicaEvento(c.getTematicaEvento());
        dto.setNomeEventoOutros(c.getNomeEventoOutros());
        dto.setFornecedorOuArtista(c.getFornecedorOuArtista());
        dto.setCnpjContratada(c.getCnpjContratada());
        dto.setRazaoSocial(c.getRazaoSocial());
        dto.setValor(c.getValor());
        dto.setValorTransporte(c.getValorTransporte());
        dto.setValorProporcional(c.getValorProporcional());
        dto.setDataEvento(c.getDataEvento());
        dto.setHorarioShow(c.getHorarioShow());
        dto.setDuracao(c.getDuracao());
        dto.setObjeto(c.getObjeto());
        dto.setModalidade(c.getModalidade());
        dto.setNumeroProcedimento(c.getNumeroProcedimento());
        dto.setDataContratacao(c.getDataContratacao());
        dto.setFormaContratacao(c.getFormaContratacao());
        dto.setRazaoSocialIntermediaria(c.getRazaoSocialIntermediaria());
        dto.setCnpjIntermediaria(c.getCnpjIntermediaria());
        dto.setPagamentoAntecipado(c.getPagamentoAntecipado());
        dto.setFonteRecursos(c.getFonteRecursos());
        dto.setRecursosProprios(c.getRecursosProprios());
        dto.setRecursosEstaduais(c.getRecursosEstaduais());
        dto.setRecursosFederais(c.getRecursosFederais());
        dto.setRecursosOutros(c.getRecursosOutros());
        dto.setStatusAuditor(c.getStatusAuditor());

        if (c.getMunicipio() != null) {
            dto.setMunicipioId(c.getMunicipio().getId());
            dto.setMunicipioNome(c.getMunicipio().getNome());
        }

        ContratacaoPublicaDTO.LinksDTO links = new ContratacaoPublicaDTO.LinksDTO();
        links.setContrato(c.getLinkContrato());
        links.setProposta(c.getLinkProposta());
        links.setTce(c.getUrlTce());
        links.setPncp(c.getUrlPncp());
        links.setTransparencia(c.getUrlTransparencia());
        dto.setLinks(links);

        return dto;
    }
}