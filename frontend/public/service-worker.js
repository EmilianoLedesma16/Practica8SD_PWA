const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/', // Página principal
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
];
const FALLBACK_HTML = '/offline.html';

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Archivos en caché');
      return cache.addAll(urlsToCache).then(() => cache.add(FALLBACK_HTML));
    })
  );
});

// Interceptar solicitudes de red
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/clima')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              console.log('Guardando en caché:', event.request.url);
              cache.put(event.request, response.clone()); // Almacena la respuesta completa en el caché
            } else{
              console.log('Respuesta no válida, no se almacena en caché:', response);
            }
            return response;
          })
          .catch(() => {
            console.log('No hay conexión. Intentando cargar desde el caché:', event.request.url);
            return cache.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse; // Devuelve la respuesta almacenada en el caché
              } else {
                console.log('No hay datos en caché para:', event.request.url);
                return new Response(
                  JSON.stringify({ error: 'No hay datos en caché para esta ciudad.' }),
                  { headers: { 'Content-Type': 'application/json' } }
                );
              }
            });
          });
      })
    );
  } else if (event.request.destination === 'image') {
    // Manejar solicitudes de imágenes dinámicas
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse; // Devuelve la imagen almacenada en el caché
          }
          return fetch(event.request).then((response) => {
            cache.put(event.request, response.clone()); // Almacena la imagen en el caché
            return response;
          });
        });
      })
    );
  } else {
    // Manejar solicitudes normales
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => caches.match(FALLBACK_HTML));
      })
    );
  }
});

// Actualización del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});