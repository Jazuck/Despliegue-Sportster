package es.sportster.Sportster.seeders;

import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.RoleRepository;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserRoleSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Crear roles si no existen
        Role userRole  = createRoleIfNotExists("ROLE_USER");
        Role adminRole = createRoleIfNotExists("ROLE_ADMIN");

        // Crear usuario admin por defecto si no existe
        createUserIfNotExists("admin@sportster.com", "Admin Sportster", "666000001", adminRole);
        createUserIfNotExists("user@sportster.com",  "User Sportster",  "666000002", userRole);
        createUserIfNotExists("jorge@sportster.com",  "Jorge",  "666000002", userRole);
        createUserIfNotExists("ale@sportster.com",  "Ale",  "666000002", userRole);
        createUserIfNotExists("carla@sportster.com",  "Carla",  "666000002", userRole);
        createUserIfNotExists("user2@sportster.com",  "User2 Sportster",  "666000002", userRole);
        createUserIfNotExists("user3@sportster.com",  "User3 Sportster",  "666000002", userRole);

    }

    private Role createRoleIfNotExists(String roleName) {
        Role role = roleRepository.findByRoleName(roleName);
        if (role == null) {
            role = roleRepository.save(new Role(roleName));
        }
        return role;
    }

    private void createUserIfNotExists(String email, String name, String phone, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .name(name)
                    .phone(phone)
                    .password(passwordEncoder.encode("123456"))
                    .build();
            user.getRoles().add(role);
            userRepository.save(user);
        }
    }
}
