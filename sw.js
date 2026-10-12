// Service worker: permite instalar la app y abrirla aunque falle la red.
// NO toca r.html (la redirección del QR) ni las llamadas a la API.
const VER = 'qrdin-v3';
const SHELL = ['./', 'index.html', 'app.js', 'qr.js', 'qrstyle.js', 'landing.js', 'config.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\/r\.html$/.test(url.pathname)) return;
  e.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VER).then(function (c) { c.put(req, copy); });
        }
        return res;
      })
      .catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); })
  );
});
