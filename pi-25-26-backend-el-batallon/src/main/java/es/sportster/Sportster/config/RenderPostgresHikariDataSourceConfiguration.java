package es.sportster.Sportster.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;

/**
 * En Render, {@code SPRING_DATASOURCE_URL} suele ser {@code postgresql://…}; el driver JDBC solo acepta
 * {@code jdbc:postgresql://…}. El {@link org.springframework.boot.env.EnvironmentPostProcessor} no siempre
 * participa en el {@code Binder} que rellena {@code DataSourceProperties}, y Hikari acaba con la URL libpq.
 * Este bean fija Hikari directamente a partir del entorno.
 */
@Configuration(proxyBeanMethods = false)
@Profile("render")
@AutoConfigureBefore(DataSourceAutoConfiguration.class)
public class RenderPostgresHikariDataSourceConfiguration {

    @Bean
    @Primary
    public DataSource renderDataSource() {
        String raw = PostgresqlJdbcUrlEnvironmentPostProcessor.firstNonBlank(
                trimToNull(System.getenv("SPRING_DATASOURCE_URL")),
                trimToNull(System.getenv("DATABASE_URL")));
        if (!StringUtils.hasText(raw)) {
            throw new IllegalStateException(
                    "Render: falta SPRING_DATASOURCE_URL o DATABASE_URL con la cadena postgresql://… del panel de Postgres.");
        }
        String trimmed = raw.trim();
        String jdbc = PostgresqlJdbcUrlEnvironmentPostProcessor.repairInvalidPostgresSslmodeParameter(
                PostgresqlJdbcUrlEnvironmentPostProcessor.normalizeJdbcUrl(trimmed));
        PostgresqlJdbcUrlEnvironmentPostProcessor.assertRenderPostgresJdbcUrl(jdbc);

        PostgresqlJdbcUrlEnvironmentPostProcessor.EmbeddedCredentials embedded =
                PostgresqlJdbcUrlEnvironmentPostProcessor.extractEmbeddedCredentials(jdbc);
        HikariConfig cfg = new HikariConfig();
        cfg.setDriverClassName("org.postgresql.Driver");
        cfg.setMaximumPoolSize(8);
        if (embedded != null) {
            String url = PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRenderPublicHost(
                    embedded.urlWithoutUserInfo());
            cfg.setJdbcUrl(url);
            cfg.setUsername(embedded.username());
            cfg.setPassword(embedded.password());
        } else {
            cfg.setJdbcUrl(PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRenderPublicHost(jdbc));
        }
        return new HikariDataSource(cfg);
    }

    private static String trimToNull(String s) {
        return StringUtils.hasText(s) ? s.trim() : null;
    }
}
