package es.sportster.Sportster.services;

import es.sportster.Sportster.DTOS.admin.AdminUserListItemResponse;
import es.sportster.Sportster.interfaces.IAdminUserService;
import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminUserService implements IAdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<AdminUserListItemResponse> listarUsuarios() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toListItem)
                .toList();
    }

    @Override
    public void eliminarUsuario(Integer idUsuario, String emailAdministradorActual) {
        User target = userRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (target.getEmail().equalsIgnoreCase(emailAdministradorActual)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No puedes eliminar tu propia cuenta desde el panel"
            );
        }

        userRepository.delete(target);
    }

    private AdminUserListItemResponse toListItem(User u) {
        List<String> roles = u.getRoles().stream()
                .map(Role::getRoleName)
                .sorted()
                .toList();
        return new AdminUserListItemResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getPhone(),
                roles,
                u.getCreatedAt()
        );
    }
}
