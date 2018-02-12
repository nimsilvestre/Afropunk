DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS connection_requests;


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(100),
    last VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    imageUrl TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE connection_requests (
    id SERIAL primary key,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);
