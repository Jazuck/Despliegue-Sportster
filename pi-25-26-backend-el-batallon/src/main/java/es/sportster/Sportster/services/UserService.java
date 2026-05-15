package es.sportster.Sportster.services;

import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException("Usuario no encontrado");
        }
        String t = email.trim();
        User user = userRepository.findByEmailIgnoreCase(t)
                .orElseGet(() -> userRepository.findByEmail(t));
        if (user == null) throw new UsernameNotFoundException("Usuario no encontrado");
        String[] authorities = user.getRoles().stream()
                .map(Role::getRoleName)
                .toArray(String[]::new);
        // Cuentas sin filas en user_role: evita Access Denied en @PreAuthorize(hasAuthority) del panel admin
        if (authorities.length == 0) {
            authorities = new String[]{"ROLE_USER"};
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .build();
    }
}
