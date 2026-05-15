package es.sportster.Sportster.controllers;

import es.sportster.Sportster.DTOS.auth.LoginCreateRequest;
import es.sportster.Sportster.DTOS.auth.RegisterCreateRequest;
import es.sportster.Sportster.interfaces.IAuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    @Autowired
    private IAuthService authService;

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterCreateRequest request,
            BindingResult bindingResult) {

        // Errores de validación → 400 con mensajes
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        // Errores de negocio (nickName o email duplicado) → 400
        try {
            authService.register(request);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

        //return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.ok().build();
    }


    @PostMapping("/auth/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginCreateRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    bindingResult.getFieldErrors().stream()
                            .map(e -> e.getField() + ": " + e.getDefaultMessage())
                            .toList()
            );
        }

        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales incorrectas.");
        }
    }
}
