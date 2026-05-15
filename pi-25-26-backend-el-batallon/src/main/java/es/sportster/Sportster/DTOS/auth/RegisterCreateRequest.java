package es.sportster.Sportster.DTOS.auth;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public record RegisterCreateRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Formato de email no válido")
        String email,

        @Pattern(regexp = "^[+]?[0-9]{9,15}$", message = "Teléfono no válido")
        String phone,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, message = "Mínimo 6 caracteres")
        String password,

        @NotBlank(message = "Confirma la contraseña")
        String confirmPassword
) {}
