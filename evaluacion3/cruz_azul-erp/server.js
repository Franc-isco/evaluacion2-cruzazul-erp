const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "clave_temporal";
const APP_USER = process.env.APP_USER || "admin";
const APP_PASSWORD = process.env.APP_PASSWORD || "admin123";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

function validarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/");
  }

  try {
    const usuario = jwt.verify(token, JWT_SECRET);
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.redirect("/");
  }
}

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Cruz Azul ERP - Login</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="login-container">
        <div class="card">
          <h1>Farmacia Cruz Azul</h1>
          <p>Portal de autenticación seguro</p>

          <form method="POST" action="/login">
            <label>Usuario</label>
            <input type="text" name="usuario" placeholder="Ingrese usuario" required>

            <label>Contraseña</label>
            <input type="password" name="password" placeholder="Ingrese contraseña" required>

            <button type="submit">Ingresar</button>
          </form>

          <p class="info">Acceso protegido mediante token JWT</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  if (usuario === APP_USER && password === APP_PASSWORD) {
    const token = jwt.sign(
      { usuario },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict"
    });

    return res.redirect("/dashboard");
  }

  return res.send(`
    <h2>Credenciales incorrectas</h2>
    <a href="/">Volver al login</a>
  `);
});

app.get("/dashboard", validarToken, async (req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW() AS fecha_servidor");

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Dashboard Cruz Azul ERP</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Dashboard Cruz Azul ERP</h1>
            <a href="/logout" class="logout">Cerrar sesión</a>
          </header>

          <section class="status">
            <h2>Estado de la infraestructura</h2>
            <p><strong>Frontend:</strong> EC2 con Node.js + Express</p>
            <p><strong>Base de datos:</strong> AWS RDS PostgreSQL</p>
            <p><strong>Conexión BD:</strong> Correcta</p>
            <p><strong>Hora desde RDS:</strong> ${resultado.rows[0].fecha_servidor}</p>
          </section>

          <section>
            <h2>Gestión de productos</h2>
            <form method="POST" action="/productos">
              <input type="text" name="nombre" placeholder="Nombre del producto" required>
              <input type="text" name="categoria" placeholder="Categoría" required>
              <input type="number" name="precio" placeholder="Precio" required>
              <input type="number" name="stock" placeholder="Stock" required>
              <button type="submit">Agregar producto</button>
            </form>
          </section>

          <section>
            <h2>Productos registrados</h2>
            <a href="/productos" class="button-link">Ver productos</a>
          </section>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <h2>Error de conexión con RDS</h2>
      <p>${error.message}</p>
      <a href="/">Volver</a>
    `);
  }
});

app.post("/productos", validarToken, async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;

  try {
    await pool.query(
      "INSERT INTO productos (nombre, categoria, precio, stock) VALUES ($1, $2, $3, $4)",
      [nombre, categoria, precio, stock]
    );

    res.redirect("/productos");
  } catch (error) {
    res.send(`
      <h2>Error al insertar producto</h2>
      <p>${error.message}</p>
      <a href="/dashboard">Volver al dashboard</a>
    `);
  }
});

app.get("/productos", validarToken, async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM productos ORDER BY id DESC");

    const filas = resultado.rows.map(producto => `
      <tr>
        <td>${producto.id}</td>
        <td>${producto.nombre}</td>
        <td>${producto.categoria}</td>
        <td>$${producto.precio}</td>
        <td>${producto.stock}</td>
      </tr>
    `).join("");

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Productos Cruz Azul</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Productos registrados</h1>
            <a href="/dashboard" class="logout">Volver</a>
          </header>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <h2>Error al consultar productos</h2>
      <p>${error.message}</p>
      <a href="/dashboard">Volver al dashboard</a>
    `);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Servidor Cruz Azul ERP ejecutándose en puerto ${PORT}`);
});
