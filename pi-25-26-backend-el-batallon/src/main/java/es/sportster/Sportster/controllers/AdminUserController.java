package es.sportster.Sportster.controllers;

import es.sportster.Sportster.DTOS.admin.AdminUserListItemResponse;
import es.sportster.Sportster.interfaces.IAdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Operaciones de administración sobre usuarios (listado y baja).
 * La creación de cuentas sigue en {@code /api/v1/auth/register}.
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final IAdminUserService adminUserService;

    public AdminUserController(IAdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserListItemResponse>> listar() {
        return ResponseEntity.ok(adminUserService.listarUsuarios());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        adminUserService.eliminarUsuario(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
