package es.sportster.Sportster.mappers;

import es.sportster.Sportster.DTOS.modalidad.ModalidadCreateRequest;
import es.sportster.Sportster.DTOS.modalidad.ModalidadResponse;
import es.sportster.Sportster.DTOS.modalidad.ModalidadUpdateRequest;
import es.sportster.Sportster.models.Deporte;
import es.sportster.Sportster.models.Modalidad;

public class ModalidadMapper {

    // Entity → Response
    public static ModalidadResponse toModalidadResponse(Modalidad modalidad) {
        if (modalidad == null) return null;

        return new ModalidadResponse(
                modalidad.getIdModalidad(),
                modalidad.getNombre(),
                modalidad.getUnidad(),
                modalidad.getDeporte().getIdDeporte(),
                modalidad.getDeporte().getNombre()
        );
    }

    // CreateRequest → Entity
    public static Modalidad toModalidad(
            ModalidadCreateRequest request,
            Deporte deporte
    ) {
        Modalidad modalidad = new Modalidad(
                request.nombre().trim(),
                request.unidad().trim()
        );
        modalidad.setDeporte(deporte); // asignar deporte directamente
        return modalidad;
    }

    // UpdateRequest → actualizar Entity
    public static void updateModalidadFromDTO(
            ModalidadUpdateRequest request,
            Modalidad modalidad
    ) {
        modalidad.setNombre(request.nombre().trim());
        modalidad.setUnidad(request.unidad().trim());
    }
}
