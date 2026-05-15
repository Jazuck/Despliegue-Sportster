package es.sportster.Sportster.seeders;


import es.sportster.Sportster.models.Modalidad;
import es.sportster.Sportster.models.RegistroMarca;
import es.sportster.Sportster.models.Role;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.ModalidadRepository;
import es.sportster.Sportster.repositories.RegistroMarcaRepository;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class RegistroMarcaSeeder implements CommandLineRunner {

    @Autowired
    private RegistroMarcaRepository registroMarcaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModalidadRepository modalidadRepository;

    @Override
    public void run(String... args) throws Exception {

        // Evitar duplicados
        if (registroMarcaRepository.count() > 0) {
            return;
        }

        // Usuarios
        User user1 = userRepository.findByEmail("user@sportster.com");
        User user2 = userRepository.findByEmail("jorge@sportster.com");
        User user3 = userRepository.findByEmail("ale@sportster.com");
        User user4 = userRepository.findByEmail("carla@sportster.com");
        User user5 = userRepository.findByEmail("user2@sportster.com");
        User user6 = userRepository.findByEmail("user3@sportster.com");

        if (user1 == null || user2 == null || user3 == null || user4 == null || user5 == null || user6 == null) {
            System.out.println("RegistroMarcaSeeder: faltan usuarios demo; omitiendo marcas.");
            return;
        }

        // ─────────────────────────────────────────────
        // MODALIDADES
        // ─────────────────────────────────────────────
        Modalidad m100  = modalidadRepository.findById(1).orElse(null);
        Modalidad m200 = modalidadRepository.findById(2).orElse(null);
        Modalidad saltoLongitud = modalidadRepository.findById(7).orElse(null);
        Modalidad pressBanca = modalidadRepository.findById(20).orElse(null);


        if (m100 == null || m200 == null ||
                saltoLongitud == null || pressBanca == null) {

            System.out.println("Faltan modalidades");
            return;
        }

        // ─────────────────────────────────────────────
        // 100m LISOS (MENOR = MEJOR)
        // ─────────────────────────────────────────────

        guardar(user1, m100, 10.82);
        guardar(user1, m100, 10.60);
        guardar(user2, m100, 10.45);
        guardar(user2, m100, 10.39);
        guardar(user3, m100, 11.01);
        guardar(user4, m100, 10.71);
        guardar(user5, m100, 10.55);
        guardar(user6, m100, 10.92);

        // ─────────────────────────────────────────────
        // 200m LISOS
        // ─────────────────────────────────────────────

        guardar(user1, m200, 21.30);
        guardar(user2, m200, 20.98);
        guardar(user3, m200, 22.10);
        guardar(user4, m200, 21.45);
        guardar(user5, m200, 21.12);
        guardar(user6, m200, 22.45);

        // ─────────────────────────────────────────────
        // SALTO DE LONGITUD (MAYOR = MEJOR)
        // ─────────────────────────────────────────────

        guardar(user1, saltoLongitud, 7.12);
        guardar(user1, saltoLongitud, 7.30);
        guardar(user2, saltoLongitud, 6.80);
        guardar(user3, saltoLongitud, 7.45);
        guardar(user4, saltoLongitud, 7.01);

        // ─────────────────────────────────────────────
        // PRESS BANCA (MAYOR = MEJOR)
        // ─────────────────────────────────────────────

        guardar(user1, pressBanca, 110.0);
        guardar(user1, pressBanca, 115.0);
        guardar(user2, pressBanca, 85.0);
        guardar(user3, pressBanca, 140.0);
        guardar(user3, pressBanca, 145.0);
        guardar(user4, pressBanca, 120.0);
        guardar(user5, pressBanca, 132.5);
        guardar(user6, pressBanca, 98.0);
    }

    private void guardar(User user, Modalidad modalidad, Double valor) {

        registroMarcaRepository.save(
                RegistroMarca.builder()
                        .user(user)
                        .modalidad(modalidad)
                        .valor(valor)
                        .build()
        );
    }
}