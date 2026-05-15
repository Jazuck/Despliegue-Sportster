package es.sportster.Sportster.DTOS.modalidad;

public record ModalidadResponse(
        Integer idModalidad,
        String nombre,
        String unidad,
        Integer idDeporte,
        String nombreDeporte
){
}
