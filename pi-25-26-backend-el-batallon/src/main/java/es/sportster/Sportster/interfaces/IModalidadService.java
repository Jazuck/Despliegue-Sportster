package es.sportster.Sportster.interfaces;

import es.sportster.Sportster.DTOS.modalidad.ModalidadCreateRequest;
import es.sportster.Sportster.DTOS.modalidad.ModalidadResponse;
import es.sportster.Sportster.DTOS.modalidad.ModalidadUpdateRequest;
import java.util.List;

public interface IModalidadService {

    List<ModalidadResponse> listarModalidades();
    ModalidadResponse obtenerModalidadPorId(Integer id);
    ModalidadResponse crearModalidad(ModalidadCreateRequest request);
    ModalidadResponse actualizarModalidad(Integer id, ModalidadUpdateRequest request);
    void eliminarModalidad(Integer id);
    List<ModalidadResponse> listarModalidadPorDeporte(Integer idDeporte, boolean incluirOcultos);
}