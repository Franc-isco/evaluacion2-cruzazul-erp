const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "clave_temporal";
const APP_USER = process.env.APP_USER || "admin";
const APP_PASSWORD = process.env.APP_PASSWORD || "admin123";
const TOTP_SECRET = process.env.TOTP_SECRET;
const TOTP_ISSUER = "Cruz Azul ERP";
const TOTP_LABEL = "admin@cruz-azul-erp";

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

function renderError(titulo, mensaje, volver = "/") {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="error-box">
        <h2>${titulo}</h2>
        <p>${mensaje}</p>
        <a href="${volver}" class="small-link">Volver</a>
      </div>
    </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  res.clearCookie("pre_auth");

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
          <div class="brand">
            <div class="logo-circle">💊</div>
            <div class="brand-text">
              <h1>Cruz Azul ERP</h1>
              <p>Portal seguro de farmacia</p>
            </div>
          </div>

          <span class="badge">🛡️ Acceso protegido con MFA + JWT</span>

          <form method="POST" action="/login">
            <label>Usuario</label>
            <input type="text" name="usuario" placeholder="Ingrese usuario administrador" required>

            <label>Contraseña</label>
            <input type="password" name="password" placeholder="Ingrese contraseña segura" required>

            <button type="submit">Continuar al segundo factor</button>
          </form>

          <p class="info">
            Primera etapa de autenticación: validación de credenciales principales.
            Luego se solicita un segundo factor MFA.
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  if (usuario === APP_USER && password === APP_PASSWORD) {
    const preAuthToken = jwt.sign(
      { usuario, etapa: "mfa-pendiente" },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.cookie("pre_auth", preAuthToken, {
      httpOnly: true,
      sameSite: "strict"
    });

    return res.redirect("/mfa");
  }

  return res.send(
    renderError(
      "Credenciales incorrectas",
      "El usuario o la contraseña ingresada no son válidos.",
      "/"
    )
  );
});

app.get("/mfa", async (req, res) => {
  const preAuth = req.cookies.pre_auth;

  if (!preAuth) {
    return res.redirect("/");
  }

  try {
    const datos = jwt.verify(preAuth, JWT_SECRET);

    if (datos.etapa !== "mfa-pendiente") {
      return res.redirect("/");
    }

    if (!TOTP_SECRET) {
      return res.send(
        renderError(
          "MFA no configurado",
          "No existe una clave TOTP configurada en el servidor.",
          "/"
        )
      );
    }

    const otpauthUrl = speakeasy.otpauthURL({
      secret: TOTP_SECRET,
      label: TOTP_LABEL,
      issuer: TOTP_ISSUER,
      encoding: "base32"
    });

    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Cruz Azul ERP - MFA</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <div class="login-container">
          <div class="card">
            <div class="brand">
              <div class="logo-circle">🔐</div>
              <div class="brand-text">
                <h1>Verificación MFA</h1>
                <p>Google Authenticator</p>
              </div>
            </div>

            <span class="badge">✅ Paso 2 de autenticación</span>

            <p class="info">
              Escanee este código QR en Google Authenticator o Microsoft Authenticator.
              Luego ingrese el código temporal de 6 dígitos.
            </p>

            <div style="text-align:center; margin: 15px 0;">
              <img src="${qrDataUrl}" alt="QR MFA Google Authenticator" style="max-width:180px;">
            </div>

            <form method="POST" action="/mfa">
              <label>Código MFA</label>
              <input type="text" name="mfa" placeholder="Ingrese código de 6 dígitos" required>

              <button type="submit">Verificar y entrar</button>
            </form>

            <p class="info">
              Solo se genera el token JWT final si el código temporal MFA es válido.
            </p>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    return res.redirect("/");
  }
});

app.post("/mfa", (req, res) => {
  const { mfa } = req.body;
  const preAuth = req.cookies.pre_auth;

  if (!preAuth) {
    return res.redirect("/");
  }

  try {
    const datos = jwt.verify(preAuth, JWT_SECRET);

    if (datos.etapa !== "mfa-pendiente") {
      return res.redirect("/");
    }

    if (!TOTP_SECRET) {
      return res.send(
        renderError(
          "MFA no configurado",
          "No existe una clave TOTP configurada en el servidor.",
          "/"
        )
      );
    }

    const mfaValido = speakeasy.totp.verify({
      secret: TOTP_SECRET,
      encoding: "base32",
      token: String(mfa).replace(/\s/g, ""),
      window: 1
    });

    if (mfaValido) {
      const token = jwt.sign(
        { usuario: datos.usuario },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.clearCookie("pre_auth");

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict"
      });

      return res.redirect("/dashboard");
    }

    return res.send(
      renderError(
        "Código MFA incorrecto",
        "El código temporal ingresado no coincide con Google Authenticator.",
        "/mfa"
      )
    );
  } catch (error) {
    return res.redirect("/");
  }
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
          <div class="topbar">
            <div>
              <h1>💊 Dashboard Cruz Azul ERP</h1>
              <p>Panel de control seguro conectado a AWS RDS PostgreSQL</p>
            </div>
            <a href="/logout" class="logout">Cerrar sesión</a>
          </div>

          <div class="grid">
            <div class="stat-card">
              <div class="stat-icon">🖥️</div>
              <h3>Frontend EC2</h3>
              <p>Aplicación Node.js + Express desplegada con Docker en una instancia Debian.</p>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🗄️</div>
              <h3>RDS PostgreSQL</h3>
              <p>Base de datos PaaS privada, accesible solo desde el Security Group del frontend.</p>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🔐</div>
              <h3>MFA + JWT</h3>
              <p>Acceso en dos etapas y rutas protegidas mediante token JWT temporal.</p>
            </div>
          </div>

          <section class="section-card">
            <h2>🛡️ Estado de la infraestructura</h2>
            <div class="status">
              <p><strong>Frontend:</strong> EC2 con Node.js + Express + Docker</p>
              <p><strong>Base de datos:</strong> AWS RDS PostgreSQL</p>
              <p><strong>Conexión BD:</strong> Correcta</p>
              <p><strong>Hora desde RDS:</strong> ${resultado.rows[0].fecha_servidor}</p>
            </div>
          </section>

          <section class="section-card">
            <h2>📦 Gestión de productos</h2>
            <form method="POST" action="/productos" class="form-grid">
              <input type="text" name="nombre" placeholder="Nombre del producto" required>
              <input type="text" name="categoria" placeholder="Categoría" required>
              <input type="number" name="precio" placeholder="Precio" required>
              <input type="number" name="stock" placeholder="Stock" required>
              <button type="submit">Agregar producto al inventario</button>
            </form>
          </section>

          <section class="section-card">
            <h2>🧾 Productos registrados</h2>
            <p class="info">
              Consulta los productos almacenados en la base de datos PostgreSQL de AWS RDS.
            </p>
            <a href="/productos" class="button-link">Ver productos</a>
          </section>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(
      renderError(
        "Error de conexión con RDS",
        error.message,
        "/"
      )
    );
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
    res.send(
      renderError(
        "Error al insertar producto",
        error.message,
        "/dashboard"
      )
    );
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
        <td class="price">$${producto.precio}</td>
        <td class="stock">${producto.stock}</td>
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
          <div class="topbar">
            <div>
              <h1>📦 Inventario Cruz Azul</h1>
              <p>Productos almacenados en AWS RDS PostgreSQL</p>
            </div>
            <a href="/dashboard" class="logout">Volver al dashboard</a>
          </div>

          <div class="section-card">
            <h2>🧾 Listado de productos</h2>
            <div class="table-wrapper">
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
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(
      renderError(
        "Error al consultar productos",
        error.message,
        "/dashboard"
      )
    );
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("pre_auth");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Servidor Cruz Azul ERP ejecutándose en puerto ${PORT}`);
});
