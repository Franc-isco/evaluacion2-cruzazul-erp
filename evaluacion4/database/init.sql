CREATE TABLE IF NOT EXISTS medicamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    stock INT NOT NULL,
    precio INT NOT NULL
);

CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    medicamento_id INT REFERENCES medicamentos(id),
    cantidad INT NOT NULL,
    total INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO medicamentos (nombre, categoria, stock, precio) VALUES
('Paracetamol 500mg', 'Analgésico', 120, 1500),
('Ibuprofeno 400mg', 'Antiinflamatorio', 80, 2200),
('Amoxicilina 500mg', 'Antibiótico', 60, 3500),
('Loratadina 10mg', 'Antialérgico', 90, 1800),
('Omeprazol 20mg', 'Gastrointestinal', 100, 2000);

INSERT INTO ventas (medicamento_id, cantidad, total) VALUES
(1, 2, 3000),
(2, 1, 2200),
(3, 1, 3500);
