package es.sportster.Sportster.mappers;

import es.sportster.Sportster.DTOS.deporte.DeporteCreateRequest;
import es.sportster.Sportster.DTOS.deporte.DeporteResponse;
import es.sportster.Sportster.DTOS.deporte.DeporteUpdateRequest;
import es.sportster.Sportster.models.Deporte;

public class DeporteMapper {

    public static DeporteResponse toDeporteResponse(Deporte deporte) {
        if (deporte == null) return null;

        return new DeporteResponse(
                deporte.getIdDeporte(),
                deporte.getNombre(),
                deporte.getImagenUrl(),
                deporte.isVisible()
        );
    }

    public static Deporte toDeporte(DeporteCreateRequest request) {
        Deporte deporte = new Deporte(request.nombre().trim());
        if (request.imagenUrl() != null && !request.imagenUrl().isBlank()) {
            deporte.setImagenUrl(request.imagenUrl().trim());
        } else {
            deporte.setImagenUrl(null);
        }
        return deporte;
    }

    public static void updateDeporteFromDTO(
            DeporteUpdateRequest request,
            Deporte deporte
    ) {
        deporte.setNombre(request.nombre().trim());
        if (request.imagenUrl() != null) {
            String trimmed = request.imagenUrl().trim();
            deporte.setImagenUrl(trimmed.isEmpty() ? null : trimmed);
        }
        if (request.visible() != null) {
            deporte.setVisible(Boolean.TRUE.equals(request.visible()));
        }
    }
}
