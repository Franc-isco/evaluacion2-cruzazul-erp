const express = require('express');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde public/
app.use(express.static('public'));

// Endpoint de prueba
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Frontend Evaluación 3 funcionando' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor frontend escuchando en puerto ${port}`);
});
