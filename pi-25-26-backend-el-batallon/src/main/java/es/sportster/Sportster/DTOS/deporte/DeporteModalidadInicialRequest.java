package es.sportster.Sportster.DTOS.deporte;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeporteModalidadInicialRequest(
        @NotBlank(message = "El nombre de la modalidad no puede estar vacío")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @NotBlank(message = "La unidad no puede estar vacía")
        @Size(max = 20, message = "La unidad no puede superar los 20 caracteres")
        String unidad
) {
}
