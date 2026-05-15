package es.sportster.Sportster.repositories;

import es.sportster.Sportster.models.Deporte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeporteRepository extends JpaRepository<Deporte, Integer> {
    boolean existsByNombre(String nombre);

    List<Deporte> findByVisibleTrue();
}