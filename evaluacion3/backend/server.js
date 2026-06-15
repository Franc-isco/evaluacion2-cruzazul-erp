const express = require('express');
const app = express();
const port = 4000;

// Middleware para parsear JSON
app.use(express.json());

// Endpoint de prueba
app.get('/api/admin', (req, res) => {
  res.json({ message: 'Backend Evaluación 3 funcionando' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en puerto ${port}`);
});
