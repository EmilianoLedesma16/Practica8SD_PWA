const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors()); // Permitir solicitudes CORS desde el frontend

// Verifica que dotenv cargue correctamente
try {
  console.log('API Key cargada:', process.env.OPENWEATHER_API_KEY);
  console.log('API Key Unsplash cargada:', process.env.UNSPLASH_API_KEY);
} catch (error) {
  console.error('Error al cargar las variables de entorno:', error.message);
}

// Ruta GET para obtener el clima de una ciudad
app.get('/clima', async (req, res) => {
  const ciudad = req.query.ciudad;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const unsplashKey = process.env.UNSPLASH_API_KEY;

  if (!ciudad) {
    return res.status(400).json({ error: 'Falta el parámetro ?ciudad=' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    ciudad
  )}&appid=${apiKey}&units=metric&lang=es`;

  const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    ciudad
  )}&client_id=${unsplashKey}&per_page=1`;

  try {
    // Obtener datos del clima
    const respuestaClima = await axios.get(url);

    // Obtener imagen de Unsplash
    const respuestaImagen = await axios.get(unsplashUrl);
    const imagen = respuestaImagen.data.results[0]?.urls?.regular || null;

    // Responder con los datos del clima y la imagen
    res.json({
      ciudad: respuestaClima.data.name,
      temperatura: respuestaClima.data.main.temp,
      descripcion: respuestaClima.data.weather[0].description,
      icono: respuestaClima.data.weather[0].icon,
      imagen,
    });
  } catch (error) {
    if (error.response) {
      // Error de respuesta de la API (por ejemplo, ciudad no encontrada)
      console.error('Error de respuesta:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        error: `Error al obtener el clima: ${error.response.data.message || 'Error desconocido'}`,
      });
    } else if (error.request) {
      // Error de conexión (por ejemplo, no se pudo conectar a la API)
      console.error('Error de conexión:', error.message);
      res.status(500).json({ error: 'No se pudo conectar a la API de clima o imágenes' });
    } else {
      // Otro tipo de error
      console.error('Error general:', error.message);
      res.status(500).json({ error: 'Ocurrió un error al procesar la solicitud' });
    }
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});
