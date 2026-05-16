package es.sportster.Sportster.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Raíz pública para comprobar que el servicio está arriba (p. ej. en Render).
 * El API real está bajo {@code /api/v1/...}.
 */
@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "status", "ok",
                "service", "Sportster API",
                "deportes", "/api/v1/deportes",
                "interfazWeb", "Es otro servicio en Render (Node, carpeta pi-25-26-frontend-el-batallon). Ver render.yaml."
        );
    }
}
