package es.sportster.Sportster.services;

import es.sportster.Sportster.DTOS.auth.LoginCreateRequest;
import es.sportster.Sportster.DTOS.auth.LoginResponse;
import es.sportster.Sportster.DTOS.auth.RegisterCreateRequest;
import es.sportster.Sportster.interfaces.IAuthService;
import es.sportster.Sportster.mappers.AuthMapper;
import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.RoleRepository;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService implements IAuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    @Override
    public void register(RegisterCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El email ya está registrado.");
        }

        User user = AuthMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));

        Role basicRole = roleRepository.findByRoleName("ROLE_USER");
        user.getRoles().add(basicRole);

        userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginCreateRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseGet(() -> userRepository.findByEmail(request.email()));
        if (user == null) throw new UsernameNotFoundException("Usuario no encontrado");

        if (!passwordEncoder.matches(request.password(), user.getPassword()))
            throw new IllegalArgumentException("Contraseña incorrecta");

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .authorities(user.getRoles().stream()
                                .map(Role::getRoleName)
                                .toArray(String[]::new))
                        .build()
        );

        return new LoginResponse(token);
    }
}
