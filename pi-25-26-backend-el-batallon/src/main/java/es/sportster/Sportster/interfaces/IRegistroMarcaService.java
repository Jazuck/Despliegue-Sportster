package es.sportster.Sportster.interfaces;

import es.sportster.Sportster.DTOS.marca.RegistroMarcaCreateRequest;
import es.sportster.Sportster.DTOS.marca.RegistroMarcaResponse;
import es.sportster.Sportster.DTOS.marca.UserMarcaResponse;

import java.util.List;

public interface IRegistroMarcaService {

    List<RegistroMarcaResponse> obtenerRankingsPorModalidad(Integer idModalidad);
    RegistroMarcaResponse registrarMarca(RegistroMarcaCreateRequest request, String email);
    List<UserMarcaResponse> obtenerMejoresMarcasUsuario(String email);
    void eliminarMarca(Integer id, String email);
}
