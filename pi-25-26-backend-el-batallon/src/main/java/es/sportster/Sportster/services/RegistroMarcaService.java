package es.sportster.Sportster.services;

import es.sportster.Sportster.DTOS.marca.RegistroMarcaCreateRequest;
import es.sportster.Sportster.DTOS.marca.RegistroMarcaResponse;
import es.sportster.Sportster.DTOS.marca.UserMarcaResponse;
import es.sportster.Sportster.interfaces.IRegistroMarcaService;
import es.sportster.Sportster.models.Modalidad;
import es.sportster.Sportster.models.RegistroMarca;
import es.sportster.Sportster.models.User;
import es.sportster.Sportster.repositories.ModalidadRepository;
import es.sportster.Sportster.repositories.RegistroMarcaRepository;
import es.sportster.Sportster.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistroMarcaService implements IRegistroMarcaService {

    @Autowired
    private RegistroMarcaRepository registroMarcaRepository;

    @Autowired
    private ModalidadRepository modalidadRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RegistroMarcaResponse> obtenerRankingsPorModalidad(Integer idModalidad) {

        Modalidad modalidad = modalidadRepository.findById(idModalidad)
                .orElseThrow(() -> new RuntimeException("Modalidad no encontrada"));

        List<RegistroMarca> registros =
                registroMarcaRepository.findByModalidad_IdModalidad(idModalidad);

        String unidad = modalidad.getUnidad() != null ? modalidad.getUnidad().toLowerCase() : "";
        boolean isTime = unidad.contains("seg") || unidad.contains("min") || unidad.equals("s");

        // Agrupamos por usuario y nos quedamos con su mejor marca
        return registros.stream()
                .collect(Collectors.groupingBy(rm -> rm.getUser().getId()))
                .values().stream()
                .map(list -> list.stream()
                        .min(isTime ? Comparator.comparing(RegistroMarca::getValor) : Comparator.comparing(RegistroMarca::getValor).reversed())
                        .get())
                .sorted(isTime ? Comparator.comparing(RegistroMarca::getValor) : Comparator.comparing(RegistroMarca::getValor).reversed())
                .map(rm -> new RegistroMarcaResponse(
                        rm.getUser().getName(),
                        rm.getUser().getEmail(),
                        formatearMarca(rm.getValor(), modalidad.getUnidad()),
                        rm.getFecha()
                ))
                .toList();
    }

    @Override
    public RegistroMarcaResponse registrarMarca(RegistroMarcaCreateRequest request, String email) {

        Modalidad modalidad = modalidadRepository.findById(request.modalidadId())
                .orElseThrow(() -> new RuntimeException("Modalidad no encontrada"));

        User user = resolverUsuarioPorEmailObligatorio(email);
        RegistroMarca nuevoRegistro = RegistroMarca.builder()
                .user(user)
                .modalidad(modalidad)
                .valor(request.valor())
                .build();

        nuevoRegistro = registroMarcaRepository.save(nuevoRegistro);

        return new RegistroMarcaResponse(
                user.getName(),
                user.getEmail(),
                formatearMarca(nuevoRegistro.getValor(), modalidad.getUnidad()),
                nuevoRegistro.getFecha()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserMarcaResponse> obtenerMejoresMarcasUsuario(String email) {
        User propietario = resolverUsuarioPorEmail(email);
        if (propietario == null) {
            return List.of();
        }
        List<RegistroMarca> registros = registroMarcaRepository.findByUser_Id(propietario.getId());

        return registros.stream()
                .collect(Collectors.groupingBy(rm -> rm.getModalidad().getIdModalidad()))
                .values().stream()
                .map(list -> {
                    Modalidad mod = list.get(0).getModalidad();
                    String unidad = mod.getUnidad() != null ? mod.getUnidad().toLowerCase() : "";
                    boolean isTime = unidad.contains("seg") || unidad.contains("min") || unidad.equals("s");
                    
                    RegistroMarca best = list.stream()
                            .min(isTime ? Comparator.comparing(RegistroMarca::getValor) : Comparator.comparing(RegistroMarca::getValor).reversed())
                            .orElse(list.get(0));

                    return new UserMarcaResponse(
                            best.getId(),
                            mod.getDeporte().getNombre(),
                            mod.getNombre(),
                            formatearMarca(best.getValor(), mod.getUnidad()),
                            best.getFecha()
                    );
                })
                .toList();
    }

    @Override
    @Transactional
    public void eliminarMarca(Integer id, String email) {
        User actual = resolverUsuarioPorEmailObligatorio(email);
        RegistroMarca rm = registroMarcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));

        if (!rm.getUser().getId().equals(actual.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este registro");
        }

        registroMarcaRepository.delete(rm);
    }

    private User resolverUsuarioPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String t = email.trim();
        return userRepository.findByEmailIgnoreCase(t).orElseGet(() -> userRepository.findByEmail(t));
    }

    private User resolverUsuarioPorEmailObligatorio(String email) {
        User u = resolverUsuarioPorEmail(email);
        if (u == null) {
            throw new RuntimeException("Usuario no encontrado");
        }
        return u;
    }

    private String formatearMarca(Double valor, String unidad) {
        String u = unidad != null ? unidad.toLowerCase() : "";
        String sufijo = unidad != null ? unidad : "";

        if (u.contains("seg") || u.equals("s")) {
            sufijo = "s";
        } else if (u.contains("met") || u.equals("m")) {
            sufijo = "m";
        } else if (u.contains("kilo") || u.contains("kg")) {
            sufijo = "kg";
        }

        if (sufijo.equals("s")) {
            return String.format("%.2fs", valor).replace(",", ".");
        }
        return String.format("%.2f %s", valor, sufijo).replace(",", ".");
    }
}
