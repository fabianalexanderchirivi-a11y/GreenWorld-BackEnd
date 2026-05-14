USE GreenWorld;
GO

IF COL_LENGTH('dbo.usuarios', 'rol') IS NULL
BEGIN
    ALTER TABLE dbo.usuarios
    ADD rol VARCHAR(20) NOT NULL CONSTRAINT DF_usuarios_rol DEFAULT 'usuario';
END;
GO

UPDATE dbo.usuarios
SET rol = 'usuario'
WHERE rol IS NULL OR rol NOT IN ('usuario', 'admin');
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_usuarios_rol'
)
BEGIN
    ALTER TABLE dbo.usuarios
    ADD CONSTRAINT CK_usuarios_rol CHECK (rol IN ('usuario', 'admin'));
END;
GO

-- Para habilitar un administrador real, ajusta el correo existente:
-- UPDATE dbo.usuarios SET rol = 'admin' WHERE correo = 'admin@greenworld.com';
-- GO

IF COL_LENGTH('dbo.cursos', 'categoria') IS NULL
BEGIN
    ALTER TABLE dbo.cursos
    ADD categoria VARCHAR(100) NULL;
END;
GO

IF COL_LENGTH('dbo.inscripciones', 'fecha_finalizacion') IS NULL
BEGIN
    ALTER TABLE dbo.inscripciones
    ADD fecha_finalizacion DATETIME2 NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_inscripciones_usuario_curso'
      AND object_id = OBJECT_ID('dbo.inscripciones')
)
AND NOT EXISTS (
    SELECT 1
    FROM dbo.inscripciones
    GROUP BY id_usuario, id_curso
    HAVING COUNT(*) > 1
)
BEGIN
    CREATE UNIQUE INDEX UX_inscripciones_usuario_curso
    ON dbo.inscripciones (id_usuario, id_curso);
END;
GO

IF COL_LENGTH('dbo.cursos', 'imagen') IS NULL
BEGIN
    ALTER TABLE dbo.cursos
    ADD imagen VARCHAR(255) NULL;
END;
GO

IF COL_LENGTH('dbo.cursos', 'duracion_estimada') IS NULL
BEGIN
    ALTER TABLE dbo.cursos
    ADD duracion_estimada VARCHAR(50) NULL;
END;
GO

IF COL_LENGTH('dbo.cursos', 'nivel') IS NULL
BEGIN
    ALTER TABLE dbo.cursos
    ADD nivel VARCHAR(20) NULL;
END;
GO

IF COL_LENGTH('dbo.cursos', 'estado') IS NULL
BEGIN
    ALTER TABLE dbo.cursos
    ADD estado VARCHAR(20) NOT NULL CONSTRAINT DF_cursos_estado DEFAULT 'publicado';
END;
GO

IF COL_LENGTH('dbo.cursos', 'fecha_creacion') IS NULL
BEGIN
    ALTER TABLE dbo.cursos
    ADD fecha_creacion DATETIME DEFAULT GETDATE();
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ListarCursos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id_curso,
        titulo,
        descripcion,
        imagen,
        duracion_estimada,
        nivel,
        categoria,
        estado,
        fecha_creacion
    FROM dbo.cursos
    ORDER BY id_curso DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_InsertarCurso
    @titulo NVARCHAR(150),
    @descripcion NVARCHAR(MAX),
    @imagen NVARCHAR(255) = NULL,
    @duracion_estimada NVARCHAR(50) = NULL,
    @nivel NVARCHAR(20),
    @categoria NVARCHAR(100) = NULL,
    @estado NVARCHAR(20) = 'publicado'
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.cursos (
        titulo,
        descripcion,
        imagen,
        duracion_estimada,
        nivel,
        categoria,
        estado
    )
    VALUES (
        @titulo,
        @descripcion,
        @imagen,
        @duracion_estimada,
        @nivel,
        @categoria,
        @estado
    );

    SELECT SCOPE_IDENTITY() AS id_curso;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_EditarCurso
    @id_curso INT,
    @titulo NVARCHAR(150),
    @descripcion NVARCHAR(MAX),
    @imagen NVARCHAR(255) = NULL,
    @duracion_estimada NVARCHAR(50) = NULL,
    @nivel NVARCHAR(20),
    @categoria NVARCHAR(100) = NULL,
    @estado NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.cursos WHERE id_curso = @id_curso)
    BEGIN
        RAISERROR('El curso no existe', 16, 1);
        RETURN;
    END;

    UPDATE dbo.cursos
    SET
        titulo = @titulo,
        descripcion = @descripcion,
        imagen = @imagen,
        duracion_estimada = @duracion_estimada,
        nivel = @nivel,
        categoria = @categoria,
        estado = @estado
    WHERE id_curso = @id_curso;

    SELECT * FROM dbo.cursos WHERE id_curso = @id_curso;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_EliminarCurso
    @id_curso INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.cursos WHERE id_curso = @id_curso)
    BEGIN
        RAISERROR('El curso no existe', 16, 1);
        RETURN;
    END;

    UPDATE dbo.cursos
    SET estado = 'archivado'
    WHERE id_curso = @id_curso;

    SELECT * FROM dbo.cursos WHERE id_curso = @id_curso;
END;
GO

MERGE dbo.cursos AS target
USING (VALUES
    ('Reciclaje basico', 'Aprende a separar residuos y a crear habitos simples para reciclar mejor en casa y en tu barrio.', 'Bin.webp', '2 horas', 'basico', 'Residuos', 'publicado'),
    ('Energia y ahorro', 'Descubre acciones cotidianas para usar menos energia y reducir el impacto ambiental en tus espacios.', 'Energy.webp', '2 horas', 'basico', 'Energia', 'publicado'),
    ('Cuidado del agua', 'Conoce estrategias para cuidar fuentes hidricas y disminuir el desperdicio de agua en la vida diaria.', 'Water.webp', '2 horas', 'basico', 'Agua', 'publicado'),
    ('Conservacion', 'Explora practicas para proteger ecosistemas, fauna y flora con acciones sostenibles y comunitarias.', 'Conservar.webp', '3 horas', 'intermedio', 'Naturaleza', 'publicado'),
    ('Consumo responsable', 'Aprende a tomar decisiones de compra mas conscientes para reducir residuos y apoyar productos sostenibles.', 'Consumo.webp', '3 horas', 'intermedio', 'Habitos', 'publicado'),
    ('Huerta urbana', 'Crea tu propia huerta en casa y descubre como cultivar alimentos frescos en espacios pequenos.', 'Huerta.png', '3 horas', 'intermedio', 'Cultivo', 'publicado'),
    ('Cambio climatico', 'Comprende las causas del cambio climatico, sus efectos y las acciones que ayudan a enfrentarlo.', 'World.webp', '4 horas', 'avanzado', 'Clima', 'publicado'),
    ('Biodiversidad', 'Reconoce la importancia de la biodiversidad y como proteger las especies en tu entorno cercano.', 'Tortugas.webp', '4 horas', 'avanzado', 'Naturaleza', 'publicado')
) AS source (titulo, descripcion, imagen, duracion_estimada, nivel, categoria, estado)
ON target.titulo = source.titulo
WHEN MATCHED THEN
    UPDATE SET
        descripcion = source.descripcion,
        imagen = source.imagen,
        duracion_estimada = source.duracion_estimada,
        nivel = source.nivel,
        categoria = source.categoria,
        estado = source.estado
WHEN NOT MATCHED THEN
    INSERT (titulo, descripcion, imagen, duracion_estimada, nivel, categoria, estado)
    VALUES (source.titulo, source.descripcion, source.imagen, source.duracion_estimada, source.nivel, source.categoria, source.estado);
GO

IF OBJECT_ID('dbo.retos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.retos (
        id_reto INT IDENTITY(1,1) PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        descripcion VARCHAR(MAX) NOT NULL,
        objetivo VARCHAR(MAX) NULL,
        dificultad VARCHAR(50) NULL,
        categoria VARCHAR(100) NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'activo',
        imagen VARCHAR(255) NULL,
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
END;
GO

IF OBJECT_ID('dbo.usuario_retos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.usuario_retos (
        id_usuario_reto INT IDENTITY(1,1) PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_reto INT NOT NULL,
        estado_progreso VARCHAR(20) NOT NULL DEFAULT 'en_progreso',
        fecha_inicio DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        fecha_finalizacion DATETIME2 NULL,
        fecha_ultima_actividad DATETIME2 NULL,
        CONSTRAINT FK_usuario_retos_usuarios
            FOREIGN KEY (id_usuario) REFERENCES dbo.usuarios(id_usuario),
        CONSTRAINT FK_usuario_retos_retos
            FOREIGN KEY (id_reto) REFERENCES dbo.retos(id_reto),
        CONSTRAINT CK_usuario_retos_estado
            CHECK (estado_progreso IN ('sin_iniciar', 'en_progreso', 'terminado')),
        CONSTRAINT UX_usuario_retos_usuario_reto
            UNIQUE (id_usuario, id_reto)
    );
END;
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_usuario_retos_estado'
      AND parent_object_id = OBJECT_ID('dbo.usuario_retos')
)
BEGIN
    ALTER TABLE dbo.usuario_retos
    DROP CONSTRAINT CK_usuario_retos_estado;
END;
GO

IF OBJECT_ID('dbo.usuario_retos', 'U') IS NOT NULL
BEGIN
    ALTER TABLE dbo.usuario_retos
    ADD CONSTRAINT CK_usuario_retos_estado
        CHECK (estado_progreso IN ('sin_iniciar', 'en_progreso', 'terminado', 'cancelado'));
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ListarRetos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id_reto,
        titulo,
        descripcion,
        objetivo,
        dificultad,
        categoria,
        estado,
        imagen,
        fecha_creacion
    FROM dbo.retos
    ORDER BY id_reto DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ListarRetosActivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id_reto,
        titulo,
        descripcion,
        objetivo,
        dificultad,
        categoria,
        estado,
        imagen,
        fecha_creacion
    FROM dbo.retos
    WHERE LOWER(estado) IN ('activo', 'disponible')
    ORDER BY id_reto DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_InsertarReto
    @titulo VARCHAR(150),
    @descripcion VARCHAR(MAX),
    @objetivo VARCHAR(MAX) = NULL,
    @dificultad VARCHAR(50) = NULL,
    @categoria VARCHAR(100) = NULL,
    @estado VARCHAR(20) = 'activo',
    @imagen VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.retos (
        titulo,
        descripcion,
        objetivo,
        dificultad,
        categoria,
        estado,
        imagen
    )
    VALUES (
        @titulo,
        @descripcion,
        @objetivo,
        @dificultad,
        @categoria,
        @estado,
        @imagen
    );

    SELECT SCOPE_IDENTITY() AS id_reto;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_EditarReto
    @id_reto INT,
    @titulo VARCHAR(150),
    @descripcion VARCHAR(MAX),
    @objetivo VARCHAR(MAX) = NULL,
    @dificultad VARCHAR(50) = NULL,
    @categoria VARCHAR(100) = NULL,
    @estado VARCHAR(20),
    @imagen VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE id_reto = @id_reto)
    BEGIN
        RAISERROR('El reto no existe', 16, 1);
        RETURN;
    END;

    UPDATE dbo.retos
    SET
        titulo = @titulo,
        descripcion = @descripcion,
        objetivo = @objetivo,
        dificultad = @dificultad,
        categoria = @categoria,
        estado = @estado,
        imagen = @imagen
    WHERE id_reto = @id_reto;

    SELECT * FROM dbo.retos WHERE id_reto = @id_reto;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_EliminarReto
    @id_reto INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE id_reto = @id_reto)
    BEGIN
        RAISERROR('El reto no existe', 16, 1);
        RETURN;
    END;

    UPDATE dbo.retos
    SET estado = 'inactivo'
    WHERE id_reto = @id_reto;

    SELECT * FROM dbo.retos WHERE id_reto = @id_reto;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Separa tus residuos por un dia')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Separa tus residuos por un dia', 'Clasifica papel, plastico, vidrio y residuos organicos durante toda tu jornada.', 'Organiza tres recipientes y separa correctamente cada residuo que generes.', 'Basico', 'Residuos', 'activo', 'Residue.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Reduce tu tiempo de ducha')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Reduce tu tiempo de ducha', 'Disminuye algunos minutos de uso de agua para crear un habito mas consciente.', 'Toma una ducha de maximo cinco minutos usando alarma o cronometro.', 'Basico', 'Agua', 'activo', 'Shower.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Evita usar plastico hoy')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Evita usar plastico hoy', 'Busca alternativas reutilizables en tus compras, comidas y desplazamientos del dia.', 'Rechaza bolsas, pitillos o empaques plasticos de un solo uso.', 'Intermedio', 'Consumo', 'activo', 'Evitar.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Apaga luces innecesarias')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Apaga luces innecesarias', 'Haz una revision consciente de los espacios que usas en casa o en tu estudio.', 'Apaga luces y desconecta equipos en habitaciones vacias durante el dia.', 'Basico', 'Energia', 'activo', 'Light.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Camina en vez de usar transporte corto')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Camina en vez de usar transporte corto', 'Convierte un trayecto breve en una oportunidad para reducir emisiones.', 'Haz caminando un recorrido corto que normalmente harias en transporte.', 'Intermedio', 'Movilidad', 'activo', 'Walking.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Cuida una planta durante la semana')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Cuida una planta durante la semana', 'Dedica varios dias a observar, regar y proteger una planta de tu entorno.', 'Revisa diariamente su riego, luz y estado general durante siete dias.', 'Intermedio', 'Naturaleza', 'activo', 'Plant.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Reutiliza una botella')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Reutiliza una botella', 'Sustituye envases desechables por una botella reutilizable en tus actividades.', 'Lleva contigo una botella reutilizable y rellena agua cuando lo necesites.', 'Basico', 'Habitos', 'activo', 'Bottle.webp');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.retos WHERE titulo = 'Recoge residuos de un espacio cercano')
BEGIN
    INSERT INTO dbo.retos (titulo, descripcion, objetivo, dificultad, categoria, estado, imagen)
    VALUES ('Recoge residuos de un espacio cercano', 'Genera impacto positivo limpiando un punto de tu barrio, parque o institucion.', 'Recolecta residuos visibles en un espacio cercano y depositalos correctamente.', 'Avanzado', 'Comunidad', 'activo', 'Trash.webp');
END;
GO
