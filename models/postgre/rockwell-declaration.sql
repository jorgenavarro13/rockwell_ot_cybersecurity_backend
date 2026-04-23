
DROP TABLE IF EXISTS login_logs CASCADE;
DROP TABLE IF EXISTS user_security CASCADE;
DROP TABLE IF EXISTS countries CASCADE ;
DROP TABLE IF EXISTS type_users CASCADE ;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE countries
(
    country_id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo TEXT NOT NULL
);

CREATE TABLE type_users
(
    type_id SERIAL PRIMARY KEY,
    relation TEXT NOT NULL UNIQUE
);

CREATE TABLE roles
(
    role_id SERIAL PRIMARY KEY,
    description TEXT UNIQUE CHECK(LENGTH(description)<30)
);

CREATE TABLE companies
(
    company_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE users
(
    user_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country INT REFERENCES countries (country_id),
    email TEXT NOT NULL UNIQUE CHECK (LENGTH(email) < 100),
    password_hash TEXT NOT NULL,
    phone TEXT UNIQUE CHECK ( LENGTH(phone) < 14 ),
    type_of_user INT NOT NULL REFERENCES type_users(type_id),
    role_id INT REFERENCES roles(role_id) DEFAULT get_default_role(),
    company_id INT REFERENCES companies(company_id),
    birthday DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE
);


CREATE TABLE user_security
(
    user_id          BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    deactivation_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    failed_attempts  INT NOT NULL DEFAULT 0,
    unban_date       DATE
);

CREATE TABLE login_logs
(
    log_id    BIGSERIAL PRIMARY KEY,
    user_id   BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    login_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE user_roles
(
    user_id BIGINT,
    role_id BIGINT,
    PRIMARY KEY (user_id,role_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY  (role_id) REFERENCES roles(role_id)
);


CREATE TABLE games
(
    game_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);


CREATE TABLE matches
(
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    game_id INT NOT NULL DEFAULT 1,
    time_start TIMESTAMPTZ DEFAULT now(),
    date_end TIMESTAMPTZ,
    score INT NOT NULL DEFAULT 0,
    aciertos INT NOT NULL DEFAULT 0,
    power_ups INT NOT NULL DEFAULT 0,
    racha INT NOT NULL DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);