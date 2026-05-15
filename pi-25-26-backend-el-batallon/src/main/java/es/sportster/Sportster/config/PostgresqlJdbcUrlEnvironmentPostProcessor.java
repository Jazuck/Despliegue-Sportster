package es.sportster.Sportster.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Normaliza URLs JDBC de Postgres (Render, etc.): {@code postgresql://}, falta de {@code //} en {@code jdbc:postgresql:},
 * y separa {@code usuario:contraseña} embebidos en la URL hacia {@code spring.datasource.username/password}
 * (Spring no debe quedar con usuario por defecto {@code postgres} chocando con la URL).
 */
public class PostgresqlJdbcUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String KEY_URL = "spring.datasource.url";
    private static final String KEY_USER = "spring.datasource.username";
    private static final String KEY_PASS = "spring.datasource.password";
    private static final String PS_NAME = "sportster-postgresql-datasource-fix";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty(KEY_URL);
        if (raw == null) {
            return;
        }
        String trimmed = raw.trim();
        String jdbc = normalizeJdbcUrl(trimmed);

        EmbeddedCredentials embedded = extractEmbeddedCredentials(jdbc);
        Map<String, Object> map = new LinkedHashMap<>();
        if (embedded != null) {
            map.put(KEY_URL, embedded.urlWithoutUserInfo());
            map.put(KEY_USER, embedded.username());
            map.put(KEY_PASS, embedded.password());
        } else if (!jdbc.equals(trimmed)) {
            map.put(KEY_URL, jdbc);
        }
        if (!map.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PS_NAME, map));
        }
    }

    static String normalizeJdbcUrl(String url) {
        if (url.startsWith("postgres://")) {
            return "jdbc:postgresql://" + url.substring("postgres://".length());
        }
        if (url.startsWith("postgresql://")) {
            return "jdbc:postgresql://" + url.substring("postgresql://".length());
        }
        if (url.startsWith("jdbc:postgresql:") && !url.startsWith("jdbc:postgresql://")) {
            return "jdbc:postgresql://" + url.substring("jdbc:postgresql:".length());
        }
        return url;
    }

    /**
     * {@code jdbc:postgresql://user:pass@host:5432/db?x=y} → URL sin userinfo + credenciales.
     */
    static EmbeddedCredentials extractEmbeddedCredentials(String jdbcUrl) {
        final String prefix = "jdbc:postgresql://";
        if (jdbcUrl == null || !jdbcUrl.startsWith(prefix)) {
            return null;
        }
        String remainder = jdbcUrl.substring(prefix.length());
        int at = remainder.indexOf('@');
        if (at <= 0) {
            return null;
        }
        String userInfo = remainder.substring(0, at);
        String hostAndPath = remainder.substring(at + 1);
        if (userInfo.isEmpty() || hostAndPath.isEmpty()) {
            return null;
        }
        String user;
        String password = "";
        int colon = userInfo.indexOf(':');
        if (colon >= 0) {
            user = urlDecode(userInfo.substring(0, colon));
            password = urlDecode(userInfo.substring(colon + 1));
        } else {
            user = urlDecode(userInfo);
        }
        return new EmbeddedCredentials(prefix + hostAndPath, user, password);
    }

    private static String urlDecode(String segment) {
        return URLDecoder.decode(segment, StandardCharsets.UTF_8);
    }

    private record EmbeddedCredentials(String urlWithoutUserInfo, String username, String password) {}
}
