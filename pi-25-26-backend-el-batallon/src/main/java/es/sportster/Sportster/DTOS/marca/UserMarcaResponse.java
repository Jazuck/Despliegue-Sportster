package es.sportster.Sportster.DTOS.marca;

import java.time.LocalDateTime;

public record UserMarcaResponse(
        Integer id,
        String deporte,
        String modalidad,
        String valor,
        LocalDateTime fecha
) {}
