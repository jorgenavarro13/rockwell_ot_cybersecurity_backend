// Vamos a usar PostgreSQL para esta base de datos

CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL ,
    email TEXT NOT NULL UNIQUE,
    password CRYPT NOT NULL,
    phone TEXT,
    BIRTHDAY DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE COUNTRY (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
    FOREIGN KEY (id) REFERENCES user(id)
);


CREATE TABLE enterprise(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, //SIGLAS
    // IMAGE
    country_id INTEGER NOT NULL,
    FOREIGN KEY (country_id) REFERENCES USER(id)
);

CREATE TABLE game (
    id SERIAL PRIMARY KEY,
    current_score INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trys INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    aciertos INTEGER NOT NULL,
    fallos INTEGER NOT NULL
);

CREATE TABLE game tries

