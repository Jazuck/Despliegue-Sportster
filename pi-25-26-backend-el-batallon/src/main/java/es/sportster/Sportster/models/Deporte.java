package es.sportster.Sportster.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "deportes")
public class Deporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_deporte")
    private Integer idDeporte;

    @NotNull(message = "El nombre no puede ser null")
    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(name = "nombre")
    private String nombre;

    /** URL absoluta o data URL (JPEG/PNG). LONGVARCHAR → LONGTEXT en MySQL sin comportamiento raro de @Lob. */
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "imagen_url")
    private String imagenUrl;

    /** Si es false, el deporte no se lista en la web pública hasta que un admin lo active. */
    @ColumnDefault("true")
    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @OneToMany(mappedBy = "deporte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Modalidad> modalidades = new ArrayList<>();

    public Deporte(String nombre) {
        this.nombre = nombre;
    }
}
