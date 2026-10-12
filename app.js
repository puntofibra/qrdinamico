/* QR Dinámicos · app (panel de cliente, asistente de creación y panel de admin) */
(function () {
'use strict';

/* ───────── utilidades ───────── */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var API = (window.CFG && window.CFG.API) || '';
var TOK_KEY = 'qrdin_tok';
var token = ls_get(TOK_KEY);
var S = { rol: null, nombre: '', cli: null, qrs: [], clientes: [], resumen: null, filtro: '' };
var I = QRStyle.icon, L = Landing, T = L.BYID;

function ls_get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function ls_set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function esc(s) { return L.esc(s); }
function clone(o) { return JSON.parse(JSON.stringify(o || {})); }
function fmtDate(d) { return d ? d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : '—'; }
function todayStr() { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); }
function addDays(ds, n) { var p = ds.split('-').map(Number); var d = new Date(Date.UTC(p[0], p[1] - 1, p[2])); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function fname(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr'; }
function icons(root) { $$('.ii[data-i]', root).forEach(function (s) { s.outerHTML = I(s.getAttribute('data-i'), 18); }); }
function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }

var toastT;
function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2800); }
function busy(on) { $('#busy').classList.toggle('on', !!on); }
function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { toast('Copiado'); }, fallback);
  fallback();
  function fallback() {
    var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); toast('Copiado'); } catch (e) { toast('No se pudo copiar'); }
    t.remove();
  }
}
function countUp(el, to) {
  if (!el) return; to = Number(to) || 0; var t0 = performance.now(), d = 900;
  (function step(t) { var p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
}

/* confeti */
function confetti() {
  var c = $('#confetti'), g = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight;
  var cols = ['#4f46e5', '#9333ea', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'], P = [];
  for (var i = 0; i < 140; i++) P.push({ x: W / 2 + (Math.random() - .5) * 120, y: H * 0.45, vx: (Math.random() - .5) * 16, vy: -Math.random() * 15 - 4, r: Math.random() * 6 + 4, c: cols[i % 6], a: Math.random() * 6, va: (Math.random() - .5) * .4 });
  var t0 = performance.now();
  (function fr(t) {
    g.clearRect(0, 0, W, H);
    P.forEach(function (p) { p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); });
    if (t - t0 < 2200) requestAnimationFrame(fr); else g.clearRect(0, 0, W, H);
  })(t0);
}

/* ───────── API ───────── */
function post(action, data) {
  if (!/^https:\/\//.test(API)) return Promise.reject(new Error('Falta configurar la URL del servidor en config.js'));
  var body = Object.assign({ action: action, token: token }, data || {});
  return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
}
function api(action, data) {
  return post(action, data).then(function (j) {
    if (j && j.auth) { doLogout(); throw new Error('Tu sesión ha caducado. Entra de nuevo.'); }
    if (!j || !j.ok) throw new Error((j && j.error) || 'Error del servidor');
    return j;
  });
}
function run(fn) {
  busy(true);
  return Promise.resolve().then(fn).catch(function (e) { toast(e.message || 'Error'); throw e; })
    .then(function (v) { busy(false); return v; }, function (e) { busy(false); throw e; });
}

/* ───────── modales ───────── */
function modal(html) {
  var m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = '<div class="sheet">' + html + '</div>';
  m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
  document.body.appendChild(m); document.body.classList.add('lock'); icons(m);
  return m;
}
function closeModal(m) { m.remove(); if (!document.querySelector('.modal') && $('#studio').classList.contains('hide')) document.body.classList.remove('lock'); }
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  var ms = document.querySelectorAll('.modal'); if (ms.length) closeModal(ms[ms.length - 1]);
  else if (!$('#studio').classList.contains('hide')) closeStudio();
});

/* ───────── QR ───────── */
function shortUrl(id) { var base = location.href.split('#')[0].split('?')[0].replace(/[^\/]*$/, ''); return base + 'r.html?q=' + id; }
function normQ(q) {
  q.tipo = q.tipo || 'url';
  if (!q.datos || typeof q.datos !== 'object') q.datos = {};
  if (q.tipo === 'url' && !q.datos.url) q.datos.url = q.destino;
  if (!q.estilo || typeof q.estilo !== 'object') q.estilo = {};
  return q;
}
function isDirect(tipo, d) { return tipo === 'wifi' && d && d.directo; }
function qrText(q) { return isDirect(q.tipo, q.datos) ? L.wifiString(q.datos) : shortUrl(q.id); }
function thumbSvg(text, st) { return QRStyle.svg(text, st, 240); }
function pngBlob(text, st, px) {
  var c = document.createElement('canvas');
  return QRStyle.draw(c, text, st, px || 1200).then(function () { return new Promise(function (res) { c.toBlob(res, 'image/png'); }); });
}
function download(blob, name) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
}
function shareQR(q) {
  var url = qrText(q);
  return pngBlob(url, q.estilo, 1200).then(function (blob) {
    var file = new File([blob], fname(q.nombre) + '.png', { type: 'image/png' });
    var txt = isDirect(q.tipo, q.datos) ? q.nombre : url;
    if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: q.nombre, text: txt });
    if (navigator.share && !isDirect(q.tipo, q.datos)) return navigator.share({ title: q.nombre, url: url });
    download(blob, fname(q.nombre) + '.png');
  }).catch(function (e) { if (e && e.name !== 'AbortError') toast('No se pudo compartir'); });
}

/* ───────── instalar / compartir app ───────── */
var deferred = null;
var isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; refreshInstall(); });
window.addEventListener('appinstalled', function () { deferred = null; isStandalone = true; refreshInstall(); toast('App instalada'); });
function refreshInstall() { var e = $('#hinst'); if (e) e.classList.toggle('hide', isStandalone); }
function doInstall() {
  if (isStandalone) { info({ icon: 'check', ok2: 1, title: 'Ya tienes la app instalada', text: 'Estás usando QR Dinámicos como aplicación. ¡Todo listo!', ok: 'Perfecto' }); return; }
  if (deferred) { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; refreshInstall(); }); return; }
  var steps = isIOS
    ? '<li>Pulsa el botón <b>Compartir</b> (el cuadrado con la flecha) de Safari.</li><li>Elige <b>Añadir a pantalla de inicio</b>.</li><li>Pulsa <b>Añadir</b>.</li>'
    : '<li>Abre el menú del navegador (⋮ o ⋯).</li><li>Elige <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</li><li>Confirma.</li>';
  var m = modal('<div class="dlg"><div class="dlg-i">' + I('install', 32) + '</div><h2>Instalar la app</h2><p>' + (isIOS ? 'En iPhone se instala desde Safari:' : 'Desde el navegador:') + '</p><ol class="steps" style="text-align:left">' + steps + '</ol><div class="row"><button class="btn pri" data-close>Entendido</button></div></div>'); m.classList.add('center');
}
function appUrl() { return location.href.split('#')[0].split('?')[0].replace(/index\.html$/, ''); }
function shareApp() {
  var url = appUrl();
  if (navigator.share) navigator.share({ title: 'QR Dinámicos', text: 'Crea tus códigos QR dinámicos', url: url }).catch(function () {});
  else copy(url);
}

/* ───────── login: arte animado ───────── */
var heroTimer = null;
function heroArt() {
  var box = $('#heroqrs'); if (!box || box.childElementCount) return;
  var looks = [
    Object.assign({}, QRStyle.PRESETS[1].st, { frame: 'tarjeta', frameColor: '#4f46e5', logo: 'star' }),
    Object.assign({}, QRStyle.PRESETS[3].st, { frame: 'burbuja', frameColor: '#e11d48', frameText: 'DESCUENTO', logo: 'coupon' }),
    Object.assign({}, QRStyle.PRESETS[2].st, { frame: 'taza', frameColor: '#0f766e', frameText: 'NUESTRA CARTA', logo: 'coffee' }),
    Object.assign({}, QRStyle.PRESETS[4].st, { frame: 'movil', frameColor: '#0369a1', frameText: 'WI-FI GRATIS', logo: 'wifi' })
  ];
  box.innerHTML = looks.map(function (st) { return '<div>' + QRStyle.svg('https://puntofibra.github.io/qrdinamico/', st, 260) + '</div>'; }).join('');
  var i = 0, ds = box.children; ds[0].classList.add('on');
  clearInterval(heroTimer);
  heroTimer = setInterval(function () { ds[i].classList.remove('on'); i = (i + 1) % ds.length; ds[i].classList.add('on'); }, 2600);
  $('#feats').innerHTML = [['palette', 'Marcos, colores, formas y tu logo'], ['edit', 'Cambia el destino sin reimprimir'], ['chart', 'Estadísticas de cada escaneo'], ['sparkle', '20 tipos: web, menú, Wi-Fi, vCard…']]
    .map(function (f) { return '<div><span>' + I(f[0], 18) + '</span>' + f[1] + '</div>'; }).join('');
}

/* ───────── diálogos propios (sustituyen a confirm/alert del navegador) ───────── */
function ask(o) {
  return new Promise(function (res) {
    var done = false;
    var m = modal('<div class="dlg"><div class="dlg-i' + (o.danger ? ' bad' : o.ok2 ? ' ok' : '') + '">' + I(o.icon || 'sparkle', 32) + '</div>' +
      '<h2>' + esc(o.title) + '</h2>' + (o.text ? '<p>' + o.text + '</p>' : '') +
      '<div class="row">' + (o.single ? '' : '<button class="btn" data-a="0">' + esc(o.cancel || 'Cancelar') + '</button>') +
      '<button class="btn ' + (o.danger ? 'danger' : 'pri') + '" data-a="1">' + esc(o.ok || 'Aceptar') + '</button></div></div>');
    m.classList.add('center');
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (b && !done) { done = true; closeModal(m); res(b.getAttribute('data-a') === '1'); }
      else if (e.target === m && !done) { done = true; res(false); }
    });
    setTimeout(function () { var p = m.querySelector('[data-a="1"]'); if (p) p.focus(); }, 50);
  });
}
function info(o) { o.single = true; return ask(o); }

/* ───────── acceso: correo + contraseña, registro, recuperar, llave NFC ───────── */
var authMode = 'login';
var SOPORTE = '34633200100';
function waLink(txt) { return 'https://wa.me/' + SOPORTE + '?text=' + encodeURIComponent(txt || 'Hola, necesito ayuda con QR Dinámicos'); }

function showLogin(msg) {
  $('#app').classList.add('hide'); $('#login').classList.remove('hide');
  renderAuth(authMode === 'reset' ? 'reset' : 'login', $('#ae') ? $('#ae').value : '');
  if (msg) authErr(msg);
  refreshInstall(); heroArt();
}
function pwField(id, ac, ph) {
  return '<div class="pw"><input class="inp" id="' + id + '" type="password" autocomplete="' + ac + '" placeholder="' + (ph || '••••••••') + '">' +
    '<button type="button" class="eye" data-auth="eye" data-for="' + id + '" title="Mostrar u ocultar">' + I('eye', 18) + '</button></div>';
}
function renderAuth(mode, email) {
  authMode = mode; email = email || '';
  var mail = '<label class="f" for="ae">Correo electrónico</label><input class="inp" id="ae" type="email" inputmode="email" autocomplete="' + (mode === 'register' ? 'email' : 'username') + '" autocapitalize="none" spellcheck="false" placeholder="tu@correo.com" value="' + esc(email) + '">';
  var back = '<div class="alt"><button type="button" class="lnk" data-auth="login">' + I('back', 16) + 'Volver a entrar</button></div>';
  var F = {
    login: '<h2>Entra en tu cuenta</h2><p class="sub">Con tu correo y tu contraseña</p>' + mail +
      '<label class="f" for="ap">Contraseña</label>' + pwField('ap', 'current-password') +
      '<div class="frow"><button type="button" class="lnk" data-auth="forgot">¿Has olvidado tu contraseña?</button></div>' +
      '<div class="aerr" id="aerr"></div><button class="btn pri big hold" id="ago"><span class="hp"></span><span class="tx">Entrar</span></button>' +
      '<div class="sep"><span>¿Aún no tienes cuenta?</span></div><button type="button" class="btn big" style="width:100%" data-auth="register">' + I('sparkle', 18) + 'Crear cuenta gratis</button>',
    register: '<h2>Crea tu cuenta gratis</h2><p class="sub">Te enviaremos tu contraseña al correo</p>' +
      '<label class="f" for="an">Nombre y apellidos o empresa</label><input class="inp" id="an" autocomplete="name" maxlength="80" placeholder="Bar Pepe">' + mail +
      '<label class="f" for="at">Teléfono <span class="mut" style="font-weight:500">(opcional)</span></label><input class="inp" id="at" type="tel" inputmode="tel" autocomplete="tel" placeholder="600 000 000">' +
      '<input id="aw" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0" aria-hidden="true">' +
      '<div class="aerr" id="aerr"></div><button class="btn pri big" id="ago">Crear mi cuenta</button>' +
      '<p class="mut" style="font-size:12.5px;text-align:center;margin:10px 0 0">Empiezas sin códigos: elige después el plan que necesites.</p>' + back,
    forgot: '<h2>Recuperar contraseña</h2><p class="sub">Te enviaremos un código de 6 cifras</p>' + mail +
      '<div class="aerr" id="aerr"></div><button class="btn pri big" id="ago">Enviar código</button>' + back,
    reset: '<h2>Nueva contraseña</h2><p class="sub">Escribe el código que te ha llegado al correo</p>' + mail +
      '<label class="f" for="ac">Código de 6 cifras</label><input class="inp code" id="ac" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••">' +
      '<label class="f" for="ap">Nueva contraseña <span class="mut" style="font-weight:500">(mínimo 8)</span></label>' + pwField('ap', 'new-password') +
      '<div class="aerr" id="aerr"></div><button class="btn pri big" id="ago">Guardar y entrar</button>' + back
  };
  var box = $('#authbox');
  box.innerHTML = '<div class="aform fade">' + F[mode] + '</div>' +
    '<button type="button" class="btn ghost" style="width:100%;margin-top:12px" data-act="install" id="linst">' + I('install', 18) + 'Instalar la app</button>';
  refreshInstall();
  var go = $('#ago');
  if (mode === 'login') bindHold(go);
  go.addEventListener('click', function () { if (go._lp) { go._lp = false; return; } submitAuth(); });
  $$('#authbox input').forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitAuth(); } }); });
  var first = mode === 'reset' ? $('#ac') : mode === 'register' ? $('#an') : (email ? $('#ap') : $('#ae'));
  if (first && innerWidth > 900) setTimeout(function () { first.focus(); }, 60);
}
function authErr(msg) {
  var e = $('#aerr'); if (!e) return toast(msg);
  e.textContent = msg; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake');
}
function submitAuth() {
  var go = $('#ago'); if (!go || go.disabled) return;
  var em = ($('#ae') ? $('#ae').value : '').trim();
  authErr('');
  var job;
  if (authMode === 'login') {
    var pw = $('#ap').value;
    if (!pw) return authErr('Escribe tu contraseña');
    job = post('login', { email: em, password: pw }).then(function (j) {
      if (!j.ok) throw new Error(j.error || 'No se pudo entrar');
      token = j.token; ls_set(TOK_KEY, token); return enter();
    });
  } else if (authMode === 'register') {
    job = post('register', { nombre: $('#an').value, email: em, telefono: $('#at').value, web: $('#aw').value }).then(function (j) {
      if (!j.ok) throw new Error(j.error);
      renderAuth('login', j.email); confetti();
      return info({ icon: 'mail', ok2: 1, title: '¡Cuenta creada!', text: 'Te hemos enviado tu contraseña a <b>' + esc(j.email) + '</b>.<br>Entra con ella y elige tu plan.<br><span class="mut" style="font-size:13px">Si no lo ves, mira en la carpeta de spam.</span>', ok: 'Entendido' });
    });
  } else if (authMode === 'forgot') {
    job = post('forgot', { email: em }).then(function (j) {
      if (!j.ok) throw new Error(j.error);
      renderAuth('reset', em); toast('Si el correo tiene cuenta, te hemos enviado un código');
    });
  } else {
    var np = $('#ap').value;
    job = post('reset', { email: em, code: $('#ac').value, password: np }).then(function (j) {
      if (!j.ok) throw new Error(j.error);
      return post('login', { email: em, password: np });
    }).then(function (j) {
      if (!j.ok) throw new Error(j.error);
      token = j.token; ls_set(TOK_KEY, token); toast('Contraseña actualizada'); return enter();
    });
  }
  go.disabled = true; go.classList.add('loading');
  job.catch(function (e) { authErr(e && e.message ? e.message : 'Sin conexión. Inténtalo de nuevo.'); })
    .then(function () { var g = $('#ago'); if (g) { g.disabled = false; g.classList.remove('loading'); } });
}
$('#login').addEventListener('click', function (e) {
  var b = e.target.closest('[data-auth]'); if (!b) return;
  var a = b.getAttribute('data-auth');
  if (a === 'eye') { var i = $('#' + b.getAttribute('data-for')); i.type = i.type === 'password' ? 'text' : 'password'; b.classList.toggle('on'); return; }
  renderAuth(a, $('#ae') ? $('#ae').value.trim() : '');
});

/* mantener ENTRAR 3 s → llave NFC */
function bindHold(btn) {
  var t = null;
  function stop() { if (t) { clearTimeout(t); t = null; } btn.classList.remove('holding'); }
  btn.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    btn.classList.add('holding');
    t = setTimeout(function () { t = null; btn._lp = true; btn.classList.remove('holding'); if (navigator.vibrate) navigator.vibrate(60); llaveModal(); }, 3000);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, stop); });
  btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
}
function llaveModal() {
  var m = modal('<div class="dlg"><div class="dlg-i">' + I('key', 32) + '</div><h2>Entrar con llave NFC</h2><p>¿Dónde vas a acercar la llave?</p>' +
    '<div style="display:grid;gap:10px;margin-top:16px"><button class="btn pri big" id="lvAqui">' + I('app', 18) + 'En este móvil</button>' +
    '<button class="btn big" id="lvQr">' + I('qr', 18) + 'En otro móvil (escanear QR)</button><button class="btn ghost" data-close>Cancelar</button></div>' +
    '<p class="mut" id="lvMsg" style="font-size:13px;margin-top:10px"></p></div>');
  m.classList.add('center');
  var ses = null, err = null;
  var pide = post('llaveSesion').then(function (d) { if (!d.ok) throw new Error(d.error); ses = d; }).catch(function (e) { err = e; });
  function listo() { return pide.then(function () { if (err) throw err; return ses; }); }
  $('#lvAqui', m).onclick = function () {
    var w = window.open(ses ? ses.url : 'about:blank', '_blank');
    listo().then(function (s) { try { if (w && w.location.href === 'about:blank') w.location.href = s.url; } catch (e) {} closeModal(m); llaveEsperar(s, 'aqui'); })
      .catch(function (e) { if (w) w.close(); $('#lvMsg', m).textContent = e.message; });
  };
  $('#lvQr', m).onclick = function () {
    listo().then(function (s) { closeModal(m); llaveEsperar(s, 'qr'); }).catch(function (e) { $('#lvMsg', m).textContent = e.message; });
  };
}
function llaveEsperar(s, modo) {
  var pie = '<p id="lvSt" class="lvst"><span class="dots"><i></i><i></i><i></i></span> Esperando la llave…</p><button class="btn ghost" style="width:100%" data-close>Cancelar</button>';
  var m = modo === 'qr'
    ? modal('<div class="dlg"><h2>Escanea con el móvil de la llave</h2><div class="lvqr">' + QRStyle.svg(s.url, { dots: 'rounded', eyeOut: 'rounded', eyeIn: 'rounded', fg: '#312e81' }, 240) + '</div>' +
      '<p>Ábrelo en un Android con NFC, acerca tu llave por detrás y esta pantalla entrará sola.</p>' + pie + '</div>')
    : modal('<div class="dlg"><div class="dlg-i">' + I('key', 32) + '</div><h2>Acerca tu llave</h2><p>Se ha abierto el lector en otra pestaña. Acerca la llave por detrás del móvil y vuelve aquí: entrarás solo.</p>' +
      '<a class="btn pri big" style="width:100%;text-decoration:none" href="' + esc(s.url) + '" target="_blank" rel="noopener">Abrir el lector NFC</a>' + pie + '</div>');
  m.classList.add('center');
  function tick() {
    if (!document.body.contains(m)) return;
    post('llaveEstado', { codigo: s.codigo }).then(function (r) {
      var st = $('#lvSt', m); if (!st) return;
      if (r.estado === 'ok') { token = r.token; ls_set(TOK_KEY, token); closeModal(m); toast('Hola' + (r.nombre ? ', ' + r.nombre : '')); enter(); return; }
      if (r.estado === 'denegado') { st.innerHTML = '<b style="color:var(--bad)">' + esc(r.motivo || 'Llave no autorizada') + '</b>'; return; }
      if (r.estado === 'caducado') { st.innerHTML = 'El código ha caducado. Vuelve a mantener pulsado «Entrar».'; return; }
      setTimeout(tick, 1500);
    }).catch(function () { setTimeout(tick, 2500); });
  }
  setTimeout(tick, 1500);
}

function doLogout() {
  token = null; ls_set(TOK_KEY, null); S.rol = null;
  document.querySelectorAll('.modal').forEach(function (m) { m.remove(); });
  $('#studio').classList.add('hide');
  document.body.classList.remove('lock');
  authMode = 'login';
  showLogin();
}
function enter() {
  return api('me').then(function (j) {
    S.rol = j.rol; S.nombre = j.nombre; S.email = j.email;
    clearInterval(heroTimer);
    $('#login').classList.add('hide'); $('#app').classList.remove('hide');
    $('#who').textContent = (j.rol === 'admin' ? 'Administrador' : j.email);
    refreshInstall();
    return j.rol === 'admin' ? loadAdmin() : loadClient();
  });
}

/* ═════════════ CLIENTE ═════════════ */
function loadClient() {
  return api('cli_qrs').then(function (j) { S.cli = j.cliente; S.qrs = (j.qrs || []).map(normQ); renderClient(); });
}
function daysClass(c) { return c.vencido ? 'bad' : (c.dias != null && c.dias <= 7 ? 'warn' : 'ok'); }
function canCreate() { var c = S.cli; return c && c.activo && !c.vencido && !c.sinPlan && S.qrs.length < c.maxQR; }
function planOf(id) { var ps = (S.cli && S.cli.planes) || []; return ps.filter(function (p) { return p.id === id; })[0]; }
function qrN(n) { return n >= 100000 ? '∞' : String(n); }
function eur(n) { n = Math.round(n * 100) / 100; return (n % 1 ? n.toFixed(2).replace('.', ',') : String(n)) + ' €'; }

function renderClient() {
  var c = S.cli, cls = daysClass(c);
  var diasN = c.sinPlan ? 0 : (c.vencido ? 0 : c.dias);
  var pct = c.sinPlan ? 0 : Math.max(0, Math.min(1, diasN / 30));
  var pl = planOf(c.plan);
  var banner = '';
  if (!c.activo) banner = '<div class="banner">' + I('x', 18) + '<span>Tu cuenta está bloqueada. Escríbenos por WhatsApp y lo vemos.</span></div>';
  else if (c.pedido) {
    var pp = planOf(c.pedido.plan);
    banner = '<div class="banner i">' + I('sparkle', 18) + '<span><b>Estamos verificando tu pago</b> del plan ' + esc(pp ? pp.nombre : '') + ' (' + eur(c.pedido.importe) + '). En cuanto lo confirmemos se activará tu suscripción y te avisaremos por correo.</span></div>';
  } else if (c.vencido) banner = '<div class="banner">' + I('pause', 18) + '<span><b>Tu plan ha caducado.</b> Tus QR siguen guardados pero están en pausa: quien los escanee verá «enlace pausado temporalmente». Renueva y volverán a funcionar al momento.</span><button class="btn sm" data-act="plans">Renovar</button></div>';
  else if (!c.sinPlan && c.dias <= 7) banner = '<div class="banner w">' + I('event', 18) + '<span>Te quedan ' + c.dias + ' día' + (c.dias === 1 ? '' : 's') + ' de plan. Renueva para que tus QR no se pausen.</span><button class="btn sm" data-act="plans">Renovar</button></div>';
  var totalScans = S.qrs.reduce(function (a, q) { return a + (Number(q.escaneos) || 0); }, 0);
  var CIR = 2 * Math.PI * 40;
  var hora = new Date().getHours(), saludo = hora < 13 ? 'Buenos días' : hora < 21 ? 'Buenas tardes' : 'Buenas noches';

  var html = banner +
    '<div class="welcome fade"><div><h1>' + saludo + ', ' + esc(String(S.nombre).split(' ')[0]) + '</h1><p>Crea códigos QR con estilo y cámbialos cuando quieras.</p></div>' +
    (c.sinPlan ? '' : '<button class="btn pri big" data-act="newqr">' + I('sparkle', 20) + 'Crear QR</button>') + '</div>';

  if (c.sinPlan && !S.qrs.length) {
    $('#main').innerHTML = html + '<section class="shop fade"><div class="shop-h"><span class="shop-i">' + I('crown', 30) + '</span><div>' + (c.pedido ? '<h2>Tu pago se está verificando</h2><p>En cuanto lo confirmemos podrás crear tus QR. Si te has equivocado de plan, elige otro y vuelve a avisarnos.</p>' : '<h2>Elige tu plan para empezar</h2><p>Paga solo por los códigos que necesitas. Sin permanencia: cambia o cancela cuando quieras.</p>') + '</div></div>' +
      planGrid(c.pedido ? c.pedido.plan : 'p5', true) + '<div class="shop-f">' + I('chat', 16) + '¿Dudas? <a href="' + waLink() + '" target="_blank" rel="noopener">Escríbenos por WhatsApp</a></div></section>';
    icons($('#main'));
    return;
  }

  html += '<div class="stats">' +
    '<div class="stat fade"><span class="i">' + I('qr', 20) + '</span><div><b><span id="cnt1">0</span>/' + qrN(c.maxQR) + '</b><span>Códigos QR</span></div></div>' +
    '<div class="stat fade" style="animation-delay:.05s"><span class="i">' + I('chart', 20) + '</span><div><b id="cnt2">0</b><span>Escaneos</span></div></div>' +
    '<div class="stat fade" style="animation-delay:.1s"><span class="i">' + I('event', 20) + '</span><div><b><span id="cnt3">0</span></b><span>Días restantes</span></div></div></div>';

  var plan = '<aside class="card plan fade"><div class="lbl">Tu plan</div>' +
    '<div class="pname">' + I('crown', 18) + (pl ? esc(pl.nombre) + ' <span>· ' + (pl.qr >= 100000 ? 'QR ilimitados' : pl.qr + ' QR') + '</span>' : 'Sin plan') + '</div>' +
    '<div class="ring ' + cls + '"><svg viewBox="0 0 100 100"><circle class="tr" cx="50" cy="50" r="40"/><circle class="pr" cx="50" cy="50" r="40" stroke-dasharray="' + CIR + '" stroke-dashoffset="' + CIR + '" data-off="' + (CIR * (1 - pct)) + '"/></svg>' +
    '<div><b>' + diasN + '</b><div class="mut" style="font-weight:600">días restantes</div></div></div>' +
    '<div class="row2"><span>Caduca: <b>' + fmtDate(c.caducidad) + '</b></span><span>QR: <b>' + S.qrs.length + ' / ' + qrN(c.maxQR) + '</b></span></div>' +
    '<button class="btn pri" data-act="plans">' + I('card2', 18) + (c.sinPlan ? 'Elegir plan' : 'Renovar o mejorar plan') + '</button>' +
    '<p class="hint">Cada pago añade 30 días por mes pagado. Si aún te quedaban días, se suman: no pierdes ninguno.</p>' +
    '<a class="btn ghost wa-in" href="' + waLink() + '" target="_blank" rel="noopener">' + I('chat', 18) + 'Soporte por WhatsApp</a></aside>';

  var list;
  if (!S.qrs.length) list = '<div class="empty fade"><div class="art">' + I('qr', 42) + '</div><b style="color:var(--ink);font-size:1.05rem">Aún no tienes códigos QR</b><p style="margin:6px 0 16px">Elige un tipo, personaliza el diseño y listo.</p>' +
    '<button class="btn pri" data-act="newqr">' + I('plus', 18) + 'Crear mi primer QR</button></div>';
  else list = '<div class="qgrid">' + S.qrs.map(qrCard).join('') + '</div>';

  $('#main').innerHTML = html + '<div class="cgrid">' + plan + '<section><div class="shead"><h2>Mis códigos QR</h2>' +
    (S.qrs.length ? '<button class="btn sm" data-act="newqr">' + I('plus', 16) + 'Nuevo</button>' : '') + '</div>' + list + '</section></div>';

  countUp($('#cnt1'), S.qrs.length); countUp($('#cnt2'), totalScans); countUp($('#cnt3'), diasN);
  requestAnimationFrame(function () { var p = $('.ring .pr'); if (p) setTimeout(function () { p.style.strokeDashoffset = p.getAttribute('data-off'); }, 60); });
}

/* intento de crear sin plan o al límite → explicar con un diálogo bonito */
function tryCreate() {
  var c = S.cli;
  if (canCreate()) return openStudio(null);
  if (!c.activo) return info({ icon: 'x', danger: 1, title: 'Cuenta bloqueada', text: 'Escríbenos por WhatsApp y lo solucionamos.', ok: 'Entendido' });
  if (c.pedido) return info({ icon: 'sparkle', title: 'Pago en verificación', text: 'En cuanto confirmemos tu pago podrás crear tus códigos QR. Te avisaremos por correo.', ok: 'Entendido' });
  if (c.sinPlan) return plansModal();
  if (c.vencido) return ask({ icon: 'pause', title: 'Tu plan ha caducado', text: 'Renueva para volver a crear y editar tus QR. Los que ya tienes siguen guardados.', ok: 'Renovar plan' }).then(function (y) { if (y) plansModal(); });
  return ask({ icon: 'crown', title: 'Has llegado al límite', text: 'Tu plan incluye ' + qrN(c.maxQR) + ' código' + (c.maxQR === 1 ? '' : 's') + ' QR. Mejora tu plan para crear más.', ok: 'Ver planes' }).then(function (y) { if (y) plansModal(); });
}

/* ── tienda de planes ── */
function planGrid(sel, inline) {
  var ps = (S.cli && S.cli.planes) || [];
  return '<div class="plans' + (inline ? ' inl' : '') + '">' + ps.map(function (p, i) {
    var top = p.id === 'p20';
    return '<button class="pcard' + (p.id === sel ? ' on' : '') + (top ? ' top' : '') + '" data-plan="' + p.id + '" style="animation-delay:' + (i * 0.05) + 's">' +
      (top ? '<span class="pbadge">Más elegido</span>' : '') +
      '<span class="pn">' + esc(p.nombre) + '</span><span class="pq">' + (p.qr >= 100000 ? '∞' : p.qr) + '<small>' + (p.qr >= 100000 ? 'QR ilimitados' : p.qr === 1 ? 'código QR' : 'códigos QR') + '</small></span>' +
      '<span class="pp">' + eur(p.precio) + '<small>/mes</small></span><span class="pc">' + I('check', 16) + '</span></button>';
  }).join('') + '</div>' + (inline ? '<div style="text-align:center;margin-top:18px"><button class="btn pri big" data-act="plans">' + I('card2', 18) + 'Continuar con el plan elegido</button></div>' : '');
}
function myposUrl(importe) {
  var base = String((S.cli && S.cli.mypos) || 'https://mypos.com/@futurmovil').replace(/\/+$/, '');
  var n = Math.round(importe * 100) / 100;
  return base + '/' + (n % 1 ? n.toFixed(2).replace('.', ',') : String(n));
}
function plansModal(pre) {
  var c = S.cli;
  var selInline = $('.plans.inl .pcard.on');
  var st = { plan: pre || (selInline && selInline.getAttribute('data-plan')) || c.plan || 'p5', meses: 1, paso: 1 };
  var m = modal('<div class="pm"></div>');
  m.classList.add('wide');
  function draw() {
    var p = planOf(st.plan) || c.planes[1], tot = p.precio * st.meses;
    var body;
    if (st.paso === 1) {
      body = '<h2>Elige tu plan</h2><p class="mut" style="margin:-6px 0 14px">Precios por mes. Sin permanencia.</p>' + planGrid(st.plan) +
        '<label class="f">¿Cuántos meses quieres pagar?</label><div class="seg" id="pmm">' + [1, 3, 6, 12].map(function (n) { return '<button data-m="' + n + '" class="' + (st.meses === n ? 'on' : '') + '">' + n + (n === 1 ? ' mes' : ' meses') + '</button>'; }).join('') + '</div>' +
        '<div class="ptot"><span>Total a pagar</span><b>' + eur(tot) + '</b></div>' +
        '<div class="row"><button class="btn" data-close>Cancelar</button><button class="btn pri" data-pm="next">Continuar' + I('next', 18) + '</button></div>';
    } else {
      body = '<h2>Paga con myPOS</h2>' +
        '<div class="psum">' + I('crown', 20) + '<div><b>' + esc(p.nombre) + ' · ' + (p.qr >= 100000 ? 'QR ilimitados' : p.qr + ' QR') + '</b><span>' + st.meses + (st.meses === 1 ? ' mes' : ' meses') + '</span></div><b class="pb">' + eur(tot) + '</b></div>' +
        '<div class="concept"><div class="ci">' + I('mail', 22) + '</div><div><b>Importante: en el concepto del pago escribe tu correo</b><div class="cmail"><code>' + esc(c.email) + '</code><button class="btn sm" data-pm="copy">' + I('copy', 16) + 'Copiar</button></div>' +
        '<span class="mut">Así sabremos que el pago es tuyo. En cuanto lo verifiquemos se aplicará tu suscripción.</span></div></div>' +
        '<ol class="psteps"><li>Pulsa <b>Pagar ' + eur(tot) + '</b>: se abrirá myPOS con el importe ya puesto.</li><li>Pega tu correo en el concepto y completa el pago.</li><li>Vuelve aquí y pulsa <b>Ya he pagado</b>.</li></ol>' +
        '<a class="btn pri big" style="width:100%;text-decoration:none" href="' + esc(myposUrl(tot)) + '" target="_blank" rel="noopener" data-pm="pay">' + I('card2', 20) + 'Pagar ' + eur(tot) + ' con myPOS</a>' +
        '<button class="btn big paid" style="width:100%;margin-top:10px" data-pm="paid">' + I('check', 20) + 'Ya he pagado</button>' +
        '<div class="row"><button class="btn ghost" data-pm="back">' + I('back', 16) + 'Cambiar plan</button><a class="btn ghost" href="' + waLink('Hola, tengo una duda con el pago de QR Dinámicos (' + c.email + ')') + '" target="_blank" rel="noopener">' + I('chat', 16) + 'Ayuda</a></div>';
    }
    $('.pm', m).innerHTML = '<div class="fade">' + body + '</div>';
  }
  m.addEventListener('click', function (e) {
    var pc = e.target.closest('[data-plan]'); if (pc) { st.plan = pc.getAttribute('data-plan'); draw(); return; }
    var mm = e.target.closest('[data-m]'); if (mm) { st.meses = Number(mm.getAttribute('data-m')); draw(); return; }
    var b = e.target.closest('[data-pm]'); if (!b) return;
    var a = b.getAttribute('data-pm');
    if (a === 'next') { st.paso = 2; draw(); }
    else if (a === 'back') { st.paso = 1; draw(); }
    else if (a === 'copy') copy(c.email);
    else if (a === 'pay') { try { navigator.clipboard.writeText(c.email); } catch (er) {} toast('Correo copiado: pégalo en el concepto'); $('.paid', m).classList.add('glow'); }
    else if (a === 'paid') {
      run(function () { return api('cli_pedido', { plan: st.plan, meses: st.meses }); }).then(function () {
        closeModal(m); confetti();
        return info({ icon: 'check', ok2: 1, title: '¡Gracias!', text: 'Hemos recibido tu aviso. En cuanto verifiquemos el pago se activará tu suscripción y te llegará un correo de confirmación.', ok: 'Perfecto' });
      }).then(function () { return run(loadClient); }).catch(function () {});
    }
  });
  draw();
}
$('#main').addEventListener('click', function (e) {
  var pc = e.target.closest('.plans.inl [data-plan]'); if (!pc) return;
  $$('.plans.inl .pcard').forEach(function (x) { x.classList.toggle('on', x === pc); });
});

function qrCard(q, i) {
  var t = T[q.tipo] || T.url, sum = L.summary(q.tipo, q.datos) || q.destino;
  return '<div class="q' + (q.activo ? '' : ' off') + '" style="animation-delay:' + Math.min(i * 0.05, .4) + 's" data-id="' + q.id + '">' +
    '<div class="thumb" data-act="viewqr" data-id="' + q.id + '">' + thumbSvg(qrText(q), q.estilo) + '</div>' +
    '<div class="bd"><div class="tp">' + I(t.icon, 14) + t.name + (isDirect(q.tipo, q.datos) ? ' · estático' : '') + '</div>' +
    '<h3>' + esc(q.nombre) + ' <span class="tag ' + (q.activo ? 'ok' : 'warn') + '">' + (q.activo ? 'Activo' : 'Pausado') + '</span></h3>' +
    '<div class="dest" title="' + esc(sum) + '">' + esc(sum) + '</div></div>' +
    '<div class="acts">' +
    '<button class="btn sm" data-act="viewqr" data-id="' + q.id + '" title="Descargar">' + I('down', 16) + '<span class="tx">Bajar</span></button>' +
    '<button class="btn sm" data-act="editqr" data-id="' + q.id + '" title="Editar">' + I('edit', 16) + '<span class="tx">Editar</span></button>' +
    '<button class="btn sm" data-act="designqr" data-id="' + q.id + '" title="Diseño">' + I('palette', 16) + '</button>' +
    '<button class="btn sm" data-act="statsqr" data-id="' + q.id + '" title="Estadísticas">' + I('chart', 16) + q.escaneos + '</button>' +
    '</div></div>';
}
function findQR(id) { return S.qrs.filter(function (q) { return q.id === id; })[0]; }

/* ver / descargar */
function viewQR(q) {
  var url = qrText(q), direct = isDirect(q.tipo, q.datos), px = 1024;
  var m = modal(
    '<h2>' + esc(q.nombre) + '</h2><div class="qrbox"><canvas></canvas><div class="scanl"></div></div>' +
    (direct ? '<p class="hint" style="text-align:center">QR de conexión directa a la red «' + esc(q.datos.ssid) + '».</p>' : '<div class="link"><code>' + esc(url) + '</code></div>') +
    '<label class="f">Tamaño de la imagen PNG</label><div class="seg" id="pxseg"><button data-px="512">Pequeño</button><button data-px="1024" class="on">Mediano</button><button data-px="2048">Grande</button><button data-px="4096">Imprenta</button></div>' +
    '<div class="row"><button class="btn pri" data-d="png">' + I('down', 18) + 'PNG</button><button class="btn" data-d="svg">' + I('down', 18) + 'SVG</button>' +
    '<button class="btn" data-d="share">' + I('share', 18) + 'Compartir</button></div>' +
    '<div class="row">' + (direct ? '' : '<button class="btn" data-d="copy">' + I('copy', 18) + 'Copiar enlace</button><button class="btn" data-d="open">' + I('web', 18) + 'Probar</button>') +
    '<button class="btn" data-d="design">' + I('palette', 18) + 'Diseño</button></div>' +
    '<div class="row"><button class="btn ghost" data-close>Cerrar</button></div>');
  QRStyle.draw($('canvas', m), url, q.estilo, 900);
  m.addEventListener('click', function (e) {
    var p = e.target.closest('[data-px]');
    if (p) { px = Number(p.getAttribute('data-px')); $$('[data-px]', m).forEach(function (b) { b.classList.toggle('on', b === p); }); return; }
    var b = e.target.closest('[data-d]'); if (!b) return;
    var d = b.getAttribute('data-d');
    if (d === 'png') pngBlob(url, q.estilo, px).then(function (bl) { download(bl, fname(q.nombre) + '.png'); });
    else if (d === 'svg') download(new Blob([QRStyle.svg(url, q.estilo, 1024)], { type: 'image/svg+xml' }), fname(q.nombre) + '.svg');
    else if (d === 'share') shareQR(q);
    else if (d === 'copy') copy(url);
    else if (d === 'open') window.open(url, '_blank', 'noopener');
    else if (d === 'design') { closeModal(m); openStudio(q, 3); }
  });
}

var DEVN = { ios: 'iPhone/iPad', android: 'Android', windows: 'Windows', mac: 'Mac', linux: 'Linux', otro: 'Otro' };
function statsQR(q) {
  run(function () { return api('cli_qr_stats', { id: q.id }); }).then(function (j) {
    var s = j.stats, max = 1;
    s.dias.forEach(function (d) { if (d[1] > max) max = d[1]; });
    var bars = s.dias.map(function (d, i) {
      var h = Math.round(d[1] / max * 70);
      return '<rect x="' + (i * 10) + '" y="' + (74 - h) + '" width="8" height="' + Math.max(h, d[1] ? 2 : 1) + '" rx="2" fill="url(#gb)" opacity="' + (d[1] ? 1 : .25) + '"><animate attributeName="height" from="0" to="' + Math.max(h, d[1] ? 2 : 1) + '" dur=".6s" begin="' + (i * 0.015) + 's" fill="freeze"/><animate attributeName="y" from="74" to="' + (74 - h) + '" dur=".6s" begin="' + (i * 0.015) + 's" fill="freeze"/><title>' + fmtDate(d[0]) + ': ' + d[1] + '</title></rect>';
    }).join('');
    var devs = Object.keys(s.dispositivos).sort(function (a, b) { return s.dispositivos[b] - s.dispositivos[a]; })
      .map(function (k) { return '<span class="tag">' + (DEVN[k] || k) + ' · ' + s.dispositivos[k] + '</span>'; }).join('');
    modal('<h2>' + esc(q.nombre) + '</h2>' +
      '<div class="stat3"><div><b>' + s.total + '</b><span>Total</span></div><div><b>' + s.ultimos30 + '</b><span>30 días</span></div><div><b>' + s.ultimos7 + '</b><span>7 días</span></div></div>' +
      '<div class="mut" style="font-size:13px">Escaneos por día (últimos 30)</div>' +
      '<svg viewBox="0 0 300 76" style="width:100%;margin-top:6px"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9333ea"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs>' + bars + '</svg>' +
      (devs ? '<div class="devs">' + devs + '</div>' : '<p class="hint">Todavía no hay escaneos.</p>') +
      '<div class="row"><button class="btn" data-close>Cerrar</button></div>');
  }).catch(function () {});
}

/* ═════════════ ESTUDIO: asistente en 3 pasos ═════════════ */
var W = null;
var SAMPLE = 'https://qr.pf/a1b2c3';
var SWATCH = ['#111827', '#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#0284c7'];
var PLACE_ID = 'xxxxxx';

function openStudio(q, step) {
  var nuevo = !q;
  W = {
    q: q || null, step: step || (nuevo ? 1 : 2),
    tipo: q ? q.tipo : null, datos: q ? clone(q.datos) : {}, estilo: q ? QRStyle.norm(q.estilo) : QRStyle.norm({}),
    nombre: q ? q.nombre : '', activo: q ? q.activo : true,
    cat: 'all', search: '', fcat: 'all', open: { pre: 1, frame: 1 }, maxStep: q ? 3 : 1
  };
  $('#sttl').textContent = nuevo ? 'Nuevo QR' : 'Editar QR';
  $('#studio').classList.remove('hide');
  document.body.classList.add('lock');
  renderStudio();
}
function closeStudio() {
  $('#studio').classList.add('hide'); W = null;
  if (!document.querySelector('.modal')) document.body.classList.remove('lock');
}
function previewText() {
  if (isDirect(W.tipo, W.datos)) return L.wifiString(W.datos);
  return shortUrl(W.q ? W.q.id : PLACE_ID);
}

function renderStudio(dir) {
  var names = ['Tipo de QR', 'Contenido', 'Diseño'];
  $('#stepper').innerHTML = names.map(function (n, i) {
    var s = i + 1, cls = s === W.step ? 'on' : (s < W.step || s <= W.maxStep && s !== W.step ? 'done' : '');
    return (i ? '<span class="bar-l' + (s <= W.step ? ' on' : '') + '"><i></i></span>' : '') +
      '<button class="stp ' + cls + '" data-st="go" data-s="' + s + '"' + (s > W.maxStep ? ' disabled' : '') + '><span class="n">' + (cls === 'done' ? I('check', 16) : s) + '</span><span class="t">' + n + '</span></button>';
  }).join('');
  var body = W.step === 1 ? step1() : W.step === 2 ? step2() : step3();
  var bin = $('#sbin');
  bin.innerHTML = '<div class="' + (dir ? (dir > 0 ? 'slideL' : 'slideR') : 'fade') + '">' + body + '</div>';
  icons($('#studio'));
  $('#sb').scrollTop = 0;
  $('#stback').classList.toggle('hide', W.step === 1 && !W.q);
  $('#stback').innerHTML = I('back', 18) + (W.step === 1 ? 'Cancelar' : 'Atrás');
  $('#stnext').classList.toggle('hide', W.step === 1);
  $('#stnext').innerHTML = W.step === 3 ? I('check', 18) + (W.q ? 'Guardar cambios' : 'Crear QR') : 'Siguiente' + I('next', 18);
  $('#stpv').classList.toggle('hide', W.step !== 2);
  if (W.step === 2) updatePhone();
  if (W.step === 3) { drawPreview(); checkContrast(); }
}
function go(step) {
  if (step === W.step) return;
  var dir = step > W.step ? 1 : -1;
  if (dir > 0 && W.step === 2 && !validate()) return;
  W.step = step; W.maxStep = Math.max(W.maxStep, step);
  renderStudio(dir);
}

/* ── paso 1 ── */
function step1() {
  var s = W.search.toLowerCase();
  var chips = '<div class="chips c">' + [['all', 'Todos']].concat(L.CATS).map(function (c) {
    return '<button class="chip' + (W.cat === c[0] ? ' on' : '') + '" data-st="cat" data-v="' + c[0] + '">' + c[1] + '</button>';
  }).join('') + '</div>';
  var out = '';
  L.CATS.forEach(function (c) {
    if (W.cat !== 'all' && W.cat !== c[0]) return;
    var ts = L.TYPES.filter(function (t) { return t.cat === c[0] && (!s || (t.name + ' ' + t.desc).toLowerCase().indexOf(s) >= 0); });
    if (!ts.length) return;
    out += '<div class="tcat">' + c[1] + '</div><div class="tgrid">' + ts.map(function (t, i) {
      return '<button class="tcard' + (W.tipo === t.id ? ' on' : '') + '" style="animation-delay:' + (i * 0.03) + 's" data-st="type" data-v="' + t.id + '"><span class="ti">' + I(t.icon, 24) + '</span><span class="tb"><b>' + t.name + '</b><span>' + t.desc + '</span></span><span class="ar">' + I('next', 18) + '</span></button>';
    }).join('') + '</div>';
  });
  return '<div class="s1h"><h1>¿Qué quieres que haga tu <em>código QR</em>?</h1><p>Elige un tipo. Podrás cambiar el contenido siempre que quieras sin reimprimirlo.</p></div>' +
    '<div class="srch">' + I('search', 18) + '<input class="inp" id="tsrch" placeholder="Buscar: menú, wifi, whatsapp…" value="' + esc(W.search) + '"></div>' +
    chips + '<div id="tlist">' + (out || '<div class="empty">No hay tipos que coincidan</div>') + '</div>';
}

/* ── paso 2 ── */
function fieldHtml(f, val, list) {
  var id = list ? ' data-lf="' + list.k + '" data-li="' + list.i + '" data-lk="' + f.k + '"' : ' data-f="' + f.k + '"';
  var v = val == null ? '' : val, ph = f.ph ? ' placeholder="' + esc(f.ph) + '"' : '';
  var lbl = '<label class="f">' + esc(f.l) + (f.req ? ' *' : '') + '</label>';
  var h;
  switch (f.t) {
    case 'textarea': return '<div class="full">' + lbl + '<textarea class="inp"' + id + ph + ' maxlength="3000">' + esc(v) + '</textarea>' + (f.hint ? '<div class="fhint">' + esc(f.hint) + '</div>' : '') + '</div>';
    case 'select': return '<div>' + lbl + '<select class="inp"' + id + '>' + f.opts.map(function (o) { return '<option value="' + o[0] + '"' + (v === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
    case 'check': return '<div class="full"><label class="chk"><input type="checkbox"' + id + (v ? ' checked' : '') + '><span>' + esc(f.l) + '</span></label></div>';
    case 'color':
      v = v || f.def;
      return '<div class="full">' + lbl + '<div class="colrow"><input type="color"' + id + ' value="' + esc(v) + '">' +
        SWATCH.map(function (c) { return '<span class="sw" style="background:' + c + '" data-st="sw" data-k="' + f.k + '" data-v="' + c + '"></span>'; }).join('') + '</div></div>';
    case 'img': {
      var src = L.safeImg(v);
      h = '<div class="imgrow">' + (src ? '<img class="imgprev" src="' + esc(src) + '" alt="">' : '') +
        '<input class="inp"' + id + ' inputmode="url" autocapitalize="none" spellcheck="false" placeholder="https://…" value="' + esc(/^data:/.test(v) ? '' : v) + '"' + (/^data:/.test(v) ? ' data-keep="1"' : '') + '>' +
        (list ? '' : '<button type="button" class="btn icon" data-st="imgup" data-k="' + f.k + '" title="Subir foto">' + I('image', 18) + '</button>' + (v ? '<button type="button" class="btn icon" data-st="imgx" data-k="' + f.k + '" title="Quitar">' + I('x', 16) + '</button>' : '')) + '</div>';
      return '<div class="full">' + lbl + h + (/^data:/.test(v) ? '<div class="fhint">Foto subida desde tu dispositivo</div>' : '') + '</div>';
    }
    default: {
      var type = f.t === 'email' ? 'email' : f.t === 'tel' ? 'tel' : f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : 'text';
      var im = f.t === 'url' ? ' inputmode="url" autocapitalize="none" spellcheck="false"' : f.t === 'email' ? ' autocapitalize="none"' : '';
      var full = f.t === 'url' || f.t === 'textarea' || (f.k === 'titulo' || f.k === 'url' || f.k === 'direccion' || f.k === 'lugar');
      return '<div' + (full && !list ? ' class="full"' : '') + '>' + lbl + '<input class="inp" type="' + type + '"' + id + im + ph + ' maxlength="500" value="' + esc(v) + '">' + (f.hint ? '<div class="fhint">' + esc(f.hint) + '</div>' : '') + '</div>';
    }
  }
}
function listHtml(f) {
  var arr = W.datos[f.k] = W.datos[f.k] || [];
  if (!arr.length) arr.push({});
  return '<div class="full"><label class="f">' + esc(f.l) + '</label><div data-list="' + f.k + '">' + arr.map(function (it, i) {
    return '<div class="litem"><button type="button" class="btn sm icon ghost rm" data-st="lrm" data-k="' + f.k + '" data-i="' + i + '" title="Quitar">' + I('trash', 16) + '</button>' +
      '<div class="fgrid">' + f.sub.map(function (sf) { return fieldHtml(sf, it[sf.k], { k: f.k, i: i }); }).join('') + '</div></div>';
  }).join('') + '</div><button type="button" class="btn addb" data-st="ladd" data-k="' + f.k + '">' + I('plus', 18) + esc(f.add) + '</button></div>';
}
function step2() {
  var t = T[W.tipo];
  var form = '<div class="fcard"><div class="fhead"><span class="ti">' + I(t.icon, 22) + '</span><div><b>' + t.name + '</b><span>' + t.desc + '</span></div>' +
    (W.q ? '' : '<button class="btn sm ghost" style="margin-left:auto" data-st="go" data-s="1">Cambiar</button>') + '</div>' +
    '<label class="f">Nombre del QR * <span class="mut" style="font-weight:500">(solo lo ves tú)</span></label><input class="inp" id="qn" maxlength="80" placeholder="Ej. ' + esc(t.name) + ' del local" value="' + esc(W.nombre) + '">' +
    (W.q ? '<label class="chk"><input type="checkbox" id="qa"' + (W.activo ? ' checked' : '') + '><span>Activo <span class="mut" style="font-weight:500">(si lo desmarcas, el QR deja de funcionar)</span></span></label>' : '') +
    '</div><div class="fcard"><div class="fgrid">' +
    t.fields.map(function (f) { return f.t === 'list' ? listHtml(f) : fieldHtml(f, W.datos[f.k]); }).join('') +
    '</div><p class="hint">' + I('sparkle', 14).replace('class="ic"', 'class="ic" style="display:inline;vertical-align:-2px"') + ' Podrás cambiar todo esto cuando quieras: el QR impreso seguirá funcionando.</p></div>';
  return '<div class="two"><div>' + form + '</div><div class="pvcol"><div class="phone"><div class="scr" id="pscr"></div></div><div class="pvlbl">' + I('app', 14) + 'Así lo verá quien lo escanee</div></div></div>';
}
var updatePhone = debounce(function () {
  var html = L.render(W.tipo, W.datos, { preview: true });
  var sc = $('#pscr'); if (sc) { var y = sc.scrollTop; sc.innerHTML = html; sc.scrollTop = y; }
  var mp = $('.modal #pscr2'); if (mp) mp.innerHTML = html;
}, 120);
function readField(el) { return el.type === 'checkbox' ? el.checked : el.value; }
function validate() {
  var t = T[W.tipo], bad = null;
  $$('.badf', $('#studio')).forEach(function (e) { e.classList.remove('badf'); });
  if (!String(W.nombre).trim()) bad = $('#qn');
  else t.fields.forEach(function (f) {
    if (bad) return;
    var v = W.datos[f.k];
    if (f.req && !String(v == null ? '' : v).trim()) bad = $('[data-f="' + f.k + '"]');
    else if (f.t === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) bad = $('[data-f="' + f.k + '"]');
    else if (f.t === 'url' && v && !L.safeUrl(v)) bad = $('[data-f="' + f.k + '"]');
  });
  if (!bad && t.redirect && !L.target(W.tipo, W.datos)) bad = $('[data-f]');
  if (!bad && JSON.stringify(W.datos).length > 45000) { toast('Demasiados datos o fotos muy grandes. Usa enlaces para las imágenes.'); return false; }
  if (bad) {
    bad.classList.add('badf'); bad.focus(); bad.scrollIntoView({ block: 'center', behavior: 'smooth' });
    toast(bad.id === 'qn' ? 'Ponle un nombre al QR' : 'Revisa el campo marcado');
    return false;
  }
  return true;
}

/* ── paso 3 ── */
function acc(key, icon, title, sub, body) {
  return '<div class="acc' + (W.open[key] ? ' open' : '') + '" data-acc="' + key + '"><button data-st="acc" data-k="' + key + '"><span class="ti">' + I(icon, 20) + '</span><span><b>' + title + '</b><span>' + sub + '</span></span><span class="ch">' + I('next', 18) + '</span></button><div class="ab">' + body + '</div></div>';
}
function optSvg(st) { return QRStyle.svg(SAMPLE, st, 120); }
function variant(ds, k, v) {
  var e = Object.assign({}, W.estilo);
  if (ds === 'preset') {
    var keep = { frame: e.frame, frameText: e.frameText, logo: e.logo, logoImg: e.logoImg };
    e = Object.assign(QRStyle.norm({}), QRStyle.PRESETS[v].st, keep);
    e.frameColor = e.grad !== 'none' ? e.fg : e.fg; e.frameTextColor = '#ffffff';
  } else e[k] = v;
  return e;
}
function opt(ds, k, v, label, cls) {
  var on = ds === 'set' && String(W.estilo[k]) === String(v);
  return '<button class="opt' + (cls ? ' ' + cls : '') + (on ? ' on' : '') + '" data-ds="' + ds + '" data-k="' + (k || '') + '" data-v="' + esc(v) + '">' + optSvg(variant(ds, k, v)) + (label ? '<small>' + esc(label) + '</small>' : '') + '</button>';
}
function frameOpts() {
  return QRStyle.FRAMES.filter(function (f) { return W.fcat === 'all' || f.cat === W.fcat || f.id === 'none'; })
    .map(function (f) { return opt('set', 'frame', f.id, f.name); }).join('');
}
function colorIn(k, label) {
  return '<div><label class="f">' + label + '</label><div class="colrow"><input type="color" data-e="' + k + '" value="' + esc(W.estilo[k] || (k === 'logoColor' ? W.estilo.fg : '#000000')) + '"><code class="mut" data-ec="' + k + '">' + esc(W.estilo[k] || (k === 'logoColor' ? 'automático' : '')) + '</code></div></div>';
}
function step3() {
  var e = W.estilo;
  var pres = '<div class="opts">' + QRStyle.PRESETS.map(function (p, i) { return opt('preset', '', i, p.name, 'sq'); }).join('') + '</div>';
  var frame = '<div class="chips">' + QRStyle.FRAME_CATS.map(function (c) { return '<button class="chip' + (W.fcat === c[0] ? ' on' : '') + '" data-st="fcat" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
    '<div class="opts" id="fopts">' + frameOpts() + '</div>' +
    '<div id="fset"' + (e.frame === 'none' ? ' class="hide"' : '') + '><label class="f">Texto del marco</label><input class="inp" data-e="frameText" maxlength="28" value="' + esc(e.frameText) + '" placeholder="ESCANÉAME">' +
    '<div class="chips" style="margin-top:8px">' + ['ESCANÉAME', 'VER CARTA', 'WI-FI GRATIS', 'SÍGUENOS', 'DESCUENTO', 'RESERVA AQUÍ', 'MÁS INFO'].map(function (x) { return '<button class="chip" data-st="ftxt" data-v="' + x + '">' + x + '</button>'; }).join('') + '</div>' +
    '<div class="cgrp">' + colorIn('frameColor', 'Color del marco') + colorIn('frameTextColor', 'Color del texto') + '</div></div>';
  var dots = '<div class="opts wrap">' + QRStyle.DOTS.map(function (d) { return opt('set', 'dots', d[0], d[1], 'sq'); }).join('') + '</div>';
  var eyes = '<label class="f" style="margin-top:0">Marco de las esquinas</label><div class="opts wrap">' + QRStyle.EYES_OUT.map(function (d) { return opt('set', 'eyeOut', d[0], d[1], 'sq'); }).join('') + '</div>' +
    '<label class="f">Punto central</label><div class="opts wrap">' + QRStyle.EYES_IN.map(function (d) { return opt('set', 'eyeIn', d[0], d[1], 'sq'); }).join('') + '</div>';
  var grads = [['none', 'Liso'], ['h', 'Horizontal'], ['v', 'Vertical'], ['d', 'Diagonal'], ['radial', 'Radial']];
  var cols = '<div class="cgrp">' + colorIn('fg', 'Color del código') + '<div id="fg2w"' + (e.grad === 'none' ? ' class="hide"' : '') + '>' + colorIn('fg2', 'Segundo color').replace(/^<div>|<\/div>$/g, '') + '</div></div>' +
    '<div class="colrow" style="margin-top:10px">' + SWATCH.map(function (c) { return '<span class="sw" style="background:' + c + '" data-st="fgsw" data-v="' + c + '"></span>'; }).join('') + '</div>' +
    '<label class="f">Degradado</label><div class="seg">' + grads.map(function (g) { return '<button data-st="grad" data-v="' + g[0] + '" class="' + (e.grad === g[0] ? 'on' : '') + '">' + g[1] + '</button>'; }).join('') + '</div>' +
    '<label class="chk"><input type="checkbox" data-st="eyesame"' + (e.eye ? '' : ' checked') + '><span>Esquinas del mismo color que el código</span></label>' +
    '<div id="eyew"' + (e.eye ? '' : ' class="hide"') + '><div class="cgrp">' + colorIn('eye', 'Marco de esquinas') + colorIn('eyeIn2', 'Punto central') + '</div></div>' +
    '<div class="cgrp" style="margin-top:4px">' + colorIn('bg', 'Fondo') + '<div><label class="f">&nbsp;</label><label class="chk" style="margin-top:8px"><input type="checkbox" data-e="transparent"' + (e.transparent ? ' checked' : '') + '><span>Fondo transparente</span></label></div></div>' +
    '<div id="cwarn"></div>';
  var logos = '<div class="opts wrap">' + QRStyle.LOGOS.map(function (k) {
    var on = e.logo === k;
    if (k === 'none') return '<button class="opt lg' + (on ? ' on' : '') + '" data-ds="set" data-k="logo" data-v="none" title="Sin logo">' + I('x', 26) + '</button>';
    if (k === 'upload') return '<button class="opt lg' + (on ? ' on' : '') + '" data-st="logoup" title="Subir tu logo">' + (e.logoImg ? '<img src="' + esc(e.logoImg) + '" alt="">' : I('plus', 26)) + '</button>';
    return '<button class="opt lg' + (on ? ' on' : '') + '" data-ds="set" data-k="logo" data-v="' + k + '">' + I(k, 26) + '</button>';
  }).join('') + '</div><p class="hint">Toca <b>＋</b> para subir el logo de tu negocio (PNG con fondo transparente queda mejor).</p>' +
    '<div class="cgrp">' + colorIn('logoColor', 'Color del icono') + '</div>';

  var left =
    '<div class="mobpv"><canvas id="pcv2"></canvas></div>' +
    acc('pre', 'sparkle', 'Plantillas', 'Estilos listos para usar', pres) +
    acc('frame', 'card', 'Marcos', 'Enmarca tu QR con un texto que invite a escanear', frame) +
    acc('dots', 'qr', 'Patrón', 'Forma de los puntos del código', dots) +
    acc('eyes', 'web', 'Esquinas', 'Estilo de los tres cuadros de las esquinas', eyes) +
    acc('cols', 'palette', 'Colores', 'Color, degradado y fondo', cols) +
    acc('logo', 'star', 'Logo', 'Un icono o tu propio logo en el centro', logos);
  var right = '<div class="pvcol"><div class="qprev"><div class="cv"><canvas id="pcv"></canvas></div><div class="scanl"></div></div>' +
    '<div class="sumq">' + I(T[W.tipo].icon, 16) + '<b>' + esc(W.nombre) + '</b>· ' + esc(T[W.tipo].name) + '</div>' +
    (isDirect(W.tipo, W.datos) ? '<p class="hint" style="text-align:center">Wi-Fi de conexión directa: este QR no se puede cambiar después.</p>' : '<p class="hint" style="text-align:center">Prueba siempre a escanearlo antes de imprimir.</p>') + '</div>';
  return '<div class="two"><div>' + left + '</div>' + right + '</div>';
}
var drawPreview = (function () {
  var raf = 0;
  return function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      if (!W) return;
      var txt = previewText();
      ['#pcv', '#pcv2'].forEach(function (s) {
        var c = $(s); if (!c) return;
        QRStyle.draw(c, txt, W.estilo, 760).then(function () { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); });
      });
    });
  };
})();
var refreshThumbs = debounce(function () {
  if (!W || W.step !== 3) return;
  $$('#sbin .opt[data-ds]').forEach(function (b) {
    var ds = b.getAttribute('data-ds'), k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
    if (ds === 'preset') v = Number(v);
    var on = ds === 'set' && String(W.estilo[k]) === String(v);
    b.classList.toggle('on', on);
    if (k === 'logo') return;
    var sv = b.querySelector('svg'); if (sv) sv.outerHTML = optSvg(variant(ds, k, v));
  });
}, 220);
function checkContrast() {
  var e = W.estilo, w = $('#cwarn'); if (!w) return;
  var msg = '';
  if (!e.transparent) {
    var c1 = QRStyle.contrast(e.fg, e.bg), c2 = e.grad !== 'none' ? QRStyle.contrast(e.fg2, e.bg) : 99;
    if (Math.min(c1, c2) < 2.6) msg = 'Hay poco contraste entre el código y el fondo: puede que algunos móviles no lo lean. Usa un color oscuro sobre fondo claro.';
    else if (QRStyle.contrast(e.bg, '#000') < QRStyle.contrast(e.fg, '#000')) msg = 'El fondo es más oscuro que el código (QR invertido): algunos lectores antiguos no lo leen.';
  } else msg = 'Con fondo transparente, ponlo siempre sobre una superficie clara.';
  w.innerHTML = msg ? '<div class="warnbox">' + I('sparkle', 18) + '<span>' + msg + '</span></div>' : '';
}
function setStyle(k, v) {
  W.estilo[k] = v;
  if (k === 'frame') { var fs = $('#fset'); if (fs) fs.classList.toggle('hide', v === 'none'); }
  drawPreview(); refreshThumbs(); checkContrast();
  var cc = $('[data-ec="' + k + '"]'); if (cc) cc.textContent = v;
}

/* imágenes */
function pickFile(accept) {
  return new Promise(function (res) {
    var i = document.createElement('input'); i.type = 'file'; i.accept = accept || 'image/*';
    i.onchange = function () { res(i.files && i.files[0]); }; i.click();
  });
}
function shrink(file, max, png) {
  return new Promise(function (res, rej) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var tries = [max, Math.round(max * 0.75), Math.round(max * 0.55)], out = '';
        for (var t = 0; t < tries.length; t++) {
          var r = Math.min(1, tries[t] / Math.max(im.width, im.height)), c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(im.width * r)); c.height = Math.max(1, Math.round(im.height * r));
          var g = c.getContext('2d');
          if (!png) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
          g.drawImage(im, 0, 0, c.width, c.height);
          out = png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.8);
          if (out.length < 30000) break;
          if (png) out = c.toDataURL('image/webp', 0.85).indexOf('data:image/webp') === 0 ? c.toDataURL('image/webp', 0.85) : out;
          if (out.length < 30000) break;
        }
        if (out.length > 40000) rej(new Error('La imagen es demasiado grande')); else res(out);
      };
      im.onerror = function () { rej(new Error('No se pudo leer la imagen')); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* eventos del estudio */
$('#studio').addEventListener('click', function (e) {
  if (!W) return;
  var b = e.target.closest('[data-st],[data-ds]'); if (!b || b.disabled) return;
  var ds = b.getAttribute('data-ds');
  if (ds) {
    var k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
    if (ds === 'preset') {
      W.estilo = variant('preset', '', Number(v));
      $('#sbin').innerHTML = '<div>' + step3() + '</div>'; icons($('#sbin'));
      drawPreview(); checkContrast(); toast('Plantilla «' + QRStyle.PRESETS[v].name + '» aplicada');
    } else setStyle(k, v);
    return;
  }
  var a = b.getAttribute('data-st');
  switch (a) {
    case 'close':
      if (W.step > 1) { ask({ icon: 'x', title: '¿Salir sin guardar?', text: 'Perderás los cambios de este código QR.', ok: 'Salir', cancel: 'Seguir editando', danger: 1 }).then(function (y) { if (y) closeStudio(); }); return; }
      closeStudio(); break;
    case 'back': if (W.step === 1) closeStudio(); else go(W.step - 1); break;
    case 'next': if (W.step === 3) saveStudio(); else go(W.step + 1); break;
    case 'go': go(Number(b.getAttribute('data-s'))); break;
    case 'cat': W.cat = b.getAttribute('data-v'); renderStudio(); break;
    case 'type': {
      var nt = b.getAttribute('data-v');
      if (W.tipo !== nt) {
        var old = W.datos; W.datos = {};
        if (old.color) W.datos.color = old.color;
        T[nt].fields.forEach(function (f) { if (f.t === 'select') W.datos[f.k] = f.opts[0][0]; });
      }
      W.tipo = nt; W.maxStep = Math.max(W.maxStep, 2);
      go(2); setTimeout(function () { var n = $('#qn'); if (n && !n.value && innerWidth > 900) n.focus(); }, 380);
      break;
    }
    case 'sw': {
      var k2 = b.getAttribute('data-k'); W.datos[k2] = b.getAttribute('data-v');
      var ci = $('[data-f="' + k2 + '"]'); if (ci) ci.value = W.datos[k2]; updatePhone(); break;
    }
    case 'ladd': {
      var k3 = b.getAttribute('data-k'); W.datos[k3] = W.datos[k3] || []; W.datos[k3].push({});
      rerenderList(k3); var items = $$('[data-list="' + k3 + '"] .litem'); var last = items[items.length - 1];
      if (last) { last.scrollIntoView({ block: 'center', behavior: 'smooth' }); var fi = last.querySelector('input'); if (fi) fi.focus(); }
      updatePhone(); break;
    }
    case 'lrm': {
      var k4 = b.getAttribute('data-k'); W.datos[k4].splice(Number(b.getAttribute('data-i')), 1);
      rerenderList(k4); updatePhone(); break;
    }
    case 'imgup': {
      var k5 = b.getAttribute('data-k');
      pickFile().then(function (f) { if (!f) return; return shrink(f, 360, false).then(function (d) { W.datos[k5] = d; rerenderStep2(); updatePhone(); }); })
        .catch(function (er) { toast(er.message); });
      break;
    }
    case 'imgx': W.datos[b.getAttribute('data-k')] = ''; rerenderStep2(); updatePhone(); break;
    case 'preview': {
      if (W.step === 2) {
        var mm = modal('<div class="phone" style="width:290px;height:580px"><div class="scr" id="pscr2"></div></div><div class="row"><button class="btn" data-close>Cerrar</button></div>');
        mm.querySelector('.sheet').style.background = 'transparent'; mm.querySelector('.sheet').style.border = '0';
        updatePhone();
      }
      break;
    }
    case 'acc': {
      var k6 = b.getAttribute('data-k'); W.open[k6] = !W.open[k6];
      b.parentNode.classList.toggle('open', !!W.open[k6]); break;
    }
    case 'fcat': W.fcat = b.getAttribute('data-v'); $$('[data-st="fcat"]').forEach(function (c) { c.classList.toggle('on', c === b); }); $('#fopts').innerHTML = frameOpts(); break;
    case 'ftxt': { var ft = $('[data-e="frameText"]'); ft.value = b.getAttribute('data-v'); setStyle('frameText', ft.value); if (W.estilo.frame === 'none') setStyle('frame', 'tarjeta'); break; }
    case 'grad': W.estilo.grad = b.getAttribute('data-v'); $$('[data-st="grad"]').forEach(function (c) { c.classList.toggle('on', c === b); }); $('#fg2w').classList.toggle('hide', W.estilo.grad === 'none'); setStyle('grad', W.estilo.grad); break;
    case 'fgsw': { var cv = b.getAttribute('data-v'); var fi2 = $('[data-e="fg"]'); fi2.value = cv; setStyle('fg', cv); if (W.estilo.frame !== 'none') { $('[data-e="frameColor"]').value = cv; setStyle('frameColor', cv); } break; }
    case 'logoup':
      pickFile('image/*').then(function (f) {
        if (!f) return;
        return shrink(f, 200, true).then(function (d) { W.estilo.logoImg = d; setStyle('logo', 'upload'); var lb = $('[data-st="logoup"]'); if (lb) lb.innerHTML = '<img src="' + d + '" alt="">'; $$('.opt.lg').forEach(function (o) { o.classList.toggle('on', o === lb); }); });
      }).catch(function (er) { toast(er.message); });
      break;
  }
  if (a === 'eyesame') {
    var same = b.checked;
    W.estilo.eye = same ? '' : (W.estilo.eye || (W.estilo.fg2 && W.estilo.grad !== 'none' ? W.estilo.fg2 : '#4f46e5'));
    W.estilo.eyeIn2 = same ? '' : (W.estilo.eyeIn2 || W.estilo.eye);
    $('#eyew').classList.toggle('hide', same);
    var e1 = $('[data-e="eye"]'), e2 = $('[data-e="eyeIn2"]'); if (e1) e1.value = W.estilo.eye || '#000000'; if (e2) e2.value = W.estilo.eyeIn2 || '#000000';
    setStyle('eye', W.estilo.eye);
  }
});
var ICONSET = QRStyle.LOGOS;
function rerenderList(k) {
  var f = T[W.tipo].fields.filter(function (x) { return x.k === k; })[0];
  var wrap = $('[data-list="' + k + '"]').parentNode;
  var tmp = document.createElement('div'); tmp.innerHTML = listHtml(f);
  wrap.replaceWith(tmp.firstChild); icons($('#sbin'));
}
function rerenderStep2() { var y = $('#sb').scrollTop; $('#sbin').innerHTML = '<div>' + step2() + '</div>'; icons($('#sbin')); $('#sb').scrollTop = y; updatePhone(); }

$('#studio').addEventListener('input', function (e) {
  if (!W) return;
  var el = e.target;
  if (el.id === 'tsrch') { W.search = el.value; var tl = $('#tlist'); var tmp = document.createElement('div'); tmp.innerHTML = step1(); tl.innerHTML = tmp.querySelector('#tlist').innerHTML; icons(tl); return; }
  if (el.id === 'qn') { W.nombre = el.value; el.classList.remove('badf'); return; }
  if (el.id === 'qa') { W.activo = el.checked; return; }
  if (el.hasAttribute('data-f')) {
    var k = el.getAttribute('data-f');
    if (el.getAttribute('data-keep') && !el.value) return;
    W.datos[k] = readField(el); el.classList.remove('badf');
    if (k === 'directo') { /* afecta al QR */ }
    updatePhone(); return;
  }
  if (el.hasAttribute('data-lf')) {
    var lk = el.getAttribute('data-lf'), li = Number(el.getAttribute('data-li'));
    W.datos[lk] = W.datos[lk] || []; W.datos[lk][li] = W.datos[lk][li] || {};
    W.datos[lk][li][el.getAttribute('data-lk')] = readField(el);
    updatePhone(); return;
  }
  if (el.hasAttribute('data-e')) {
    var ek = el.getAttribute('data-e');
    setStyle(ek, el.type === 'checkbox' ? el.checked : el.value);
  }
});
$('#studio').addEventListener('change', function (e) {
  var el = e.target;
  if (W && el.hasAttribute('data-f') && (el.type === 'checkbox' || el.tagName === 'SELECT')) { W.datos[el.getAttribute('data-f')] = readField(el); updatePhone(); }
});

function saveStudio() {
  var nuevo = !W.q;
  var data = { nombre: W.nombre, tipo: W.tipo, datos: W.datos, estilo: W.estilo, destino: L.target(W.tipo, W.datos) || '' };
  if (!nuevo) { data.id = W.q.id; data.activo = W.activo; }
  if (JSON.stringify(W.estilo).length > 45000) { toast('El logo es demasiado grande'); return; }
  run(function () { return api('cli_qr_save', data); }).then(function (j) {
    closeStudio();
    return run(loadClient).then(function () {
      if (nuevo) { confetti(); toast('¡QR creado!'); var nq = findQR(j.id); if (nq) setTimeout(function () { viewQR(nq); }, 450); }
      else toast('Cambios guardados');
    });
  }).catch(function () {});
}

/* eliminar desde el estudio no; desde editar en modal sencillo */
function editMenu(q) {
  var m = modal('<h2>' + esc(q.nombre) + '</h2>' +
    '<div style="display:grid;gap:8px">' +
    '<button class="btn" data-m="content">' + I('edit', 18) + 'Editar contenido</button>' +
    '<button class="btn" data-m="design">' + I('palette', 18) + 'Cambiar diseño</button>' +
    '<button class="btn" data-m="toggle">' + I(q.activo ? 'pause' : 'play', 18) + (q.activo ? 'Pausar QR' : 'Reactivar QR') + '</button>' +
    '<button class="btn bad" data-m="del">' + I('trash', 18) + 'Eliminar QR</button></div>' +
    '<div class="row"><button class="btn ghost" data-close>Cerrar</button></div>');
  m.addEventListener('click', function (e) {
    var b = e.target.closest('[data-m]'); if (!b) return;
    var a = b.getAttribute('data-m');
    if (a === 'content') { closeModal(m); openStudio(q, 2); }
    else if (a === 'design') { closeModal(m); openStudio(q, 3); }
    else if (a === 'toggle') {
      run(function () { return api('cli_qr_save', { id: q.id, nombre: q.nombre, tipo: q.tipo, datos: q.datos, estilo: q.estilo, destino: L.target(q.tipo, q.datos) || '', activo: !q.activo }); })
        .then(function () { closeModal(m); return run(loadClient); }).then(function () { toast(q.activo ? 'QR pausado' : 'QR reactivado'); }).catch(function () {});
    } else if (a === 'del') {
      ask({ icon: 'trash', danger: 1, title: '¿Eliminar «' + esc(q.nombre) + '»?', text: 'Si ya está impreso, dejará de funcionar. Esta acción no se puede deshacer.', ok: 'Eliminar' }).then(function (y) {
        if (!y) return;
        run(function () { return api('cli_qr_delete', { id: q.id }); }).then(function () { closeModal(m); return run(loadClient); })
          .then(function () { toast('Eliminado'); }).catch(function () {});
      });
    }
  });
}

/* ═════════════ ADMIN ═════════════ */
function loadAdmin() {
  return api('adm_clients').then(function (j) { S.clientes = j.clientes; S.pedidos = j.pedidos || []; S.resumen = j.resumen; S.planes = j.planes || []; renderAdmin(); });
}
function aplan(id) { return (S.planes || []).filter(function (p) { return p.id === id; })[0]; }
function badge(c) {
  if (!c.activo) return '<span class="tag bad">Bloqueado</span>';
  if (c.sinPlan) return '<span class="tag">Sin plan</span>';
  if (c.vencido) return '<span class="tag bad">Caducado</span>';
  if (c.dias <= 7) return '<span class="tag warn">Vence en ' + c.dias + ' d</span>';
  return '<span class="tag ok">' + c.dias + ' días</span>';
}
function renderAdmin() {
  var r = S.resumen, f = S.filtro.toLowerCase();
  var rows = S.clientes.slice().sort(function (a, b) {
    var da = a.sinPlan ? 1e9 : a.dias, db = b.sinPlan ? 1e9 : b.dias; return da - db;
  }).filter(function (c) { return !f || (c.nombre + ' ' + c.email + ' ' + c.telefono).toLowerCase().indexOf(f) >= 0; });
  var peds = S.pedidos.map(function (p, i) {
    var pl = aplan(p.plan);
    return '<div class="ped" style="animation-delay:' + (i * 0.05) + 's"><div class="pi">' + I('card2', 20) + '</div><div class="pb"><b>' + esc(p.nombre) + '</b><span>' + esc(p.email) + '</span>' +
      '<span class="pm2">' + esc(pl ? pl.nombre : p.plan) + ' · ' + p.meses + (p.meses === 1 ? ' mes' : ' meses') + ' · ' + fmtDate(p.fecha) + '</span></div><b class="pimp">' + eur(p.importe) + '</b>' +
      '<div class="pacts"><button class="btn sm pri" data-act="pedok" data-id="' + p.id + '">' + I('check', 16) + 'Activar</button><button class="btn sm" data-act="pedno" data-id="' + p.id + '">Descartar</button></div></div>';
  }).join('');
  var cards = rows.map(function (c, i) {
    var pl = aplan(c.plan);
    return '<div class="cl" style="animation-delay:' + Math.min(i * 0.04, .4) + 's"><div class="h"><div style="min-width:0"><h3>' + esc(c.nombre) + '</h3><div class="mut em">' + esc(c.email) + (c.telefono ? ' · ' + esc(c.telefono) : '') + '</div></div>' + badge(c) + '</div>' +
      '<div class="meta"><span>Plan: <b>' + (pl ? esc(pl.nombre) : '—') + '</b></span><span>Caduca: <b>' + fmtDate(c.caducidad) + '</b></span><span>QR: <b>' + c.usados + '/' + qrN(c.maxQR) + '</b></span><span>Escaneos: <b>' + c.escaneos + '</b></span></div>' +
      '<div class="acts"><button class="btn sm pri" data-act="renewadm" data-id="' + c.id + '">' + I('plus', 16) + 'Renovar</button>' +
      '<button class="btn sm" data-act="editcli" data-id="' + c.id + '">' + I('edit', 16) + 'Editar</button>' +
      '<a class="btn sm icon" href="mailto:' + esc(c.email) + '" title="Escribir correo">' + I('mail', 16) + '</a>' +
      '<button class="btn sm bad icon" data-act="delcli" data-id="' + c.id + '" title="Eliminar">' + I('trash', 16) + '</button></div></div>';
  }).join('');
  var first = !$('#srch');
  $('#main').innerHTML =
    '<div class="welcome' + (first ? ' fade' : '') + '"><div><h1>Panel de administración</h1><p>Clientes, planes, pagos y uso del servicio.</p></div></div>' +
    '<div class="tiles"><div class="tile"><b id="a1">' + r.clientes + '</b><span>Clientes</span></div><div class="tile"><b id="a2">' + r.activos + '</b><span>Con plan activo</span></div>' +
    '<div class="tile"><b><span id="a3">' + r.mensual + '</span> €</b><span>Ingresos al mes</span></div><div class="tile"><b id="a4">' + r.escaneos + '</b><span>Escaneos · ' + r.qrs + ' QR</span></div></div>' +
    (peds ? '<section class="peds"><div class="shead"><h2>' + I('sparkle', 18) + ' Pagos por verificar <span class="tag warn">' + S.pedidos.length + '</span></h2></div><p class="mut" style="margin:-6px 0 10px;font-size:13.5px">Comprueba en myPOS que el concepto lleva el correo del cliente y pulsa Activar: se le suman los días y le llega un correo.</p>' + peds + '</section>' : '') +
    '<div class="tools"><input class="inp" id="srch" placeholder="Buscar por nombre, correo o teléfono…" value="' + esc(S.filtro) + '"><button class="btn pri" data-act="newcli">' + I('plus', 18) + 'Nuevo cliente</button></div>' +
    (cards ? '<div class="cls">' + cards + '</div>' : '<div class="empty">' + (S.clientes.length ? 'Ningún cliente coincide.' : 'Todavía no hay clientes. Cuando alguien se registre aparecerá aquí.') + '</div>');
  if (first) { countUp($('#a1'), r.clientes); countUp($('#a2'), r.activos); countUp($('#a3'), r.mensual); countUp($('#a4'), r.escaneos); }
  var s = $('#srch');
  s.addEventListener('input', function () { S.filtro = s.value; var p = s.selectionStart; renderAdmin(); var n = $('#srch'); n.focus(); n.setSelectionRange(p, p); });
}
function findCli(id) { return S.clientes.filter(function (c) { return c.id === id; })[0]; }
function planSelect(id, cur) {
  return '<select class="inp" id="' + id + '"><option value="">Sin plan</option>' + (S.planes || []).map(function (p) {
    return '<option value="' + p.id + '"' + (p.id === cur ? ' selected' : '') + '>' + esc(p.nombre) + ' · ' + (p.qr >= 100000 ? 'ilimitados' : p.qr + ' QR') + ' · ' + eur(p.precio) + '/mes</option>';
  }).join('') + '</select>';
}
function editCli(c) {
  var nuevo = !c; c = c || { nombre: '', email: '', telefono: '', maxQR: 0, caducidad: '', activo: true, plan: '' };
  var m = modal(
    '<h2>' + (nuevo ? 'Nuevo cliente' : 'Editar cliente') + '</h2>' +
    '<label class="f">Nombre</label><input class="inp" id="cn" maxlength="80" value="' + esc(c.nombre) + '">' +
    '<label class="f">Correo</label><input class="inp" id="ce" type="email" autocapitalize="none" spellcheck="false" value="' + esc(c.email) + '">' +
    '<label class="f">Teléfono</label><input class="inp" id="ct" type="tel" value="' + esc(c.telefono || '') + '">' +
    '<label class="f">Plan</label>' + planSelect('cpl', c.plan) +
    '<div class="cgrp"><div><label class="f">Máximo de QR</label><input class="inp" id="cm" type="number" min="0" value="' + (c.maxQR >= 100000 ? 100000 : c.maxQR) + '"></div>' +
    '<div><label class="f">Caduca el</label><input class="inp" id="cc" type="date" value="' + esc(c.caducidad || '') + '"></div></div>' +
    '<label class="f">' + (nuevo ? 'Contraseña (vacío = se genera y se le envía)' : 'Nueva contraseña (vacío = no cambiar)') + '</label><input class="inp" id="cp" type="text" autocomplete="off" placeholder="mínimo 8 caracteres">' +
    (nuevo ? '<label class="chk"><input type="checkbox" id="cmail" checked><span>Enviarle sus datos de acceso por correo</span></label>' : '') +
    '<label class="chk"><input type="checkbox" id="ca"' + (c.activo ? ' checked' : '') + '><span>Cuenta activa</span></label>' +
    '<div class="row"><button class="btn" data-close>Cancelar</button><button class="btn pri" id="cs">Guardar</button></div>');
  $('#cpl', m).onchange = function () { var p = aplan(this.value); $('#cm', m).value = p ? p.qr : 0; };
  $('#cs', m).onclick = function () {
    var data = { nombre: $('#cn', m).value, email: $('#ce', m).value, telefono: $('#ct', m).value, plan: $('#cpl', m).value, password: $('#cp', m).value,
      maxQR: $('#cm', m).value, caducidad: $('#cc', m).value, activo: $('#ca', m).checked };
    if (nuevo) data.enviar = $('#cmail', m).checked; else data.id = c.id;
    run(function () { return api('adm_client_save', data); }).then(function () { closeModal(m); return run(loadAdmin); }).then(function () { toast('Guardado'); }).catch(function () {});
  };
}
function renewAdm(c) {
  var m = modal(
    '<h2>Renovar a ' + esc(c.nombre) + '</h2>' +
    '<label class="f">Plan</label>' + planSelect('rpl', c.plan || 'p5') +
    '<label class="f">Meses (30 días cada uno)</label><div class="seg" id="rms">' + [1, 2, 3, 6, 12].map(function (n) { return '<button data-n="' + n + '" class="' + (n === 1 ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div>' +
    '<div class="ptot" id="rp"></div>' +
    '<div class="row"><button class="btn" data-close>Cancelar</button><button class="btn pri" id="rs">' + I('check', 18) + 'Activar</button></div>');
  var n = 1;
  function calc() {
    var hoy = todayStr(), base = c.caducidad && c.caducidad > hoy ? c.caducidad : hoy, p = aplan($('#rpl', m).value);
    $('#rp', m).innerHTML = '<span>Nueva caducidad: <b>' + fmtDate(addDays(base, 30 * n)) + '</b></span><b>' + (p ? eur(p.precio * n) : '—') + '</b>';
  }
  m.addEventListener('click', function (e) { var b = e.target.closest('[data-n]'); if (!b) return; n = Number(b.getAttribute('data-n')); $$('[data-n]', m).forEach(function (x) { x.classList.toggle('on', x === b); }); calc(); });
  $('#rpl', m).onchange = calc; calc();
  $('#rs', m).onclick = function () {
    run(function () { return api('adm_renew', { id: c.id, meses: n, plan: $('#rpl', m).value }); }).then(function () { closeModal(m); return run(loadAdmin); }).then(function () { toast('Plan activado'); }).catch(function () {});
  };
}
function pedido(id, accion) {
  var p = S.pedidos.filter(function (x) { return x.id === id; })[0]; if (!p) return;
  var pl = aplan(p.plan);
  var q = accion === 'activar'
    ? ask({ icon: 'check', ok2: 1, title: 'Activar el plan', text: '<b>' + esc(p.nombre) + '</b> · ' + esc(pl ? pl.nombre : '') + ' · ' + p.meses + (p.meses === 1 ? ' mes' : ' meses') + ' · <b>' + eur(p.importe) + '</b><br><span class="mut" style="font-size:13px">¿Has comprobado el cobro en myPOS con el concepto ' + esc(p.email) + '?</span>', ok: 'Sí, activar' })
    : ask({ icon: 'x', danger: 1, title: 'Descartar el aviso de pago', text: 'El cliente seguirá con su plan actual. Úsalo si no encuentras el cobro.', ok: 'Descartar' });
  q.then(function (y) {
    if (!y) return;
    run(function () { return api('adm_pedido', { id: id, accion: accion }); }).then(function () { if (accion === 'activar') confetti(); return run(loadAdmin); })
      .then(function () { toast(accion === 'activar' ? 'Plan activado y cliente avisado' : 'Aviso descartado'); }).catch(function () {});
  });
}

/* ───────── ajustes ───────── */
function settings() {
  var adm = S.rol === 'admin';
  var m = modal(
    '<h2>Ajustes</h2>' +
    '<div class="who2">' + I(adm ? 'key' : 'user', 18) + '<span>' + esc(S.email || '') + '</span></div>' +
    (adm ? '<div class="sbox"><h3>' + I('card2', 18) + 'Cobros con myPOS</h3><label class="f">Tu tag de myPOS (se le añade el importe al final)</label><input class="inp" id="sl" inputmode="url" autocapitalize="none" placeholder="https://mypos.com/@futurmovil">' +
      '<div class="row"><button class="btn pri" id="sls">Guardar</button></div></div>' : '') +
    '<div class="sbox"><h3>' + I('lock', 18) + 'Cambiar contraseña</h3>' +
    (adm ? '' : '<label class="f">Contraseña actual</label>' + pwField('pa', 'current-password')) +
    '<label class="f">Nueva contraseña</label>' + pwField('pn', 'new-password', 'mínimo 8 caracteres') +
    '<div class="row"><button class="btn pri" id="ps">Cambiar contraseña</button></div></div>' +
    (adm ? '<div class="sbox" id="totpbox"><h3>' + I('shield', 18) + 'Google Authenticator</h3><p class="mut">Cargando…</p></div>' +
      '<div class="sbox"><h3>' + I('key', 18) + 'Llave NFC</h3><p class="mut" style="font-size:13.5px;margin:0">En la pantalla de acceso, <b>mantén pulsado «Entrar» 3 segundos</b> y acerca tu llave de la Central de Llaves.</p></div>' : '') +
    '<div class="row"><button class="btn" data-act="shareapp">' + I('share', 18) + 'Compartir app</button>' +
    (isStandalone ? '' : '<button class="btn" data-act="install">' + I('install', 18) + 'Instalar</button>') +
    (adm ? '' : '<a class="btn" href="' + waLink() + '" target="_blank" rel="noopener">' + I('chat', 18) + 'Soporte</a>') + '</div>' +
    '<div class="row"><button class="btn bad" id="so">' + I('x', 18) + 'Cerrar sesión</button><button class="btn ghost" data-close>Cerrar</button></div>');
  m.addEventListener('click', function (e) { var b = e.target.closest('[data-auth="eye"]'); if (!b) return; var i = $('#' + b.getAttribute('data-for'), m); i.type = i.type === 'password' ? 'text' : 'password'; });
  if (adm) {
    api('adm_config').then(function (j) { $('#sl', m).value = j.config.mypos || ''; }).catch(function () {});
    $('#sls', m).onclick = function () { run(function () { return api('adm_config_save', { mypos: $('#sl', m).value }); }).then(function () { toast('Guardado'); }).catch(function () {}); };
    totpBox(m);
  }
  $('#ps', m).onclick = function () {
    var nueva = $('#pn', m).value;
    run(function () { return api(adm ? 'adm_pass' : 'cli_pass', { actual: adm ? undefined : $('#pa', m).value, nueva: nueva }); })
      .then(function (j) { if (j.token) { token = j.token; ls_set(TOK_KEY, token); } toast('Contraseña cambiada'); $('#pn', m).value = ''; if ($('#pa', m)) $('#pa', m).value = ''; }).catch(function () {});
  };
  $('#so', m).onclick = function () {
    ask({ icon: 'x', title: '¿Cerrar sesión?', text: 'Tendrás que volver a entrar con tu correo y contraseña.', ok: 'Cerrar sesión' }).then(function (y) { if (y) { closeModal(m); doLogout(); } });
  };
}
function totpBox(m) {
  var el = $('#totpbox', m); if (!el) return;
  api('totpStatus').then(function (st) {
    el.innerHTML = '<h3>' + I('shield', 18) + 'Google Authenticator</h3>' + (st.activo
      ? '<p class="mut" style="font-size:13.5px">' + '<span class="tag ok">Activado</span> Para entrar deja el <b>correo vacío</b> y pon en la contraseña el <b>código de 6 cifras</b> de la app.</p><div class="row"><button class="btn" data-t="on">Vincular otro móvil</button><button class="btn bad" data-t="off">Desactivar</button></div>'
      : '<p class="mut" style="font-size:13.5px">Entra como administrador sin escribir el correo: solo con el código de 6 cifras de Google Authenticator.</p><div class="row"><button class="btn pri" data-t="on">Configurar</button></div>');
    icons(el);
  }).catch(function () { el.innerHTML = '<h3>Google Authenticator</h3><p class="mut">No se pudo cargar.</p>'; });
  el.onclick = function (e) {
    var b = e.target.closest('[data-t]'); if (!b) return;
    if (b.getAttribute('data-t') === 'off') {
      ask({ icon: 'shield', danger: 1, title: '¿Desactivar Google Authenticator?', text: 'Seguirás pudiendo entrar con tu correo y contraseña o con la llave.', ok: 'Desactivar' }).then(function (y) {
        if (y) run(function () { return api('totpDisable'); }).then(function () { toast('Desactivado'); totpBox(m); }).catch(function () {});
      });
      return;
    }
    run(function () { return api('totpStart'); }).then(function (d) {
      var t = modal('<div class="dlg"><h2>Vincular Google Authenticator</h2><p>1. En la app pulsa <b>+</b> → <b>Escanear un código QR</b>:</p>' +
        '<div class="lvqr">' + QRStyle.svg(d.uri, { dots: 'rounded', eyeOut: 'rounded', eyeIn: 'rounded', fg: '#111827' }, 220) + '</div>' +
        '<p class="mut" style="font-size:12.5px">¿Estás en el mismo móvil? <a href="' + esc(d.uri) + '">Ábrelo en Authenticator</a> o copia esta clave:</p>' +
        '<button class="btn sm" data-c="1" style="margin:0 auto 10px"><code>' + esc(d.secret) + '</code></button>' +
        '<p>2. Escribe el código de 6 cifras que aparece:</p><input class="inp code" id="tcd" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••">' +
        '<div class="row"><button class="btn" data-close>Cancelar</button><button class="btn pri" id="tok">Activar</button></div></div>');
      t.classList.add('center');
      $('[data-c]', t).onclick = function () { copy(d.secret); };
      $('#tok', t).onclick = function () {
        run(function () { return api('totpConfirm', { code: $('#tcd', t).value.trim() }); }).then(function () { closeModal(t); confetti(); toast('Google Authenticator activado'); totpBox(m); }).catch(function () {});
      };
    }).catch(function () {});
  };
}

/* ───────── eventos ───────── */
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  var a = b.getAttribute('data-act'), id = b.getAttribute('data-id');
  if (a === 'install') doInstall();
  else if (a === 'shareapp') shareApp();
  else if (a === 'settings') settings();
  else if (a === 'newqr') tryCreate();
  else if (a === 'plans') plansModal();
  else if (a === 'pedok') pedido(id, 'activar');
  else if (a === 'pedno') pedido(id, 'descartar');
  else if (a === 'viewqr') { var q = findQR(id); if (q) viewQR(q); }
  else if (a === 'editqr') { var q2 = findQR(id); if (q2) editMenu(q2); }
  else if (a === 'designqr') { var q4 = findQR(id); if (q4) openStudio(q4, 3); }
  else if (a === 'statsqr') { var q3 = findQR(id); if (q3) statsQR(q3); }
  else if (a === 'newcli') editCli(null);
  else if (a === 'editcli') { var c = findCli(id); if (c) editCli(c); }
  else if (a === 'renewadm') { var c2 = findCli(id); if (c2) renewAdm(c2); }
  else if (a === 'delcli') {
    var c3 = findCli(id); if (!c3) return;
    ask({ icon: 'trash', danger: 1, title: '¿Eliminar a ' + esc(c3.nombre) + '?', text: 'Se borrarán su cuenta y todos sus códigos QR. No se puede deshacer.', ok: 'Eliminar' }).then(function (y) {
      if (!y) return;
      run(function () { return api('adm_client_delete', { id: id }); }).then(function () { return run(loadAdmin); }).then(function () { toast('Cliente eliminado'); }).catch(function () {});
    });
  }
});

/* ───────── arranque ───────── */
L.injectCss();
icons(document);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
refreshInstall();
if (token) {
  busy(true);
  enter().then(function () { busy(false); }, function (e) { busy(false); if (token) showLogin(e && e.message ? e.message : ''); });
} else showLogin();

window.__QRAPP = { S: S, openStudio: openStudio, renderClient: renderClient, normQ: normQ, get W() { return W; } };
})();
