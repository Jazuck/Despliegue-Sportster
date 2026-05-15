package es.sportster.Sportster.DTOS.marca;


import java.time.LocalDateTime;


public record RegistroMarcaResponse(
        String userName,
        String email,
        String marca,
        LocalDateTime fecha
) {}