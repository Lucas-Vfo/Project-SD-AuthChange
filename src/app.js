const express = require('express');
const changeRoutes = require('./routes');
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration
app.use('/api/auth', changeRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Servicio de cambiar contraseña corriendo en el puerto ${PORT}`);
});