CREATE DATABASE sportster;
USE sportster;

CREATE TABLE deportes (
    id_deporte INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE modalidades (
    id_modalidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    id_deporte INT NOT NULL,
    CONSTRAINT fk_modalidad_deporte
        FOREIGN KEY (id_deporte)
        REFERENCES deportes(id_deporte)
        ON DELETE CASCADE
);

CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE marca_deporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_marca INT NOT NULL,
    id_deporte INT NOT NULL,
    CONSTRAINT fk_md_marca
        FOREIGN KEY (id_marca)
        REFERENCES marcas(id_marca)
        ON DELETE CASCADE,
    CONSTRAINT fk_md_deporte
        FOREIGN KEY (id_deporte)
        REFERENCES deportes(id_deporte)
        ON DELETE CASCADE
);

CREATE TABLE marca_modalidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_marca INT NOT NULL,
    id_modalidad INT NOT NULL,
    CONSTRAINT fk_mm_marca
        FOREIGN KEY (id_marca)
        REFERENCES marcas(id_marca)
        ON DELETE CASCADE,
    CONSTRAINT fk_mm_modalidad
        FOREIGN KEY (id_modalidad)
        REFERENCES modalidades(id_modalidad)
        ON DELETE CASCADE
);

-- ══ DEPORTES ══════════════════════════════════════════════════════
INSERT INTO deportes (nombre) VALUES
    ('Atletismo'),
    ('Natación'),
    ('Halterofilia');

-- ══ MODALIDADES ═══════════════════════════════════════════════════

-- Atletismo (id_deporte = 1)
INSERT INTO modalidades (nombre, unidad, id_deporte) VALUES
    ('100m lisos',        's',  1),
    ('200m lisos',        's',  1),
    ('400m lisos',        's',  1),
    ('1500m',             's',  1),
    ('5000m',             's',  1),
    ('Maratón',           's',  1),
    ('Salto de longitud', 'm',  1),
    ('Salto de altura',   'm',  1),
    ('Lanzamiento de peso','m', 1);

-- Natación (id_deporte = 2)
INSERT INTO modalidades (nombre, unidad, id_deporte) VALUES
    ('50m libre',         's',  2),
    ('100m libre',        's',  2),
    ('200m libre',        's',  2),
    ('100m mariposa',     's',  2),
    ('200m espalda',      's',  2),
    ('200m braza',        's',  2);

-- Halterofilia (id_deporte = 3)
INSERT INTO modalidades (nombre, unidad, id_deporte) VALUES
    ('Arrancada',         'kg', 3),
    ('Dos tiempos',       'kg', 3),
    ('Sentadilla',        'kg', 3),
    ('Press banca',       'kg', 3),
    ('Peso muerto',       'kg', 3);