package es.sportster.Sportster.DTOS.user;

import es.sportster.Sportster.DTOS.marca.UserMarcaResponse;

import java.util.List;

public record ProfileResponse(
        String nombre,
        String email,
        String telefono,
        List<UserMarcaResponse> mejoresMarcas,
        /** Nombres de rol Spring Security, p. ej. ROLE_USER, ROLE_ADMIN */
        List<String> roles
) {}
