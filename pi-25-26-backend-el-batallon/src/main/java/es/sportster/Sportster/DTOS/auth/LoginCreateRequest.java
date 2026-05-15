package es.sportster.Sportster.DTOS.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LoginCreateRequest(

        @NotNull(message = "El email no puede ser nulo.")
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Formato de email no válido")
        String email,

        @NotNull(message = "La contraseña no puede ser nula.")
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min=6, message = "La contraseña debe tener mínimo 6 caracteres.")
        String password

) {
}
