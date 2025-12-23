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

    lives INT DEFAULT 5,               
    streak INT DEFAULT 0,               
    correct_answers INT DEFAULT 0,     
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
    correct_answers INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


--insignias

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(150),
    icon VARCHAR(255),
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

--Tags

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(250),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO tags (name, description) VALUES
('Explorador Novato', 'Nuevo jugador con habilidades básicas'),
('Explorador Académico', 'Jugador con habilidades intermedias'),
('Explorador Experto', 'Jugador avanzado con gran experiencia'),
('Maestro del Conocimiento', 'Jugador que domina los juegos educativos'),
('Leyenda Mental', 'El rango más alto del sistema');

--REGISTRO DE NUEVA COLUMNA

ALTER TABLE users 
ADD COLUMN tag_id INT REFERENCES tags(id);
