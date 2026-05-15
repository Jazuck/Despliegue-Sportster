package es.sportster.Sportster.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Normaliza URLs JDBC de Postgres (Render, etc.): {@code postgresql://}, falta de {@code //} en {@code jdbc:postgresql:},
 * separa credenciales embebidas en la URL y fuerza {@code sslmode=require} fuera de localhost (Render).
 * <p>
 * Lee {@code SPRING_DATASOURCE_URL} explícitamente: en algunos arranques {@code spring.datasource.url} aún
 * refleja el default de {@code application.properties} antes de enlazar bien el entorno.
 */
public class PostgresqlJdbcUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String ENV_URL = "SPRING_DATASOURCE_URL";
    private static final String KEY_URL = "spring.datasource.url";
    private static final String KEY_USER = "spring.datasource.username";
    private static final String KEY_PASS = "spring.datasource.password";
    private static final String PS_NAME = "sportster-postgresql-datasource-fix";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = resolveRawJdbcOrPostgresUrl(environment);
        if (!StringUtils.hasText(raw)) {
            return;
        }
        String trimmed = raw.trim();
        String jdbc = normalizeJdbcUrl(trimmed);

        EmbeddedCredentials embedded = extractEmbeddedCredentials(jdbc);
        Map<String, Object> map = new LinkedHashMap<>();
        if (embedded != null) {
            String url = ensureSslModeForRemotePostgres(embedded.urlWithoutUserInfo());
            map.put(KEY_URL, url);
            map.put(KEY_USER, embedded.username());
            map.put(KEY_PASS, embedded.password());
        } else {
            String url = ensureSslModeForRemotePostgres(jdbc);
            if (!url.equals(trimmed)) {
                map.put(KEY_URL, url);
            }
        }
        if (!map.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PS_NAME, map));
        }
    }

    /**
     * Prioriza la variable de entorno que Render inyecta en el runtime Docker.
     */
    static String resolveRawJdbcOrPostgresUrl(ConfigurableEnvironment environment) {
        String v = environment.getProperty(ENV_URL);
        if (StringUtils.hasText(v)) {
            return v.trim();
        }
        v = environment.getProperty(KEY_URL);
        return StringUtils.hasText(v) ? v.trim() : null;
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
     * Postgres gestionado (Render, etc.) suele exigir TLS; en local no añadimos parámetros.
     */
    static String ensureSslModeForRemotePostgres(String jdbcUrlWithoutUser) {
        if (jdbcUrlWithoutUser == null || !StringUtils.hasText(jdbcUrlWithoutUser)) {
            return jdbcUrlWithoutUser;
        }
        String lower = jdbcUrlWithoutUser.toLowerCase();
        if (!lower.startsWith("jdbc:postgresql://")) {
            return jdbcUrlWithoutUser;
        }
        if (lower.contains("localhost") || lower.contains("127.0.0.1")) {
            return jdbcUrlWithoutUser;
        }
        if (lower.contains("sslmode=")) {
            return jdbcUrlWithoutUser;
        }
        int q = jdbcUrlWithoutUser.indexOf('?');
        if (q < 0) {
            return jdbcUrlWithoutUser + "?sslmode=require";
        }
        String base = jdbcUrlWithoutUser.substring(0, q);
        String query = jdbcUrlWithoutUser.substring(q + 1);
        if (query.endsWith("&")) {
            return base + "?" + query + "sslmode=require";
        }
        if (query.isEmpty()) {
            return base + "?sslmode=require";
        }
        return base + "?" + query + "&sslmode=require";
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

    record EmbeddedCredentials(String urlWithoutUserInfo, String username, String password) {}
}
