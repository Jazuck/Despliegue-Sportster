package es.sportster.Sportster.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Normaliza URLs JDBC de Postgres (Render, etc.), separa credenciales en la URL y ajusta SSL solo
 * en hostnames públicos {@code *.render.com}. También fija dialecto y desactiva metadata JDBC en
 * arranque cuando la URL es Postgres remota, para evitar el fallo en cadena de Hibernate si la
 * primera conexión va lenta o el driver no expone metadata a tiempo.
 */
public class PostgresqlJdbcUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String ENV_SPRING_URL = "SPRING_DATASOURCE_URL";
    private static final String ENV_DATABASE_URL = "DATABASE_URL";
    private static final String KEY_URL = "spring.datasource.url";
    private static final String KEY_USER = "spring.datasource.username";
    private static final String KEY_PASS = "spring.datasource.password";
    private static final String PS_NAME = "sportster-postgresql-datasource-fix";

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = resolveRawJdbcOrPostgresUrl(environment);
        if (!StringUtils.hasText(raw)) {
            if (isRenderRuntime()) {
                throw new IllegalStateException(
                        "Render: no hay URL de Postgres. Añade en el servicio web la variable SPRING_DATASOURCE_URL "
                                + "o DATABASE_URL (postgresql://… o jdbc:postgresql://…). Si la BD no está enlazada "
                                + "al servicio (fromDatabase), copia la connection string del panel de Postgres.");
            }
            return;
        }
        if (isRenderRuntime()
                && looksLikeLocalDatasource(raw)
                && !hasExplicitSpringOrDatabaseUrl(environment)) {
            throw new IllegalStateException(
                    "Render: no está definida SPRING_DATASOURCE_URL ni DATABASE_URL, y la URL resuelta apunta a "
                            + "localhost (valor por defecto de application.properties). Enlaza la base de datos al "
                            + "servicio o define una de esas variables con la connection string del panel de Postgres.");
        }
        String trimmed = raw.trim();
        String jdbc = normalizeJdbcUrl(trimmed);

        EmbeddedCredentials embedded = extractEmbeddedCredentials(jdbc);
        Map<String, Object> map = new LinkedHashMap<>();
        if (embedded != null) {
            String url = ensureSslModeForRenderPublicHost(embedded.urlWithoutUserInfo());
            map.put(KEY_URL, url);
            map.put("spring.jpa.properties.jakarta.persistence.jdbc.url", url);
            map.put(KEY_USER, embedded.username());
            map.put(KEY_PASS, embedded.password());
        } else {
            String url = ensureSslModeForRenderPublicHost(jdbc);
            // Siempre fijar URL JDBC canónica si el valor crudo no era jdbc:postgresql://… (p. ej. postgresql://).
            if (!url.equals(trimmed) || !trimmed.startsWith("jdbc:postgresql://")) {
                map.put(KEY_URL, url);
                map.put("spring.jpa.properties.jakarta.persistence.jdbc.url", url);
            }
        }
        if (!map.isEmpty()) {
            if (shouldHardenHibernateForRemotePostgres(map.get(KEY_URL).toString())) {
                map.put("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
                map.put("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", "false");
                map.put("spring.jpa.properties.hibernate.orm.database.major_version", "18");
            }
            environment.getPropertySources().addFirst(new MapPropertySource(PS_NAME, map));
        }
    }

    /** Render inyecta {@code RENDER=true} en runtime. */
    static boolean isRenderRuntime() {
        return "true".equalsIgnoreCase(System.getenv("RENDER"));
    }

    static boolean hasExplicitSpringOrDatabaseUrl(ConfigurableEnvironment environment) {
        return StringUtils.hasText(firstNonBlank(environment.getProperty(ENV_SPRING_URL), getenvTrimmed(ENV_SPRING_URL)))
                || StringUtils.hasText(
                        firstNonBlank(environment.getProperty(ENV_DATABASE_URL), getenvTrimmed(ENV_DATABASE_URL)));
    }

    static boolean looksLikeLocalDatasource(String raw) {
        if (raw == null) {
            return false;
        }
        String lower = raw.toLowerCase();
        return lower.contains("localhost") || lower.contains("127.0.0.1");
    }

    /**
     * Render y otras plataformas suelen exponer {@code DATABASE_URL}; el blueprint usa {@code SPRING_DATASOURCE_URL}.
     */
    static String resolveRawJdbcOrPostgresUrl(ConfigurableEnvironment environment) {
        String v = firstNonBlank(environment.getProperty(ENV_SPRING_URL), getenvTrimmed(ENV_SPRING_URL));
        if (v != null) {
            return v;
        }
        v = firstNonBlank(environment.getProperty(ENV_DATABASE_URL), getenvTrimmed(ENV_DATABASE_URL));
        if (v != null) {
            return v;
        }
        v = environment.getProperty(KEY_URL);
        if (StringUtils.hasText(v)) {
            String t = v.trim();
            if (!t.contains("${")) {
                return t;
            }
        }
        return null;
    }

    static String firstNonBlank(String a, String b) {
        if (StringUtils.hasText(a)) {
            return a.trim();
        }
        if (StringUtils.hasText(b)) {
            return b.trim();
        }
        return null;
    }

    static String getenvTrimmed(String key) {
        String v = System.getenv(key);
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
     * Solo hostnames públicos {@code *.render.com} suelen necesitar {@code sslmode=require} en el cliente.
     * Las URLs internas del blueprint (host tipo {@code dpg-…} sin dominio render) suelen fallar si se fuerza SSL.
     */
    static String ensureSslModeForRenderPublicHost(String jdbcUrlWithoutUser) {
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
        if (!hostContainsRenderPublicDomain(jdbcUrlWithoutUser)) {
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

    static boolean hostContainsRenderPublicDomain(String jdbcUrlWithoutUser) {
        String host = extractHostFromJdbcPostgresql(jdbcUrlWithoutUser);
        return host != null && host.toLowerCase().contains("render.com");
    }

    static boolean shouldHardenHibernateForRemotePostgres(String jdbcUrlWithoutUser) {
        if (jdbcUrlWithoutUser == null || !StringUtils.hasText(jdbcUrlWithoutUser)) {
            return false;
        }
        String lower = jdbcUrlWithoutUser.toLowerCase();
        return lower.startsWith("jdbc:postgresql://")
                && !lower.contains("localhost")
                && !lower.contains("127.0.0.1");
    }

    /** Host:puerto o host sin puerto, sin path ni query. */
    static String extractHostFromJdbcPostgresql(String jdbcUrl) {
        final String prefix = "jdbc:postgresql://";
        if (jdbcUrl == null || !jdbcUrl.startsWith(prefix)) {
            return null;
        }
        String rest = jdbcUrl.substring(prefix.length());
        int at = rest.indexOf('@');
        if (at >= 0) {
            rest = rest.substring(at + 1);
        }
        int slash = rest.indexOf('/');
        int q = rest.indexOf('?');
        int end = rest.length();
        if (slash >= 0) {
            end = Math.min(end, slash);
        }
        if (q >= 0) {
            end = Math.min(end, q);
        }
        return rest.substring(0, end);
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
