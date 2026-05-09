const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  user: process.env.DB_USER || 'cruzazul_user',
  password: process.env.DB_PASSWORD || 'cruzazul_pass',
  database: process.env.DB_NAME || 'cruzazul_db',
  port: process.env.DB_PORT || 5432
});

app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.post('/api/productos', async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;

  try {
    await pool.query(
      'INSERT INTO productos (nombre, categoria, precio, stock) VALUES ($1, $2, $3, $4)',
      [nombre, categoria, precio, stock]
    );

    res.redirect('/');
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).send('Error al guardar producto');
  }
});

app.listen(port, () => {
  console.log(`Servidor ERP Cruz Azul ejecutándose en puerto ${port}`);
});
