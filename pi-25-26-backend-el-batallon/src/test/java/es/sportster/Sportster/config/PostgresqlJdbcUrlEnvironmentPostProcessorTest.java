package es.sportster.Sportster.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PostgresqlJdbcUrlEnvironmentPostProcessorTest {

    @Test
    void ensureSslMode_appendsForRemoteHost() {
        String in = "jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRemotePostgres(in))
                .isEqualTo("jdbc:postgresql://dpg-abc.oregon-postgres.render.com:5432/sportster?sslmode=require");
    }

    @Test
    void ensureSslMode_skipsLocalhost() {
        String in = "jdbc:postgresql://localhost:5432/sportster";
        assertThat(PostgresqlJdbcUrlEnvironmentPostProcessor.ensureSslModeForRemotePostgres(in)).isEqualTo(in);
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
}
