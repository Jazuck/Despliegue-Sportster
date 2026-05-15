package es.sportster.Sportster.interfaces;

import es.sportster.Sportster.DTOS.admin.AdminUserListItemResponse;

import java.util.List;

public interface IAdminUserService {

    List<AdminUserListItemResponse> listarUsuarios();

    /**
     * Elimina un usuario por id. No permite que el administrador borre su propia cuenta.
     */
    void eliminarUsuario(Integer idUsuario, String emailAdministradorActual);
}
