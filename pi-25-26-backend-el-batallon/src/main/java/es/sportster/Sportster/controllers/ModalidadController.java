package es.sportster.Sportster.controllers;

import es.sportster.Sportster.DTOS.modalidad.ModalidadCreateRequest;
import es.sportster.Sportster.DTOS.modalidad.ModalidadResponse;
import es.sportster.Sportster.DTOS.modalidad.ModalidadUpdateRequest;
import es.sportster.Sportster.config.SecurityUtil;
import es.sportster.Sportster.interfaces.IModalidadService;
import es.sportster.Sportster.services.ModalidadService;
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
public class ModalidadController {

    @Autowired
    private ModalidadService modalidadService;

    @GetMapping("/modalidades")
    public ResponseEntity<List<ModalidadResponse>> listarTodas() {
        return ResponseEntity.ok(modalidadService.listarModalidades());
    }

    @GetMapping("/modalidades/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(modalidadService.obtenerModalidadPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/modalidades/deporte/{idDeporte}")
    public ResponseEntity<?> listarPorDeporte(
            @PathVariable Integer idDeporte,
            @RequestParam(value = "todos", required = false) Boolean todos,
            Authentication authentication) {
        boolean incluirOcultos = Boolean.TRUE.equals(todos) && SecurityUtil.esAdmin(authentication);
        try {
            return ResponseEntity.ok(modalidadService.listarModalidadPorDeporte(idDeporte, incluirOcultos));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/modalidades")
    public ResponseEntity<?> crear(
            @Valid @RequestBody ModalidadCreateRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        ModalidadResponse response = modalidadService.crearModalidad(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/modalidades/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ModalidadUpdateRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        try {
            modalidadService.actualizarModalidad(id, request);
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/modalidades/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            modalidadService.eliminarModalidad(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

