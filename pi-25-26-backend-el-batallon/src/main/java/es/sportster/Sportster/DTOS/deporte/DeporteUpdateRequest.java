package es.sportster.Sportster.DTOS.deporte;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DeporteUpdateRequest(
        @NotBlank(message = "El nombre no puede estar vacío")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @Size(max = 10_000_000, message = "La imagen supera el tamaño máximo permitido")
        String imagenUrl,

        @NotNull(message = "Debe indicarse si el deporte es visible en la web")
        Boolean visible
) {
}
