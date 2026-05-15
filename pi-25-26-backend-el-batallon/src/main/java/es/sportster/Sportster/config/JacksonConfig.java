package es.sportster.Sportster.config;

import com.fasterxml.jackson.core.StreamReadConstraints;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * Las imágenes en base64 (data URL) superan el límite por defecto de Jackson 2.15+ (~20 MB)
     * en algunos entornos; subimos el techo para no truncar ni fallar al deserializar el POST.
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer largeJsonStringValues() {
        return builder -> builder.postConfigurer(om ->
                om.getFactory().setStreamReadConstraints(
                        StreamReadConstraints.builder()
                                .maxStringLength(50_000_000)
                                .build()
                )
        );
    }
}
