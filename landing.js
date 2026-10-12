/* QR Dinámicos · tipos de QR y páginas de destino
 * Lo usan index.html (formularios + vista previa) y r.html (lo que ve quien escanea).
 * Expone window.Landing
 */
(function () {
'use strict';

/* ───────── tipos ───────── */
var COLOR = { k: 'color', l: 'Color de la página', t: 'color', def: '#4f46e5' };
var TYPES = [
  /* Web y enlaces */
  { id: 'url', cat: 'web', name: 'Sitio web', desc: 'Lleva a cualquier página web', icon: 'web', redirect: true,
    fields: [{ k: 'url', l: 'Dirección web', t: 'url', req: 1, ph: 'https://tuweb.com' }] },
  { id: 'enlaces', cat: 'web', name: 'Lista de enlaces', desc: 'Varios enlaces en una sola página', icon: 'links',
    fields: [{ k: 'titulo', l: 'Título', t: 'text', req: 1, ph: 'Mis enlaces' }, { k: 'desc', l: 'Descripción', t: 'textarea' },
      { k: 'img', l: 'Imagen o logo (enlace)', t: 'img' },
      { k: 'links', l: 'Enlaces', t: 'list', add: 'Añadir enlace', sub: [{ k: 'texto', l: 'Texto del botón', t: 'text', ph: 'Nuestra tienda' }, { k: 'url', l: 'Enlace', t: 'url', ph: 'https://…' }] }, COLOR] },
  { id: 'redes', cat: 'web', name: 'Redes sociales', desc: 'Todas tus redes en un solo QR', icon: 'social',
    fields: [{ k: 'titulo', l: 'Nombre', t: 'text', req: 1, ph: 'Mi negocio' }, { k: 'desc', l: 'Descripción', t: 'textarea' }, { k: 'img', l: 'Foto o logo (enlace)', t: 'img' },
      { k: 'instagram', l: 'Instagram', t: 'text', ph: '@usuario o enlace' }, { k: 'facebook', l: 'Facebook', t: 'text', ph: 'enlace o página' },
      { k: 'tiktok', l: 'TikTok', t: 'text', ph: '@usuario' }, { k: 'x', l: 'X / Twitter', t: 'text', ph: '@usuario' },
      { k: 'youtube', l: 'YouTube', t: 'text', ph: 'enlace del canal' }, { k: 'linkedin', l: 'LinkedIn', t: 'text', ph: 'enlace del perfil' },
      { k: 'whatsapp', l: 'WhatsApp', t: 'tel', ph: '+34 600 000 000' }, { k: 'telegram', l: 'Telegram', t: 'text', ph: '@usuario' },
      { k: 'web', l: 'Web', t: 'url', ph: 'https://…' }, COLOR] },
  { id: 'pdf', cat: 'web', name: 'PDF o archivo', desc: 'Abre un documento (catálogo, carta…)', icon: 'pdf', redirect: true,
    fields: [{ k: 'url', l: 'Enlace al archivo', t: 'url', req: 1, ph: 'https://drive.google.com/…', hint: 'Sube el PDF a Google Drive o Dropbox, compártelo como público y pega aquí el enlace.' }] },
  { id: 'apps', cat: 'web', name: 'Aplicación', desc: 'Envía a Google Play o App Store según el móvil', icon: 'app',
    fields: [{ k: 'nombre', l: 'Nombre de la app', t: 'text', req: 1 }, { k: 'android', l: 'Enlace Google Play', t: 'url', ph: 'https://play.google.com/…' },
      { k: 'ios', l: 'Enlace App Store', t: 'url', ph: 'https://apps.apple.com/…' }, { k: 'web', l: 'Web (para ordenadores)', t: 'url' }, { k: 'img', l: 'Icono (enlace)', t: 'img' }, COLOR] },
  /* Negocio */
  { id: 'empresa', cat: 'neg', name: 'Página de empresa', desc: 'Tu negocio: horario, contacto y ubicación', icon: 'shop',
    fields: [{ k: 'nombre', l: 'Nombre del negocio', t: 'text', req: 1 }, { k: 'eslogan', l: 'Eslogan', t: 'text' }, { k: 'logo', l: 'Logo (enlace)', t: 'img' },
      { k: 'portada', l: 'Foto de portada (enlace)', t: 'img' }, { k: 'desc', l: 'Sobre nosotros', t: 'textarea' },
      { k: 'tel', l: 'Teléfono', t: 'tel' }, { k: 'whatsapp', l: 'WhatsApp', t: 'tel' }, { k: 'email', l: 'Email', t: 'email' },
      { k: 'web', l: 'Web', t: 'url' }, { k: 'direccion', l: 'Dirección', t: 'text' },
      { k: 'horario', l: 'Horario', t: 'textarea', ph: 'Lunes a viernes: 9:00 – 20:00\nSábados: 10:00 – 14:00' }, COLOR] },
  { id: 'menu', cat: 'neg', name: 'Carta / Menú', desc: 'La carta de tu restaurante con precios', icon: 'menu',
    fields: [{ k: 'nombre', l: 'Restaurante', t: 'text', req: 1 }, { k: 'desc', l: 'Descripción', t: 'text', ph: 'Cocina mediterránea' }, { k: 'logo', l: 'Logo (enlace)', t: 'img' },
      { k: 'platos', l: 'Platos', t: 'list', add: 'Añadir plato', sub: [{ k: 'seccion', l: 'Sección', t: 'text', ph: 'Entrantes' }, { k: 'plato', l: 'Plato', t: 'text', ph: 'Croquetas caseras' }, { k: 'detalle', l: 'Descripción', t: 'text' }, { k: 'precio', l: 'Precio', t: 'text', ph: '8,50 €' }] },
      { k: 'nota', l: 'Nota al pie', t: 'text', ph: 'IVA incluido · Consulta alérgenos' }, COLOR] },
  { id: 'cupon', cat: 'neg', name: 'Cupón', desc: 'Descuentos y promociones', icon: 'coupon',
    fields: [{ k: 'negocio', l: 'Negocio', t: 'text', req: 1 }, { k: 'titulo', l: 'Oferta', t: 'text', req: 1, ph: '20% de descuento' },
      { k: 'desc', l: 'Descripción', t: 'textarea' }, { k: 'codigo', l: 'Código', t: 'text', ph: 'VERANO20' }, { k: 'caduca', l: 'Válido hasta', t: 'date' },
      { k: 'condiciones', l: 'Condiciones', t: 'textarea' }, { k: 'url', l: 'Enlace para canjear (opcional)', t: 'url' }, COLOR] },
  { id: 'evento', cat: 'neg', name: 'Evento', desc: 'Información e invitación con calendario', icon: 'event',
    fields: [{ k: 'titulo', l: 'Nombre del evento', t: 'text', req: 1 }, { k: 'organiza', l: 'Organiza', t: 'text' }, { k: 'fecha', l: 'Fecha', t: 'date', req: 1 },
      { k: 'hora', l: 'Hora de inicio', t: 'time' }, { k: 'horaFin', l: 'Hora de fin', t: 'time' }, { k: 'lugar', l: 'Lugar', t: 'text' },
      { k: 'desc', l: 'Descripción', t: 'textarea' }, { k: 'portada', l: 'Imagen (enlace)', t: 'img' }, { k: 'url', l: 'Entradas / más info', t: 'url' }, COLOR] },
  { id: 'resenas', cat: 'neg', name: 'Reseñas', desc: 'Pide valoraciones a tus clientes', icon: 'review', redirect: true,
    fields: [{ k: 'url', l: 'Enlace para dejar reseña', t: 'url', req: 1, hint: 'En tu Perfil de Empresa de Google: «Pedir reseñas» → copia el enlace.' }] },
  /* Contacto */
  { id: 'vcard', cat: 'con', name: 'Tarjeta de visita', desc: 'Tu contacto listo para guardar', icon: 'card',
    fields: [{ k: 'nombre', l: 'Nombre', t: 'text', req: 1 }, { k: 'apellidos', l: 'Apellidos', t: 'text' }, { k: 'foto', l: 'Foto (enlace)', t: 'img' },
      { k: 'empresa', l: 'Empresa', t: 'text' }, { k: 'cargo', l: 'Cargo', t: 'text' }, { k: 'movil', l: 'Móvil', t: 'tel' }, { k: 'tel', l: 'Teléfono fijo', t: 'tel' },
      { k: 'email', l: 'Email', t: 'email' }, { k: 'web', l: 'Web', t: 'url' }, { k: 'direccion', l: 'Dirección', t: 'text' }, { k: 'nota', l: 'Sobre mí', t: 'textarea' }, COLOR] },
  { id: 'whatsapp', cat: 'con', name: 'WhatsApp', desc: 'Abre un chat con el mensaje escrito', icon: 'chat', redirect: true,
    fields: [{ k: 'tel', l: 'Número de WhatsApp', t: 'tel', req: 1, ph: '+34 600 000 000' }, { k: 'msg', l: 'Mensaje', t: 'textarea', ph: 'Hola, quiero información…' }] },
  { id: 'llamada', cat: 'con', name: 'Llamada', desc: 'Llama a un número con un toque', icon: 'phone', redirect: true,
    fields: [{ k: 'tel', l: 'Teléfono', t: 'tel', req: 1 }] },
  { id: 'email', cat: 'con', name: 'Email', desc: 'Correo con asunto y texto preparados', icon: 'mail', redirect: true,
    fields: [{ k: 'email', l: 'Para', t: 'email', req: 1 }, { k: 'asunto', l: 'Asunto', t: 'text' }, { k: 'msg', l: 'Mensaje', t: 'textarea' }] },
  { id: 'sms', cat: 'con', name: 'SMS', desc: 'Mensaje de texto preparado', icon: 'sms', redirect: true,
    fields: [{ k: 'tel', l: 'Teléfono', t: 'tel', req: 1 }, { k: 'msg', l: 'Mensaje', t: 'textarea' }] },
  { id: 'ubicacion', cat: 'con', name: 'Ubicación', desc: 'Abre la dirección en el mapa', icon: 'pin', redirect: true,
    fields: [{ k: 'lugar', l: 'Dirección o lugar', t: 'text', req: 1, ph: 'Calle Mayor 1, Valencia' }] },
  /* Contenido */
  { id: 'wifi', cat: 'cont', name: 'Wi-Fi', desc: 'Comparte tu red y contraseña', icon: 'wifi',
    fields: [{ k: 'ssid', l: 'Nombre de la red', t: 'text', req: 1 }, { k: 'pass', l: 'Contraseña', t: 'text' },
      { k: 'cifrado', l: 'Seguridad', t: 'select', opts: [['WPA', 'WPA/WPA2/WPA3'], ['WEP', 'WEP'], ['nopass', 'Sin contraseña']] },
      { k: 'directo', l: 'Conexión directa: el móvil se conecta solo al escanear (este QR no se podrá cambiar ni contará escaneos)', t: 'check' }, COLOR] },
  { id: 'texto', cat: 'cont', name: 'Texto', desc: 'Un mensaje o información', icon: 'text',
    fields: [{ k: 'titulo', l: 'Título', t: 'text' }, { k: 'texto', l: 'Texto', t: 'textarea', req: 1 }, COLOR] },
  { id: 'video', cat: 'cont', name: 'Vídeo', desc: 'YouTube o vídeo propio', icon: 'video',
    fields: [{ k: 'titulo', l: 'Título', t: 'text' }, { k: 'url', l: 'Enlace del vídeo', t: 'url', req: 1, ph: 'https://youtube.com/watch?v=…' }, { k: 'desc', l: 'Descripción', t: 'textarea' }, COLOR] },
  { id: 'galeria', cat: 'cont', name: 'Galería de imágenes', desc: 'Varias fotos en una página', icon: 'image',
    fields: [{ k: 'titulo', l: 'Título', t: 'text', req: 1 }, { k: 'desc', l: 'Descripción', t: 'textarea' },
      { k: 'fotos', l: 'Imágenes', t: 'list', add: 'Añadir imagen', sub: [{ k: 'url', l: 'Enlace de la imagen', t: 'img' }, { k: 'pie', l: 'Pie de foto', t: 'text' }] }, COLOR] },
  { id: 'mp3', cat: 'cont', name: 'Audio / MP3', desc: 'Una canción, podcast o mensaje', icon: 'music',
    fields: [{ k: 'titulo', l: 'Título', t: 'text', req: 1 }, { k: 'artista', l: 'Artista / autor', t: 'text' }, { k: 'url', l: 'Enlace del audio (.mp3)', t: 'url', req: 1 },
      { k: 'portada', l: 'Portada (enlace)', t: 'img' }, COLOR] }
];
var CATS = [['web', 'Web y enlaces'], ['neg', 'Negocio'], ['con', 'Contacto'], ['cont', 'Contenido']];
var BYID = {}; TYPES.forEach(function (t) { BYID[t.id] = t; });

/* ───────── utilidades ───────── */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function str(v) { return String(v == null ? '' : v).trim(); }
function safeUrl(u) {
  u = str(u); if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u.replace(/^\/+/, '');
  return /^(https?:\/\/|mailto:|tel:|sms:)/i.test(u) ? u : '';
}
function safeImg(u) {
  u = str(u); if (!u) return '';
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(u)) return u;
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return /^https:\/\//i.test(u) ? u : '';
}
function phone(t) {
  var s = str(t).replace(/[^\d+]/g, '');
  if (!s) return '';
  if (s.indexOf('00') === 0) s = '+' + s.slice(2);
  if (s[0] !== '+' && /^[6789]\d{8}$/.test(s)) s = '+34' + s;
  return s;
}
function intl(t) { return phone(t).replace(/\D/g, ''); }
function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
function isDark(hex) {
  var h = String(hex || '#4f46e5').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
  var n = parseInt(h, 16) || 0, r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 < 160;
}
function ico(n, s) { return window.QRStyle ? QRStyle.icon(n, s || 20) : ''; }

/* destino directo (tipos que solo redirigen) */
function target(tipo, d) {
  d = d || {};
  switch (tipo) {
    case 'url': case 'pdf': case 'resenas': return safeUrl(d.url);
    case 'whatsapp': return intl(d.tel) ? 'https://wa.me/' + intl(d.tel) + (str(d.msg) ? '?text=' + encodeURIComponent(str(d.msg)) : '') : '';
    case 'llamada': return phone(d.tel) ? 'tel:' + phone(d.tel) : '';
    case 'sms': return phone(d.tel) ? 'sms:' + phone(d.tel) + (str(d.msg) ? '?body=' + encodeURIComponent(str(d.msg)) : '') : '';
    case 'email': {
      var e = str(d.email); if (!e) return '';
      var q = []; if (str(d.asunto)) q.push('subject=' + encodeURIComponent(str(d.asunto))); if (str(d.msg)) q.push('body=' + encodeURIComponent(str(d.msg)));
      return 'mailto:' + e + (q.length ? '?' + q.join('&') : '');
    }
    case 'ubicacion': return str(d.lugar) ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(d.lugar)) : '';
  }
  return null;
}
/* texto del QR estático de wifi */
function wifiString(d) {
  function e2(s) { return str(s).replace(/([\\;,:"])/g, '\\$1'); }
  var t = d.cifrado || 'WPA';
  return 'WIFI:T:' + t + ';S:' + e2(d.ssid) + ';' + (t === 'nopass' ? '' : 'P:' + e2(d.pass) + ';') + ';';
}
/* resumen corto para las tarjetas */
function summary(tipo, d) {
  d = d || {};
  var t = target(tipo, d); if (t) return t.replace(/^https?:\/\//, '');
  switch (tipo) {
    case 'vcard': return [d.nombre, d.apellidos].map(str).join(' ').trim() + (str(d.empresa) ? ' · ' + str(d.empresa) : '');
    case 'empresa': case 'menu': return str(d.nombre);
    case 'enlaces': return str(d.titulo) + ' · ' + ((d.links || []).length) + ' enlaces';
    case 'redes': return str(d.titulo);
    case 'wifi': return 'Red «' + str(d.ssid) + '»' + (d.directo ? ' · conexión directa' : '');
    case 'texto': return str(d.titulo) || str(d.texto).slice(0, 60);
    case 'cupon': return str(d.titulo) + (str(d.negocio) ? ' · ' + str(d.negocio) : '');
    case 'evento': return str(d.titulo) + (d.fecha ? ' · ' + fmtDate(d.fecha) : '');
    case 'galeria': return str(d.titulo) + ' · ' + ((d.fotos || []).length) + ' fotos';
    case 'apps': case 'video': case 'mp3': return str(d.nombre || d.titulo);
  }
  return '';
}
var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function fmtDate(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str(s)); if (!m) return str(s);
  return Number(m[3]) + ' de ' + MESES[Number(m[2]) - 1] + ' de ' + m[1];
}
function longDate(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str(s)); if (!m) return str(s);
  var dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  var w = DIAS[dt.getDay()]; return w.charAt(0).toUpperCase() + w.slice(1) + ', ' + fmtDate(s);
}

/* ───────── estilos de las páginas ───────── */
var CSS = '' +
'.lp{--c:#4f46e5;--on:#fff;--ink:#14161f;--mut:#667085;--bg:#f3f4f8;--card:#fff;--line:#e6e8ef;min-height:100%;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:left;padding-bottom:28px}' +
'.lp *{box-sizing:border-box}' +
'.lp-hero{position:relative;padding:34px 20px 70px;background:linear-gradient(140deg,var(--c),color-mix(in srgb,var(--c) 55%,#000));color:var(--on);text-align:center;overflow:hidden}' +
'.lp-hero.img{background-size:cover;background-position:center}' +
'.lp-hero.img:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.6))}' +
'.lp-hero>*{position:relative}' +
'.lp-hero:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.09);right:-80px;top:-120px}' +
'.lp-hero h1{margin:0;font-size:1.6rem;line-height:1.2;letter-spacing:-.01em}' +
'.lp-hero p{margin:6px 0 0;opacity:.88}' +
'.lp-av{width:96px;height:96px;border-radius:50%;margin:0 auto 14px;background:rgba(255,255,255,.18);display:grid;place-items:center;overflow:hidden;border:3px solid rgba(255,255,255,.65);box-shadow:0 10px 30px rgba(0,0,0,.2)}' +
'.lp-av img{width:100%;height:100%;object-fit:cover}.lp-av svg{width:44px;height:44px}' +
'.lp-body{max-width:520px;margin:-46px auto 0;padding:0 16px;position:relative;display:flex;flex-direction:column;gap:12px}' +
'.lp-card{background:var(--card);border-radius:18px;padding:16px;box-shadow:0 2px 6px rgba(16,24,40,.05),0 12px 30px rgba(16,24,40,.08);animation:lpUp .5s both}' +
'.lp-card h2{font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin:0 0 8px}' +
'.lp-body>*:nth-child(2){animation-delay:.06s}.lp-body>*:nth-child(3){animation-delay:.12s}.lp-body>*:nth-child(4){animation-delay:.18s}.lp-body>*:nth-child(5){animation-delay:.24s}.lp-body>*:nth-child(n+6){animation-delay:.3s}' +
'@keyframes lpUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}' +
'.lp-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(60px,1fr));gap:8px}' +
'.lp-act{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;border-radius:14px;background:color-mix(in srgb,var(--c) 9%,#fff);color:var(--c);text-decoration:none;font-size:12.5px;font-weight:700;transition:transform .15s}' +
'.lp-act:active{transform:scale(.95)}' +
'.lp-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px 16px;border-radius:14px;background:var(--c);color:var(--on);font-weight:700;text-decoration:none;border:0;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 8px 20px color-mix(in srgb,var(--c) 35%,transparent);transition:transform .15s,filter .15s}' +
'.lp-btn:hover{filter:brightness(1.07)}.lp-btn:active{transform:scale(.98)}' +
'.lp-btn.ghost{background:color-mix(in srgb,var(--c) 10%,#fff);color:var(--c);box-shadow:none}' +
'.lp-row{display:flex;gap:12px;align-items:center;padding:11px 2px;border-top:1px solid var(--line);color:inherit;text-decoration:none}' +
'.lp-row:first-of-type{border-top:0}' +
'.lp-row .i{width:38px;height:38px;flex:0 0 38px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 10%,#fff);color:var(--c)}' +
'.lp-row small{display:block;color:var(--mut);font-size:12px}.lp-row b{font-weight:600;word-break:break-word}' +
'.lp-links{display:flex;flex-direction:column;gap:10px}' +
'.lp-link{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:var(--card);color:var(--ink);text-decoration:none;font-weight:700;box-shadow:0 2px 6px rgba(16,24,40,.05),0 8px 22px rgba(16,24,40,.07);border:1px solid var(--line);transition:transform .15s,border-color .15s;animation:lpUp .5s both}' +
'.lp-link:hover{border-color:var(--c);transform:translateY(-1px)}' +
'.lp-link .i{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--c);color:var(--on);flex:0 0 36px}' +
'.lp-link span{flex:1}.lp-link .ar{opacity:.4}' +
'.lp-txt{white-space:normal;word-break:break-word}' +
'.lp-ft{text-align:center;color:var(--mut);font-size:12px;margin-top:22px}' +
'.lp-coupon{position:relative;background:var(--card);border-radius:20px;overflow:hidden;box-shadow:0 12px 30px rgba(16,24,40,.12);animation:lpUp .5s both}' +
'.lp-coupon .top{padding:22px 20px 18px;text-align:center;background:linear-gradient(140deg,var(--c),color-mix(in srgb,var(--c) 60%,#000));color:var(--on)}' +
'.lp-coupon .big{font-size:2rem;font-weight:900;line-height:1.1;letter-spacing:-.01em}' +
'.lp-coupon .cut{height:0;border-top:2px dashed var(--line);margin:0 18px;position:relative}' +
'.lp-coupon .cut:before,.lp-coupon .cut:after{content:"";position:absolute;top:-12px;width:24px;height:24px;border-radius:50%;background:var(--bg)}' +
'.lp-coupon .cut:before{left:-30px}.lp-coupon .cut:after{right:-30px}' +
'.lp-coupon .bot{padding:18px 20px;text-align:center}' +
'.lp-code{position:relative;display:inline-block;margin:6px 0 10px;padding:12px 22px;border:2px dashed var(--c);border-radius:12px;font:800 1.35rem ui-monospace,Menlo,monospace;letter-spacing:.12em;color:var(--c);cursor:pointer;overflow:hidden;min-width:180px}' +
'.lp-code .cover{position:absolute;inset:0;display:grid;place-items:center;background:repeating-linear-gradient(45deg,var(--c),var(--c) 10px,color-mix(in srgb,var(--c) 80%,#fff) 10px,color-mix(in srgb,var(--c) 80%,#fff) 20px);color:var(--on);font:700 14px system-ui,sans-serif;letter-spacing:0;transition:transform .5s cubic-bezier(.6,-0.3,.4,1.3),opacity .5s}' +
'.lp-code.on .cover{transform:translateY(-110%) rotate(-8deg);opacity:0}' +
'.lp-menu h3{margin:16px 0 6px;font-size:1.05rem;color:var(--c)}.lp-menu h3:first-child{margin-top:0}' +
'.lp-dish{display:flex;gap:10px;padding:9px 0;border-bottom:1px dashed var(--line)}.lp-dish:last-child{border-bottom:0}' +
'.lp-dish div{flex:1}.lp-dish small{display:block;color:var(--mut);font-size:13px}.lp-dish b{white-space:nowrap;font-weight:800}' +
'.lp-date{display:flex;gap:14px;align-items:center}' +
'.lp-cal{width:62px;flex:0 0 62px;border-radius:14px;overflow:hidden;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.08);border:1px solid var(--line)}' +
'.lp-cal i{display:block;background:var(--c);color:var(--on);font:700 11px system-ui;text-transform:uppercase;padding:3px 0;font-style:normal}' +
'.lp-cal b{display:block;font-size:1.6rem;line-height:1.3;padding:2px 0}' +
'.lp-gal{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}' +
'.lp-gal figure{margin:0;border-radius:14px;overflow:hidden;background:var(--line);aspect-ratio:1;position:relative;cursor:zoom-in;animation:lpUp .5s both}' +
'.lp-gal img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}.lp-gal figure:hover img{transform:scale(1.05)}' +
'.lp-gal figcaption{position:absolute;left:0;right:0;bottom:0;padding:16px 8px 6px;color:#fff;font-size:12px;background:linear-gradient(transparent,rgba(0,0,0,.6))}' +
'.lp-box{position:fixed;inset:0;background:rgba(0,0,0,.9);display:grid;place-items:center;z-index:99;padding:16px;cursor:zoom-out}.lp-box img{max-width:100%;max-height:90vh;border-radius:8px}' +
'.lp-vid{position:relative;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:16/9}.lp-vid iframe,.lp-vid video{position:absolute;inset:0;width:100%;height:100%;border:0}' +
'.lp-player{text-align:center}.lp-cover{width:220px;height:220px;max-width:70vw;max-height:70vw;margin:0 auto 16px;border-radius:22px;overflow:hidden;background:linear-gradient(140deg,var(--c),#000);display:grid;place-items:center;color:#fff;box-shadow:0 20px 40px rgba(0,0,0,.25)}' +
'.lp-cover img{width:100%;height:100%;object-fit:cover}.lp-cover svg{width:80px;height:80px;opacity:.85}' +
'.lp-player audio{width:100%;margin-top:12px}' +
'.lp-wifi{text-align:center}.lp-wifi .net{font-size:1.4rem;font-weight:800;margin:4px 0 12px;word-break:break-all}' +
'.lp-pass{display:flex;align-items:center;gap:8px;background:var(--bg);border-radius:12px;padding:10px 12px;margin-bottom:12px}.lp-pass code{flex:1;font:700 1.05rem ui-monospace,Menlo,monospace;word-break:break-all;text-align:left}' +
'.lp-pass button{border:0;background:var(--c);color:var(--on);border-radius:10px;padding:8px 12px;font:600 13px system-ui;cursor:pointer}' +
'.lp-steps{text-align:left;margin:8px 0 0;padding-left:20px;color:var(--mut);font-size:14px}.lp-steps li{margin:4px 0}' +
'.lp-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#14161f;color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;z-index:100;animation:lpUp .25s}' +
'.lp-mut{color:var(--mut)}.lp-center{text-align:center}' +
'.lp .ic{display:block}';

/* ───────── piezas ───────── */
function hero(o) {
  var cls = 'lp-hero' + (o.cover ? ' img' : '');
  var st = o.cover ? ' style="background-image:url(\'' + esc(o.cover) + '\')"' : '';
  var av = o.noAvatar ? '' : '<div class="lp-av">' + (o.img ? '<img src="' + esc(o.img) + '" alt="">' : ico(o.icon || 'user', 44)) + '</div>';
  return '<header class="' + cls + '"' + st + '>' + av + '<h1>' + esc(o.title || '') + '</h1>' + (o.sub ? '<p>' + esc(o.sub) + '</p>' : '') + '</header>';
}
function row(icon, label, value, href) {
  var tag = href ? 'a href="' + esc(href) + '" target="_blank" rel="noopener"' : 'div';
  return '<' + tag + ' class="lp-row"><span class="i">' + ico(icon, 18) + '</span><span><small>' + esc(label) + '</small><b>' + esc(value) + '</b></span></' + (href ? 'a' : 'div') + '>';
}
function act(icon, label, href, data) {
  return '<a class="lp-act" ' + (href ? 'href="' + esc(href) + '" target="_blank" rel="noopener"' : 'href="#" ' + data) + '>' + ico(icon, 22) + label + '</a>';
}
function socialUrl(k, v) {
  v = str(v); if (!v) return '';
  if (/^https?:\/\//i.test(v) || /\.[a-z]{2,}\//i.test(v)) return safeUrl(v);
  var u = v.replace(/^@/, '');
  switch (k) {
    case 'instagram': return 'https://instagram.com/' + encodeURIComponent(u);
    case 'facebook': return 'https://facebook.com/' + encodeURIComponent(u);
    case 'tiktok': return 'https://www.tiktok.com/@' + encodeURIComponent(u);
    case 'x': return 'https://x.com/' + encodeURIComponent(u);
    case 'youtube': return 'https://youtube.com/@' + encodeURIComponent(u);
    case 'linkedin': return 'https://www.linkedin.com/in/' + encodeURIComponent(u);
    case 'telegram': return 'https://t.me/' + encodeURIComponent(u);
    case 'whatsapp': return intl(v) ? 'https://wa.me/' + intl(v) : '';
    case 'web': return safeUrl(v);
  }
  return '';
}
var SOC = [['instagram', 'Instagram', 'image'], ['facebook', 'Facebook', 'social'], ['tiktok', 'TikTok', 'music'], ['x', 'X', 'chat'], ['youtube', 'YouTube', 'video'],
  ['linkedin', 'LinkedIn', 'card'], ['whatsapp', 'WhatsApp', 'chat'], ['telegram', 'Telegram', 'share'], ['web', 'Página web', 'web']];

function ytId(u) {
  var m = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i.exec(str(u));
  return m ? m[1] : '';
}

/* ───────── render por tipo ───────── */
function render(tipo, d, opts) {
  d = d || {}; opts = opts || {};
  var c = /^#[0-9a-f]{3,6}$/i.test(str(d.color)) ? str(d.color) : '#4f46e5';
  var on = isDark(c) ? '#ffffff' : '#14161f';
  var h = '', body = '';
  var T = BYID[tipo] || BYID.url;
  var dir = target(tipo, d);

  switch (tipo) {
    case 'vcard': {
      var nom = (str(d.nombre) + ' ' + str(d.apellidos)).trim();
      h = hero({ title: nom || 'Tu nombre', sub: [str(d.cargo), str(d.empresa)].filter(Boolean).join(' · '), img: safeImg(d.foto) });
      var acts = '';
      if (phone(d.movil || d.tel)) acts += act('phone', 'Llamar', 'tel:' + phone(d.movil || d.tel));
      if (str(d.email)) acts += act('mail', 'Email', 'mailto:' + str(d.email));
      if (safeUrl(d.web)) acts += act('web', 'Web', safeUrl(d.web));
      if (str(d.direccion)) acts += act('pin', 'Mapa', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(d.direccion)));
      body += '<div class="lp-card"><button class="lp-btn" data-lp="vcf">' + ico('down', 20) + 'Guardar contacto</button>' + (acts ? '<div class="lp-acts" style="margin-top:12px">' + acts + '</div>' : '') + '</div>';
      var rows = '';
      if (phone(d.movil)) rows += row('phone', 'Móvil', str(d.movil), 'tel:' + phone(d.movil));
      if (phone(d.tel)) rows += row('phone', 'Teléfono', str(d.tel), 'tel:' + phone(d.tel));
      if (str(d.email)) rows += row('mail', 'Email', str(d.email), 'mailto:' + str(d.email));
      if (safeUrl(d.web)) rows += row('web', 'Web', str(d.web).replace(/^https?:\/\//, ''), safeUrl(d.web));
      if (str(d.direccion)) rows += row('pin', 'Dirección', str(d.direccion), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(d.direccion)));
      if (rows) body += '<div class="lp-card"><h2>Contacto</h2>' + rows + '</div>';
      if (str(d.nota)) body += '<div class="lp-card"><h2>Sobre mí</h2><div class="lp-txt">' + nl2br(d.nota) + '</div></div>';
      break;
    }
    case 'empresa': {
      h = hero({ title: str(d.nombre) || 'Tu negocio', sub: str(d.eslogan), img: safeImg(d.logo), icon: 'shop', cover: safeImg(d.portada) });
      var a2 = '';
      if (phone(d.tel)) a2 += act('phone', 'Llamar', 'tel:' + phone(d.tel));
      if (intl(d.whatsapp)) a2 += act('chat', 'WhatsApp', 'https://wa.me/' + intl(d.whatsapp));
      if (str(d.direccion)) a2 += act('pin', 'Cómo llegar', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(d.direccion)));
      if (safeUrl(d.web)) a2 += act('web', 'Web', safeUrl(d.web));
      if (str(d.email)) a2 += act('mail', 'Email', 'mailto:' + str(d.email));
      if (a2) body += '<div class="lp-card"><div class="lp-acts">' + a2 + '</div></div>';
      if (str(d.desc)) body += '<div class="lp-card"><h2>Sobre nosotros</h2><div class="lp-txt">' + nl2br(d.desc) + '</div></div>';
      if (str(d.horario)) body += '<div class="lp-card"><h2>Horario</h2><div class="lp-txt">' + nl2br(d.horario) + '</div></div>';
      var r2 = '';
      if (str(d.direccion)) r2 += row('pin', 'Dirección', str(d.direccion), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(d.direccion)));
      if (phone(d.tel)) r2 += row('phone', 'Teléfono', str(d.tel), 'tel:' + phone(d.tel));
      if (str(d.email)) r2 += row('mail', 'Email', str(d.email), 'mailto:' + str(d.email));
      if (r2) body += '<div class="lp-card"><h2>Contacto</h2>' + r2 + '</div>';
      break;
    }
    case 'enlaces': {
      h = hero({ title: str(d.titulo) || 'Mis enlaces', sub: str(d.desc), img: safeImg(d.img), icon: 'links' });
      var ls = (d.links || []).filter(function (l) { return safeUrl(l.url); });
      body += '<div class="lp-links">' + (ls.length ? ls.map(function (l, i) {
        return '<a class="lp-link" style="animation-delay:' + (i * 0.05) + 's" href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener"><span class="i">' + ico('links', 18) + '</span><span>' + esc(str(l.texto) || safeUrl(l.url).replace(/^https?:\/\//, '')) + '</span><span class="ar">' + ico('next', 18) + '</span></a>';
      }).join('') : '<div class="lp-card lp-center lp-mut">Añade tus enlaces</div>') + '</div>';
      break;
    }
    case 'redes': {
      h = hero({ title: str(d.titulo) || 'Síguenos', sub: str(d.desc), img: safeImg(d.img), icon: 'social' });
      var ss = SOC.filter(function (s) { return socialUrl(s[0], d[s[0]]); });
      body += '<div class="lp-links">' + (ss.length ? ss.map(function (s, i) {
        return '<a class="lp-link" style="animation-delay:' + (i * 0.05) + 's" href="' + esc(socialUrl(s[0], d[s[0]])) + '" target="_blank" rel="noopener"><span class="i">' + ico(s[2], 18) + '</span><span>' + s[1] + '</span><span class="ar">' + ico('next', 18) + '</span></a>';
      }).join('') : '<div class="lp-card lp-center lp-mut">Añade tus redes</div>') + '</div>';
      break;
    }
    case 'menu': {
      h = hero({ title: str(d.nombre) || 'Nuestra carta', sub: str(d.desc), img: safeImg(d.logo), icon: 'menu' });
      var secs = [], by = {};
      (d.platos || []).forEach(function (p) {
        if (!str(p.plato)) return;
        var s = str(p.seccion) || 'Carta';
        if (!by[s]) { by[s] = []; secs.push(s); }
        by[s].push(p);
      });
      body += '<div class="lp-card lp-menu">' + (secs.length ? secs.map(function (s) {
        return '<h3>' + esc(s) + '</h3>' + by[s].map(function (p) {
          return '<div class="lp-dish"><div>' + esc(p.plato) + (str(p.detalle) ? '<small>' + esc(p.detalle) + '</small>' : '') + '</div><b>' + esc(p.precio) + '</b></div>';
        }).join('');
      }).join('') : '<p class="lp-mut lp-center">Añade los platos de tu carta</p>') + '</div>';
      if (str(d.nota)) body += '<p class="lp-mut lp-center" style="font-size:13px;margin:0">' + esc(d.nota) + '</p>';
      break;
    }
    case 'cupon': {
      h = hero({ title: str(d.negocio) || 'Tu negocio', noAvatar: true });
      var code = str(d.codigo);
      body += '<div class="lp-coupon"><div class="top"><div class="big">' + esc(str(d.titulo) || '20% DTO') + '</div>' + (str(d.desc) ? '<p style="margin:8px 0 0;opacity:.9">' + nl2br(d.desc) + '</p>' : '') + '</div><div class="cut"></div><div class="bot">' +
        (code ? '<div class="lp-mut" style="font-size:13px">Tu código</div><div class="lp-code" data-lp="reveal" data-code="' + esc(code) + '">' + esc(code) + '<span class="cover">Toca para descubrir</span></div>' : '') +
        (d.caduca ? '<div class="lp-mut" style="font-size:13px">Válido hasta el ' + esc(fmtDate(d.caduca)) + '</div>' : '') +
        (safeUrl(d.url) ? '<a class="lp-btn" style="margin-top:14px" href="' + esc(safeUrl(d.url)) + '" target="_blank" rel="noopener">Canjear ahora</a>' : '') + '</div></div>';
      if (str(d.condiciones)) body += '<div class="lp-card"><h2>Condiciones</h2><div class="lp-txt lp-mut" style="font-size:14px">' + nl2br(d.condiciones) + '</div></div>';
      break;
    }
    case 'evento': {
      h = hero({ title: str(d.titulo) || 'Tu evento', sub: str(d.organiza) ? 'Organiza: ' + str(d.organiza) : '', icon: 'event', cover: safeImg(d.portada) });
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str(d.fecha));
      body += '<div class="lp-card"><div class="lp-date"><div class="lp-cal"><i>' + (m ? MESES[Number(m[2]) - 1].slice(0, 3) : '—') + '</i><b>' + (m ? Number(m[3]) : '?') + '</b></div><div><b>' + esc(longDate(d.fecha)) + '</b><div class="lp-mut">' +
        esc([str(d.hora), str(d.horaFin)].filter(Boolean).join(' – ')) + '</div></div></div>' +
        '<div style="display:grid;gap:8px;margin-top:14px"><button class="lp-btn" data-lp="ics">' + ico('event', 20) + 'Añadir al calendario</button>' +
        (safeUrl(d.url) ? '<a class="lp-btn ghost" href="' + esc(safeUrl(d.url)) + '" target="_blank" rel="noopener">Entradas / más información</a>' : '') + '</div></div>';
      if (str(d.lugar)) body += '<div class="lp-card"><h2>Lugar</h2>' + row('pin', 'Cómo llegar', str(d.lugar), 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(str(d.lugar))) + '</div>';
      if (str(d.desc)) body += '<div class="lp-card"><h2>Información</h2><div class="lp-txt">' + nl2br(d.desc) + '</div></div>';
      break;
    }
    case 'wifi': {
      h = hero({ title: 'Red Wi-Fi', sub: 'Conéctate en un momento', icon: 'wifi' });
      var nop = d.cifrado === 'nopass';
      body += '<div class="lp-card lp-wifi"><div class="lp-mut" style="font-size:13px">Nombre de la red</div><div class="net">' + esc(str(d.ssid) || 'MiWifi') + '</div>' +
        (nop ? '<p class="lp-mut">Red abierta, sin contraseña.</p>' : '<div class="lp-pass"><code>' + esc(str(d.pass) || '••••••••') + '</code><button data-lp="copy" data-v="' + esc(str(d.pass)) + '">Copiar</button></div>') +
        '<ol class="lp-steps"><li>Copia la contraseña.</li><li>Abre los <b>Ajustes de Wi-Fi</b> del móvil.</li><li>Elige «' + esc(str(d.ssid)) + '» y pega la contraseña.</li></ol></div>';
      break;
    }
    case 'texto':
      h = hero({ title: str(d.titulo) || 'Mensaje', icon: 'text' });
      body += '<div class="lp-card"><div class="lp-txt" style="font-size:16px">' + (str(d.texto) ? nl2br(d.texto) : '<span class="lp-mut">Escribe tu texto</span>') + '</div>' +
        (str(d.texto) ? '<button class="lp-btn ghost" style="margin-top:14px" data-lp="copy" data-v="' + esc(str(d.texto)) + '">' + ico('copy', 18) + 'Copiar texto</button>' : '') + '</div>';
      break;
    case 'video': {
      h = hero({ title: str(d.titulo) || 'Vídeo', icon: 'video', noAvatar: true });
      var id = ytId(d.url), vu = safeUrl(d.url);
      var player = id ? '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(id) + '?rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
        : (vu ? '<video src="' + esc(vu) + '" controls playsinline></video>' : '');
      body += '<div class="lp-card" style="padding:8px"><div class="lp-vid">' + player + '</div></div>';
      if (str(d.desc)) body += '<div class="lp-card"><div class="lp-txt">' + nl2br(d.desc) + '</div></div>';
      if (vu && !id) body += '<a class="lp-btn ghost" href="' + esc(vu) + '" target="_blank" rel="noopener">Abrir vídeo</a>';
      break;
    }
    case 'galeria': {
      h = hero({ title: str(d.titulo) || 'Galería', sub: str(d.desc), icon: 'image', noAvatar: true });
      var fs = (d.fotos || []).filter(function (p) { return safeImg(p.url); });
      body += fs.length ? '<div class="lp-gal">' + fs.map(function (p, i) {
        return '<figure data-lp="zoom" data-src="' + esc(safeImg(p.url)) + '" style="animation-delay:' + (i * 0.05) + 's"><img loading="lazy" src="' + esc(safeImg(p.url)) + '" alt="">' + (str(p.pie) ? '<figcaption>' + esc(p.pie) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div>' : '<div class="lp-card lp-center lp-mut">Añade tus imágenes</div>';
      break;
    }
    case 'mp3': {
      h = hero({ title: '', noAvatar: true });
      var cv = safeImg(d.portada), au = safeUrl(d.url);
      body += '<div class="lp-card lp-player"><div class="lp-cover">' + (cv ? '<img src="' + esc(cv) + '" alt="">' : ico('music', 80)) + '</div><b style="font-size:1.2rem">' + esc(str(d.titulo) || 'Título') + '</b><div class="lp-mut">' + esc(d.artista) + '</div>' +
        (au ? '<audio controls preload="none" src="' + esc(au) + '"></audio>' : '') + '</div>';
      break;
    }
    case 'apps': {
      h = hero({ title: str(d.nombre) || 'Nuestra app', sub: 'Descárgala gratis', img: safeImg(d.img), icon: 'app' });
      var b = '';
      if (safeUrl(d.android)) b += '<a class="lp-btn" href="' + esc(safeUrl(d.android)) + '">' + ico('down', 20) + 'Google Play</a>';
      if (safeUrl(d.ios)) b += '<a class="lp-btn" href="' + esc(safeUrl(d.ios)) + '">' + ico('down', 20) + 'App Store</a>';
      if (safeUrl(d.web)) b += '<a class="lp-btn ghost" href="' + esc(safeUrl(d.web)) + '">' + ico('web', 20) + 'Versión web</a>';
      body += '<div class="lp-card" style="display:grid;gap:10px">' + (b || '<p class="lp-mut lp-center">Añade los enlaces de las tiendas</p>') + '</div>';
      break;
    }
    default: {
      /* tipos de redirección: vista previa */
      h = hero({ title: T.name, sub: 'Al escanear se abrirá directamente:', icon: T.icon });
      body += '<div class="lp-card lp-center"><div class="lp-txt" style="font-weight:700;word-break:break-all">' + esc(dir ? dir.replace(/^https?:\/\//, '') : 'Completa los datos') + '</div>' +
        (opts.preview ? '' : (dir ? '<a class="lp-btn" style="margin-top:14px" href="' + esc(dir) + '">Abrir</a>' : '')) + '</div>';
    }
  }
  return '<div class="lp" style="--c:' + c + ';--on:' + on + '">' + h + '<main class="lp-body">' + body + '</main><div class="lp-ft">' + (opts.preview ? 'Vista previa' : 'QR dinámico') + '</div></div>';
}

/* ───────── interacciones de la página ───────── */
function bind(root, tipo, d) {
  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-lp]'); if (!el) return;
    var k = el.getAttribute('data-lp');
    if (k === 'reveal') { el.classList.add('on'); return; }
    e.preventDefault();
    if (k === 'copy') copy(el.getAttribute('data-v'));
    else if (k === 'zoom') {
      var bx = document.createElement('div'); bx.className = 'lp-box';
      bx.innerHTML = '<img src="' + esc(el.getAttribute('data-src')) + '" alt="">';
      bx.onclick = function () { bx.remove(); }; document.body.appendChild(bx);
    } else if (k === 'vcf') download(vcf(d), fileName(str(d.nombre) || 'contacto') + '.vcf', 'text/vcard');
    else if (k === 'ics') download(ics(d), fileName(str(d.titulo) || 'evento') + '.ics', 'text/calendar');
  });
}
function fileName(s) { return s.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, '-').replace(/^-|-$/g, '') || 'archivo'; }
function toast(t) { var x = document.createElement('div'); x.className = 'lp-toast'; x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.remove(); }, 2200); }
function copy(t) {
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast('Copiado'); }, function () { toast('No se pudo copiar'); });
  else toast(t);
}
function download(text, name, type) {
  var blob = new Blob([text], { type: type + ';charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}
function vEsc(s) { return str(s).replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n'); }
function vcf(d) {
  var L = ['BEGIN:VCARD', 'VERSION:3.0', 'N:' + vEsc(d.apellidos) + ';' + vEsc(d.nombre) + ';;;', 'FN:' + vEsc((str(d.nombre) + ' ' + str(d.apellidos)).trim())];
  if (str(d.empresa)) L.push('ORG:' + vEsc(d.empresa));
  if (str(d.cargo)) L.push('TITLE:' + vEsc(d.cargo));
  if (phone(d.movil)) L.push('TEL;TYPE=CELL:' + phone(d.movil));
  if (phone(d.tel)) L.push('TEL;TYPE=WORK:' + phone(d.tel));
  if (str(d.email)) L.push('EMAIL:' + vEsc(d.email));
  if (safeUrl(d.web)) L.push('URL:' + safeUrl(d.web));
  if (str(d.direccion)) L.push('ADR:;;' + vEsc(d.direccion) + ';;;;');
  if (str(d.nota)) L.push('NOTE:' + vEsc(d.nota));
  L.push('END:VCARD');
  return L.join('\r\n');
}
function ics(d) {
  var day = str(d.fecha).replace(/-/g, '');
  function t(h) { return str(h).replace(':', '') + '00'; }
  var allDay = !str(d.hora);
  var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QR Dinamicos//ES', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@qrdinamicos',
    allDay ? 'DTSTART;VALUE=DATE:' + day : 'DTSTART:' + day + 'T' + t(d.hora)];
  if (!allDay && str(d.horaFin)) L.push('DTEND:' + day + 'T' + t(d.horaFin));
  L.push('SUMMARY:' + vEsc(d.titulo));
  if (str(d.lugar)) L.push('LOCATION:' + vEsc(d.lugar));
  if (str(d.desc)) L.push('DESCRIPTION:' + vEsc(d.desc));
  if (safeUrl(d.url)) L.push('URL:' + safeUrl(d.url));
  L.push('END:VEVENT', 'END:VCALENDAR');
  return L.join('\r\n');
}

var cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
}

window.Landing = {
  TYPES: TYPES, CATS: CATS, BYID: BYID,
  target: target, wifiString: wifiString, summary: summary, render: render, bind: bind, css: CSS, injectCss: injectCss,
  safeUrl: safeUrl, safeImg: safeImg, esc: esc
};
})();
