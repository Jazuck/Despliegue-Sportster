package es.sportster.Sportster.services;

import es.sportster.Sportster.DTOS.modalidad.ModalidadCreateRequest;
import es.sportster.Sportster.DTOS.modalidad.ModalidadResponse;
import es.sportster.Sportster.DTOS.modalidad.ModalidadUpdateRequest;
import es.sportster.Sportster.interfaces.IModalidadService;
import es.sportster.Sportster.mappers.ModalidadMapper;
import es.sportster.Sportster.models.Deporte;
import es.sportster.Sportster.models.Modalidad;
import es.sportster.Sportster.repositories.DeporteRepository;
import es.sportster.Sportster.repositories.ModalidadRepository;
import es.sportster.Sportster.repositories.RegistroMarcaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ModalidadService implements IModalidadService {

    @Autowired
    private ModalidadRepository modalidadRepository;

    @Autowired
    private DeporteRepository deporteRepository;

    @Autowired
    private RegistroMarcaRepository registroMarcaRepository;

    @Override
    public List<ModalidadResponse> listarModalidades() {
        return modalidadRepository.findAll()
                .stream()
                .map(ModalidadMapper::toModalidadResponse)
                .toList();
    }

    @Override
    public ModalidadResponse obtenerModalidadPorId(Integer id) {
        Modalidad modalidad = modalidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modalidad no encontrada"));
        return ModalidadMapper.toModalidadResponse(modalidad);
    }

    @Override
    public ModalidadResponse crearModalidad(ModalidadCreateRequest request) {

        Deporte deporte = deporteRepository.findById(request.idDeporte())
                .orElseThrow(() -> new RuntimeException("Deporte no encontrado"));

        Modalidad modalidad = ModalidadMapper.toModalidad(request, deporte);
        return ModalidadMapper.toModalidadResponse(modalidadRepository.save(modalidad));
    }

    @Override
    public ModalidadResponse actualizarModalidad(Integer id, ModalidadUpdateRequest request) {

        Modalidad modalidad = modalidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modalidad no encontrada"));

        ModalidadMapper.updateModalidadFromDTO(request, modalidad);
        return ModalidadMapper.toModalidadResponse(modalidadRepository.save(modalidad));
    }

    @Override
    @Transactional
    public void eliminarModalidad(Integer id) {
        if (!modalidadRepository.existsById(id))
            throw new RuntimeException("Modalidad no encontrada");

        registroMarcaRepository.deleteAllByModalidadId(id);
        modalidadRepository.deleteById(id);
    }

    @Override
    public List<ModalidadResponse> listarModalidadPorDeporte(Integer idDeporte, boolean incluirOcultos) {
        Deporte deporte = deporteRepository.findById(idDeporte)
                .orElseThrow(() -> new RuntimeException("Deporte no encontrado"));
        if (!incluirOcultos && !deporte.isVisible()) {
            throw new RuntimeException("Deporte no encontrado");
        }
        return modalidadRepository.findByDeporte_IdDeporte(idDeporte)
                .stream()
                .map(ModalidadMapper::toModalidadResponse)
                .toList();
    }
}


