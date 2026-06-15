-- init.sql: script para crear tabla productos en RDS PostgreSQL

-- Crear esquema si es necesario
CREATE SCHEMA IF NOT EXISTS cruzazul;

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS cruzazul.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo
INSERT INTO cruzazul.productos (nombre, categoria, precio, stock)
VALUES
('Paracetamol 500mg', 'Medicamento', 2000.00, 50),
('Ibuprofeno 400mg', 'Medicamento', 2500.00, 30),
('Alcohol Gel 70%', 'Higiene', 3500.00, 100);
