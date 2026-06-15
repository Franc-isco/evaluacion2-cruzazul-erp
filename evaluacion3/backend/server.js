const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 4000;

// Middleware para JSON
app.use(express.json());

// Pool de PostgreSQL usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint: Listar productos
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cruzazul.productos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Endpoint: Agregar producto
app.post('/api/productos', async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cruzazul.productos (nombre, categoria, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, categoria, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Endpoint: Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre, categoria, precio, stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cruzazul.productos SET nombre=$1, categoria=$2, precio=$3, stock=$4 WHERE id=$5 RETURNING *',
      [nombre, categoria, precio, stock, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Endpoint: Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM cruzazul.productos WHERE id=$1', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en puerto ${port}`);
});
