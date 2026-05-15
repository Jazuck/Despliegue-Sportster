package es.sportster.Sportster.DTOS.marca;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegistroMarcaCreateRequest(
        @NotNull(message = "La modalidad es obligatoria")
        Integer modalidadId,

        @NotNull(message = "El valor es obligatorio")
        @Positive(message = "El valor debe ser positivo")
        Double valor
) {}