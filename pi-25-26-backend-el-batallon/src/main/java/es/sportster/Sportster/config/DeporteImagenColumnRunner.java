package es.sportster.Sportster.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Si la tabla se creó antes con VARCHAR corto para imagen_url, el data URL se trunca y la imagen "no se aplica".
 * En MySQL fuerza LONGTEXT; en otras BD se ignora el fallo.
 */
@Component
@Order(2000)
public class DeporteImagenColumnRunner implements ApplicationRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public DeporteImagenColumnRunner(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try (Connection c = dataSource.getConnection()) {
            String url = c.getMetaData().getURL();
            if (url == null || !url.toLowerCase().contains("mysql")) {
                return;
            }
            jdbcTemplate.execute("ALTER TABLE deportes MODIFY COLUMN imagen_url LONGTEXT NULL");
        } catch (Exception ignored) {
            // Tabla inexistente aún, permisos, o columna ya correcta
        }
    }
}
