const express = require("express");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "cruzazul_user",
  password: process.env.DB_PASSWORD || "cruzazul_pass",
  database: process.env.DB_NAME || "cruzazul_erp",
});

const USER = {
  username: "admin",
  password: "admin123",
  mfaCode: "123456",
};

function verifyToken(req, res, next) {
  const token = req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).send(`
      <h1>Acceso denegado</h1>
      <p>No se proporcionó token de acceso.</p>
      <a href="/">Volver al login</a>
    `);
  }

  try {
    const cleanToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || "clave_demo_eva4");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send(`
      <h1>Token inválido</h1>
      <p>El token no es válido o expiró.</p>
      <a href="/">Volver al login</a>
    `);
  }
}

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>ERP Cruz Azul</title>
      </head>
      <body style="font-family: Arial; background:#f4f8fb; padding:40px;">
        <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:12px;">
          <h1>ERP Cruz Azul</h1>
          <h3>Portal de autenticación seguro</h3>

          <form method="POST" action="/login">
            <label>Usuario</label><br>
            <input name="username" placeholder="admin" required style="width:100%; padding:10px;"><br><br>

            <label>Contraseña</label><br>
            <input name="password" type="password" placeholder="admin123" required style="width:100%; padding:10px;"><br><br>

            <button type="submit" style="padding:10px 20px;">Ingresar</button>
          </form>

          <p style="font-size:13px; color:#666;">
            Evaluación 4 - Auto Scaling, ELB y CloudWatch
          </p>
        </div>
      </body>
    </html>
  `);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    return res.send(`
      <html>
        <body style="font-family: Arial; background:#f4f8fb; padding:40px;">
          <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:12px;">
            <h2>Validación MFA</h2>
            <p>Usuario validado correctamente. Ingrese el código MFA.</p>

            <form method="POST" action="/mfa">
              <input type="hidden" name="username" value="${username}" />
              <label>Código MFA</label><br>
              <input name="code" placeholder="123456" required style="width:100%; padding:10px;"><br><br>
              <button type="submit" style="padding:10px 20px;">Validar MFA</button>
            </form>
          </div>
        </body>
      </html>
    `);
  }

  res.status(401).send(`
    <h1>Credenciales incorrectas</h1>
    <a href="/">Volver al login</a>
  `);
});

app.post("/mfa", (req, res) => {
  const { username, code } = req.body;

  if (username === USER.username && code === USER.mfaCode) {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "clave_demo_eva4",
      { expiresIn: "15m" }
    );

    return res.send(`
      <html>
        <body style="font-family: Arial; background:#f4f8fb; padding:40px;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">
            <h2>Autenticación exitosa</h2>
            <p>Se generó un token JWT para acceder al ERP.</p>
            <a href="/dashboard?token=${token}">Ingresar al Dashboard ERP</a>
          </div>
        </body>
      </html>
    `);
  }

  res.status(401).send(`
    <h1>Código MFA incorrecto</h1>
    <a href="/">Volver al login</a>
  `);
});

app.get("/dashboard", verifyToken, async (req, res) => {
  let dbStatus = "Sin conexión";
  let dbTime = "No disponible";

  try {
    const result = await pool.query("SELECT NOW() as fecha_servidor");
    dbStatus = "Conexión activa";
    dbTime = result.rows[0].fecha_servidor;
  } catch (error) {
    dbStatus = "Error de conexión a PostgreSQL";
  }

  res.send(`
    <html>
      <body style="font-family: Arial; background:#eef5f9; padding:40px;">
        <div style="max-width:800px; margin:auto; background:white; padding:30px; border-radius:12px;">
          <h1>Dashboard ERP Cruz Azul</h1>
          <p><strong>Usuario autenticado:</strong> ${req.user.username}</p>
          <p><strong>Estado BD:</strong> ${dbStatus}</p>
          <p><strong>Fecha servidor BD:</strong> ${dbTime}</p>

          <h2>Módulos del ERP</h2>
          <ul>
            <li>Inventario de medicamentos</li>
            <li>Ventas y caja</li>
            <li>Usuarios internos</li>
            <li>Reportes operacionales</li>
          </ul>

          <h2>Servicios AWS integrados</h2>
          <ul>
            <li>Application Load Balancer</li>
            <li>Auto Scaling Group</li>
            <li>Amazon CloudWatch</li>
            <li>Amazon EC2</li>
            <li>Amazon S3</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ERP Cruz Azul ejecutándose en puerto ${PORT}`);
});
