--TABLA DE USUARIOS

create table users (
	id SERIAL primary key,
	username VARCHAR(100) unique not null,
	email VARCHAR(150) unique not null,
	password VARCHAR(255) not null,
	is_active Boolean default true,
    first_login BOOLEAN DEFAULT true,
	first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    age INT NULL,
    gender VARCHAR(20) NULL,
    phone VARCHAR(50) NULL,
    course VARCHAR(100) NULL,
    location VARCHAR(255) NULL,
	created_at TIMESTAMP default now(),
	updated_at TIMESTAMP null,
	deleted_at TIMESTAMP null
);

--TABLA DE RECUPERAR CONTRASEÑA

CREATE TABLE password_reset (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    otp VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- REGISTRO DE INICIO DE SESIÓN

CREATE TABLE login_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    login_at TIMESTAMP DEFAULT NOW()
);

--SECCIONES DE JUEGOS

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(150),
    created_at TIMESTAMP DEFAULT NOW()
);



-- JUEGOS

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(150),
    max_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);


--progreso para cada juego

CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    lives INT DEFAULT 10,
    streak INT DEFAULT 0,
    qualification INT DEFAULT 0,
    total_points INT DEFAULT 0,
    games_completed INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);



--puntaje que un usuario gana se registra

CREATE TABLE game_score_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    points INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


--insignias

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(150),
    points_required INT,
    created_at TIMESTAMP DEFAULT NOW()
);

--insignias obtenidas por usuarios

CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    badge_id INT REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

--TABLA DE LECCIONES

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


--TABLA DE USUARIO LECCION

CREATE TABLE user_lessons (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    score DECIMAL(4,2),
    completed_at TIMESTAMP,
    UNIQUE (user_id, lesson_id)
);

--INSERTAR INSIGNIAS

INSERT INTO badges (name, description, points_required) VALUES
('Explorador Novato', 'Nuevo jugador con habilidades básicas', 0),
('Explorador Académico', 'Jugador con habilidades intermedias', 0),
('Explorador Experto', 'Jugador avanzado con gran experiencia', 0),
('Maestro del Conocimiento', 'Jugador que domina los juegos educativos', 0),
('Leyenda Mental', 'El rango más alto del sistema', 50000);


--INSERTAR SECCIONES

INSERT INTO sections (name, description) VALUES
('Word', 'Juegos relacionados con Microsoft Word'),
('Excel', 'Juegos relacionados con Microsoft Excel'),
('PowerPoint', 'Juegos relacionados con Microsoft PowerPoint');


--INSERTAR JUEGOS

INSERT INTO games (section_id, name, description, max_points) VALUES
-- WORD
(1, 'Rompecabezas', 'Completa con el menor número de movimientos y menor tiempo', 500),
(1, 'Construye el robot', 'Adivina la palabra de Microsoft Word', 500),

-- EXCEL
(2, 'Empareja las cartas', 'Tablas Dinámicas en Microsoft Excel', 500),
(2, 'Clasificador de Tipos de Datos', 'Tipo de Datos en Microsoft Excel', 500),

-- POWERPOINT
(3, 'Experto en PowerPoint', 'Reconoce las partes de PowerPoint y ubicalas correctamente en la interfaz', 500),
(3, 'Elementos de diapositivas', 'Conecta cada elemento con su función principal', 500);

--INSERTAR Lecciones

INSERT INTO lessons (section_id, name) VALUES
(1, 'Lección de Word'),
(2, 'Lección de Excel'),
(3, 'Lección de PowerPoint');
