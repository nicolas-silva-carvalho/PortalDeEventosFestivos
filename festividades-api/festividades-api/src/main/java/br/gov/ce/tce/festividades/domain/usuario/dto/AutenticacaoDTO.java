package br.gov.ce.tce.festividades.domain.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AutenticacaoDTO {

    public record Requisicao(
            @NotBlank(message = "O e-mail é obrigatório")
            @Email(message = "Formato de e-mail inválido")
            String email,

            @NotBlank(message = "A senha é obrigatória")
            @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
            String senha
    ) {}

    public record Resposta(
            String token,
            String expiraEm,
            String nome
    ) {}
}