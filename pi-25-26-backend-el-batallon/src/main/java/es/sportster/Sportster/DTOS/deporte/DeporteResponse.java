package es.sportster.Sportster.DTOS.deporte;

public record DeporteResponse(
        Integer idDeporte,
        String nombre,
        String imagenUrl,
        boolean visible
) {
}
