package es.sportster.Sportster.repositories;

import es.sportster.Sportster.models.RegistroMarca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RegistroMarcaRepository extends JpaRepository<RegistroMarca, Integer> {

    List<RegistroMarca> findByModalidad_IdModalidad(Integer idModalidad);

    List<RegistroMarca> findByUser_Email(String email);

    List<RegistroMarca> findByUser_Id(Integer userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM RegistroMarca r WHERE r.modalidad.idModalidad = :modalidadId")
    int deleteAllByModalidadId(@Param("modalidadId") Integer modalidadId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM RegistroMarca r WHERE r.modalidad.deporte.idDeporte = :deporteId")
    int deleteAllByDeporteId(@Param("deporteId") Integer deporteId);
}
