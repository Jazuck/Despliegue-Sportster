package es.sportster.Sportster.services;

import es.sportster.Sportster.DTOS.deporte.DeporteCreateRequest;
import es.sportster.Sportster.DTOS.deporte.DeporteModalidadInicialRequest;
import es.sportster.Sportster.DTOS.deporte.DeporteResponse;
import es.sportster.Sportster.DTOS.deporte.DeporteUpdateRequest;
import es.sportster.Sportster.interfaces.IDeporteService;
import es.sportster.Sportster.mappers.DeporteMapper;
import es.sportster.Sportster.models.Deporte;
import es.sportster.Sportster.models.Modalidad;
import es.sportster.Sportster.repositories.DeporteRepository;
import es.sportster.Sportster.repositories.RegistroMarcaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeporteService implements IDeporteService {

    @Autowired
    private DeporteRepository deporteRepository;

    @Autowired
    private RegistroMarcaRepository registroMarcaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DeporteResponse> listarDeportes(boolean incluirOcultos) {
        List<Deporte> lista = incluirOcultos
                ? deporteRepository.findAll()
                : deporteRepository.findByVisibleTrue();
        return lista.stream()
                .map(DeporteMapper::toDeporteResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DeporteResponse obtenerDeportePorId(Integer id, boolean incluirOcultos) {
        Deporte deporte = deporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deporte no encontrado"));
        if (!incluirOcultos && !deporte.isVisible()) {
            throw new RuntimeException("Deporte no encontrado");
        }
        return DeporteMapper.toDeporteResponse(deporte);
    }

    @Override
    @Transactional
    public DeporteResponse crearDeporte(DeporteCreateRequest request) {

        if (deporteRepository.existsByNombre(request.nombre().trim())) {
            throw new RuntimeException("Ya existe un deporte con ese nombre");
        }

        Deporte deporte = DeporteMapper.toDeporte(request);
        deporte.setVisible(false);

        List<Modalidad> modalidades = new ArrayList<>();
        if (request.modalidadesIniciales() != null) {
            for (DeporteModalidadInicialRequest item : request.modalidadesIniciales()) {
                Modalidad m = new Modalidad(item.nombre().trim(), item.unidad().trim());
                m.setDeporte(deporte);
                modalidades.add(m);
            }
        }
        deporte.setModalidades(modalidades);

        return DeporteMapper.toDeporteResponse(deporteRepository.saveAndFlush(deporte));
    }

    @Override
    @Transactional
    public DeporteResponse actualizarDeporte(Integer id, DeporteUpdateRequest request) {

        Deporte deporte = deporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deporte no encontrado"));

        if (!deporte.getNombre().equalsIgnoreCase(request.nombre().trim())
                && deporteRepository.existsByNombre(request.nombre().trim())) {
            throw new RuntimeException("Ya existe un deporte con ese nombre");
        }

        DeporteMapper.updateDeporteFromDTO(request, deporte);
        return DeporteMapper.toDeporteResponse(deporteRepository.save(deporte));
    }

    @Override
    @Transactional
    public void eliminarDeporte(Integer id) {
        if (!deporteRepository.existsById(id))
            throw new RuntimeException("Deporte no encontrado");

        registroMarcaRepository.deleteAllByDeporteId(id);
        deporteRepository.deleteById(id);
    }
}
