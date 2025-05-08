import React, { useState } from 'react';
import './App.css';

function App() {
  const [ciudad, setCiudad] = useState('');
  const [clima, setClima] = useState(null);
  const [error, setError] = useState(null);

  const obtenerClima = async () => {
    try {
      const respuesta = await fetch(`http://192.168.0.23:3001/clima?ciudad=${ciudad}`);
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setClima(datos);
        setError(null);
      } else {
        setClima(null);
        setError(datos.error || 'Error al obtener el clima');
      }
    } catch (err) {
      // Manejar el caso en el que no hay conexión y el Service Worker devuelve datos del caché
      try {
        const cachedResponse = await caches.match(`/clima?ciudad=${ciudad}`);
        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          setClima(cachedData);
          setError(null);
        } else {
          setClima(null);
          setError('No hay datos en caché para esta ciudad.');
        }
      } catch (cacheError) {
        setClima(null);
        setError('No se pudo conectar al servidor y no hay datos en caché.');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Consulta el Clima 🌤️</h1>
        <p>
          Bienvenido a la aplicación de consulta del clima. Ingresa el nombre de una ciudad para obtener
          información actualizada sobre el clima, incluyendo una imagen representativa del lugar.
        </p>
      </header>
  
      <main>
        <div className="buscador">
          <input
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej. Mexico City"
          />
          <button onClick={obtenerClima}>Buscar</button>
        </div>
  
        {error && <p style={{ color: 'red' }}>{error}</p>}
  
        {clima && (
          <div className="tarjeta-clima">
            <h2>{clima.ciudad}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${clima.icono}@2x.png`}
              alt={clima.descripcion}
            />
            <p>{clima.descripcion}</p>
            <p><strong>{clima.temperatura}°C</strong></p>
            {clima.imagen && (
              <img
                src={clima.imagen}
                alt={`Vista de ${clima.ciudad}`}
                style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}
              />
            )}
          </div>
        )}
      </main>
  
      <footer>
        <p>Desarrollado como parte de un proyecto de PWA. 🌐</p>
      </footer>
    </div>
  );
}

export default App;
