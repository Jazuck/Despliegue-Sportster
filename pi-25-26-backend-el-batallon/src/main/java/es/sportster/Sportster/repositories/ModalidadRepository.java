package es.sportster.Sportster.repositories;

import es.sportster.Sportster.models.Modalidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModalidadRepository extends JpaRepository<Modalidad, Integer> {
    List<Modalidad> findByDeporte_IdDeporte(Integer idDeporte);
}