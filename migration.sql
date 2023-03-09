CREATE TABLE queries (
  id SERIAL PRIMARY KEY,
  query VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO queries (query) VALUES
  ('hack reactor'),
  ('galvanize vettec');