package es.sportster.Sportster.DTOS.admin;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Vista de usuario para el panel de administración (sin datos sensibles).
 */
public record AdminUserListItemResponse(
        Integer id,
        String nombre,
        String email,
        String telefono,
        List<String> roles,
        LocalDateTime fechaRegistro
) {}
