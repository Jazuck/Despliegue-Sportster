package es.sportster.Sportster.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class PostgresqlJdbcUrlEnvironmentPostProcessorTest {

    @Test
    void ensureSsl_appendsForRenderPublicHostname() {
        String in = "jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRenderPublicHost(in))
                .isEqualTo("jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster?sslmode=require");
    }

    @Test
    void ensureSsl_skipsInternalStyleHost() {
        String in = "jdbc:postgresql://user:secret@dpg-abc123-a:5432/sportster";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRenderPublicHost(in)).isEqualTo(in);
    }

    @Test
    void ensureSsl_skipsLocalhost() {
        String in = "jdbc:postgresql://localhost:5432/sportster";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRenderPublicHost(in)).isEqualTo(in);
    }

    @Test
    void extractHost_stripsUserInfo() {
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.extractHostFromJdbcPostgresql(
                "jdbc:postgresql://u:p@dpg-x.oregon-postgres.render.com:5432/sportster?x=1"))
                .isEqualTo("dpg-x.oregon-postgres.render.com:5432");
    }

    @Test
    void extractEmbeddedCredentials_splitsUserPassword() {
        var in = "jdbc:postgresql://u:p%40x@host:5432/db";
        var c = PostgresqlJdbcUrlEnvironmentPostProcessor.extractEmbeddedCredentials(in);
        assertThat(c).isNotNull();
        assertThat(c.urlWithoutUserInfo()).isEqualTo("jdbc:postgresql://host:5432/db");
        assertThat(c.username()).isEqualTo("u");
        assertThat(c.password()).isEqualTo("p@x");
    }

    @Test
    void resolveRaw_prefersSpringDatasourceUrl() {
        var env = new MockEnvironment();
        env.setProperty("DATABASE_URL", "postgresql://x:y@db/legacy");
        env.setProperty("SPRING_DATASOURCE_URL", "postgresql://a:b@db/app");
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.resolveRawJdbcOrPostgresUrl(env))
                .isEqualTo("postgresql://a:b@db/app");
    }

    @Test
    void resolveRaw_ignoresUnresolvedPlaceholderInSpringDatasourceUrl() {
        var env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "${MISSING:}");
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.resolveRawJdbcOrPostgresUrl(env)).isNull();
    }

    @Test
    void firstNonBlank_prefersFirst() {
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.firstNonBlank(" a ", null)).isEqualTo("a");
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.firstNonBlank(null, " b ")).isEqualTo("b");
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.firstNonBlank("", "  ")).isNull();
    }

    @Test
    void looksLikeLocalDatasource_detectsLoopback() {
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.looksLikeLocalDatasource(
                "jdbc:postgresql://localhost:5432/sportster")).isTrue();
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.looksLikeLocalDatasource(
                "jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster")).isFalse();
    }

    @Test
    void hasExplicitSpringOrDatabaseUrl_trueWhenSpringSet() {
        var env = new MockEnvironment();
        env.setProperty("SPRING_DATASOURCE_URL", "postgresql://a:b@h/db");
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.hasExplicitSpringOrDatabaseUrl(env)).isTrue();
    }

    @Test
    void repairInvalidSslmode_fixesGluedDuplicateUrlTail() {
        String in = "jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster?sslmode=requirexxx.render.com/sportster?sslmode=require";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.repairInvalidPostgresSslmodeParameter(in))
                .isEqualTo("jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster?sslmode=require");
    }

    @Test
    void hasValidPostgresSslmodeParameter_trueWhenRequire() {
        String u = "jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster?sslmode=require";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.hasValidPostgresSslmodeParameter(u)).isTrue();
    }
}
