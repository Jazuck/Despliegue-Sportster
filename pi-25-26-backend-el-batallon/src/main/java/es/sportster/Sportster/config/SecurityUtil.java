package es.sportster.Sportster.config;

import org.springframework.security.core.Authentication;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static boolean esAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
