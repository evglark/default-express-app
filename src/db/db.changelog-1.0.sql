CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255), -- NULL, если пользователь использует только Google
	google_id VARCHAR(255) UNIQUE, -- NULL, если нет привязки Google
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
	id SERIAL PRIMARY KEY,
	user_id UUID NOT NULL,
	token TEXT NOT NULL UNIQUE,
	created_at TIMESTAMP DEFAULT NOW()
);
