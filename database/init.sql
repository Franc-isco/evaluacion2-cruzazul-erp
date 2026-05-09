CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, categoria, precio, stock)
VALUES
('Paracetamol 500mg', 'Medicamentos', 1990, 50),
('Ibuprofeno 400mg', 'Medicamentos', 2490, 40),
('Alcohol Gel 250ml', 'Higiene', 1590, 30);
