CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL
);

INSERT INTO productos (nombre, categoria, precio, stock) VALUES
('Paracetamol 500mg', 'Analgésico', 1500, 40),
('Ibuprofeno 400mg', 'Antiinflamatorio', 2500, 25),
('Alcohol Gel', 'Higiene', 1990, 60)
ON CONFLICT DO NOTHING;
