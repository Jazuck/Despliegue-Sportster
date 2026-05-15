package es.sportster.Sportster.DTOS.deporte;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DeporteCreateRequest(
        @NotBlank(message = "El nombre no puede estar vacío")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        /** Opcional: imágenes desactivadas en el panel; puede ser null. */
        @Size(max = 10_000_000, message = "La imagen supera el tamaño máximo permitido")
        String imagenUrl,

        /** Cascada a la lista y a cada ítem (Bean Validation + binding del JSON). */
        @Valid
        List<@Valid DeporteModalidadInicialRequest> modalidadesIniciales
) {
}
