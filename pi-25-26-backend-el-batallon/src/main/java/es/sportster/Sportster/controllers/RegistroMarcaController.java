package es.sportster.Sportster.controllers;

import es.sportster.Sportster.DTOS.marca.RegistroMarcaCreateRequest;
import es.sportster.Sportster.DTOS.marca.RegistroMarcaResponse;
import es.sportster.Sportster.services.RegistroMarcaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1")
public class RegistroMarcaController {

    @Autowired
    private RegistroMarcaService registroMarcaService;

    @PreAuthorize("permitAll()")
    @GetMapping("/marcas/ranking")
    public ResponseEntity<?> obtenerRanking(@RequestParam Integer modalidadId) {
        try {
            return ResponseEntity.ok(
                    registroMarcaService.obtenerRankingsPorModalidad(modalidadId)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/marcas")
    public ResponseEntity<?> crearRegistro(
            @Valid @RequestBody RegistroMarcaCreateRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        RegistroMarcaResponse response = registroMarcaService
                .registrarMarca(request, userDetails.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/marcas/{id}")
    public ResponseEntity<?> eliminarRegistro(@PathVariable Integer id, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            registroMarcaService.eliminarMarca(id, userDetails.getUsername());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}