package es.sportster.Sportster.interfaces;

import es.sportster.Sportster.DTOS.deporte.DeporteCreateRequest;
import es.sportster.Sportster.DTOS.deporte.DeporteResponse;
import es.sportster.Sportster.DTOS.deporte.DeporteUpdateRequest;
import java.util.List;

public interface IDeporteService {

    List<DeporteResponse> listarDeportes(boolean incluirOcultos);
    DeporteResponse obtenerDeportePorId(Integer id, boolean incluirOcultos);
    DeporteResponse crearDeporte(DeporteCreateRequest request);
    DeporteResponse actualizarDeporte(Integer id, DeporteUpdateRequest request);
    void eliminarDeporte(Integer id);
}
