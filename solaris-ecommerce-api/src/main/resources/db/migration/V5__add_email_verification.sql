ALTER TABLE users
    ADD COLUMN verification_token VARCHAR(255),
    ADD COLUMN verification_token_expiry TIMESTAMP;

CREATE INDEX idx_users_verification_token ON users(verification_token);
