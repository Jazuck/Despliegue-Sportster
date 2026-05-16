package es.sportster.Sportster.controllers;

import es.sportster.Sportster.DTOS.user.ProfileResponse;
import es.sportster.Sportster.interfaces.IRegistroMarcaService;
import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/perfil")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IRegistroMarcaService registroMarcaService;

    @GetMapping
    public ResponseEntity<ProfileResponse> obtenerPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername().trim())
                .orElseGet(() -> userRepository.findByEmail(userDetails.getUsername()));
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getRoleName)
                .sorted()
                .toList();

        ProfileResponse response = new ProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                registroMarcaService.obtenerMejoresMarcasUsuario(user.getEmail()),
                roleNames
        );

        return ResponseEntity.ok(response);
    }
    @org.springframework.web.bind.annotation.DeleteMapping
    public ResponseEntity<?> eliminarCuenta(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername().trim())
                .orElseGet(() -> userRepository.findByEmail(userDetails.getUsername()));
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
