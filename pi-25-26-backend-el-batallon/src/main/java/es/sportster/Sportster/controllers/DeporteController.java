package es.sportster.Sportster.controllers;

import es.sportster.Sportster.DTOS.deporte.DeporteCreateRequest;
import es.sportster.Sportster.DTOS.deporte.DeporteResponse;
import es.sportster.Sportster.DTOS.deporte.DeporteUpdateRequest;
import es.sportster.Sportster.config.SecurityUtil;
import es.sportster.Sportster.services.DeporteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class DeporteController {

    @Autowired
    private DeporteService deporteService;

    @PreAuthorize("permitAll()")
    @GetMapping("/deportes")
    public ResponseEntity<List<DeporteResponse>> listarTodos(
            @RequestParam(value = "todos", required = false) Boolean todos,
            Authentication authentication) {
        boolean incluirOcultos = Boolean.TRUE.equals(todos) && SecurityUtil.esAdmin(authentication);
        return ResponseEntity.ok(deporteService.listarDeportes(incluirOcultos));
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/deportes/{id}")
    public ResponseEntity<?> obtenerPorId(
            @PathVariable Integer id,
            @RequestParam(value = "todos", required = false) Boolean todos,
            Authentication authentication) {
        boolean incluirOcultos = Boolean.TRUE.equals(todos) && SecurityUtil.esAdmin(authentication);
        try {
            return ResponseEntity.ok(deporteService.obtenerDeportePorId(id, incluirOcultos));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/deportes")
    public ResponseEntity<?> crear(
            @Valid @RequestBody DeporteCreateRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        DeporteResponse response = deporteService.crearDeporte(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/deportes/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody DeporteUpdateRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        try {
            deporteService.actualizarDeporte(id, request);
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/deportes/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            deporteService.eliminarDeporte(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

