package es.sportster.Sportster.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "modalidades")
public class Modalidad {

    //Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_modalidad")
    private Integer idModalidad;

    @NotNull(message = "El nombre no puede ser null")
    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(name="nombre")
    private String nombre;

    @NotNull(message = "El unidad no puede ser null")
    @NotBlank(message = "El unidad no puede estar vacío")
    @Size(max = 20, message = "La unidad no puede superar los 20 caracteres")
    @Column(name="unidad")
    private String unidad; //'kg', 'seg'

    //Relación: Muchas modalidades pertenecen a un deporte
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_deporte")
    private Deporte deporte;

    //Constructor
    public Modalidad(String nombre, String unidad)
    {
        this.nombre=nombre;
        this.unidad=unidad;
    }

}
