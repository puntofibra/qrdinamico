/* QR Dinámicos · motor de diseño de códigos QR
 * Genera una "escena" (formas + textos + imágenes) y la pinta en SVG o en canvas.
 * Necesita qr.js (qrcode-generator).  Expone window.QRStyle
 */
(function () {
'use strict';

/* ───────── iconos propios (24×24, trazo) ───────── */
var ICONS = {
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4',
  web:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  user:   'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  card:   'M3 5h18v14H3z M7 10.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M5.5 16a3.5 3.5 0 0 1 7 0 M14.5 9.5h4 M14.5 13h4',
  shop:   'M4 9h16l-1-5H5z M5 9v11h14V9 M9 20v-6h6v6',
  links:  'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  social: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4',
  chat:   'M4 4h16v12H9l-5 4z M8 9h8 M8 12h5',
  mail:   'M3 6h18v12H3z M3 7l9 6 9-6',
  sms:    'M4 5h16v11h-7l-5 4v-4H4z M8 10.5h.01 M12 10.5h.01 M16 10.5h.01',
  phone:  'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  wifi:   'M2 9a15 15 0 0 1 20 0 M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0 M12 19.5h.01',
  text:   'M5 5h14 M12 5v14 M9 19h6',
  coupon: 'M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4z M9 15l6-6 M9.5 9.5h.01 M14.5 14.5h.01',
  menu:   'M7 3v8 M5 3v5a2 2 0 0 0 4 0V3 M7 11v10 M17 3c-2 2-2.5 5-2.5 8H17v10 M17 3v8',
  event:  'M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5 M8 14h3',
  video:  'M3 5h18v14H3z M10 9l5 3-5 3z',
  app:    'M7 2h10v20H7z M11 18.5h2',
  pin:    'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  pdf:    'M6 2h8l5 5v15H6z M14 2v5h5 M9 13h6 M9 17h6',
  star:   'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  heart:  'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z',
  cart:   'M3 4h2l2.4 11h11l2-8H6.2 M9.5 19.5h.01 M17.5 19.5h.01',
  coffee: 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M17 10h1.5a2.5 2.5 0 0 1 0 5H17 M8 2.5v2 M12 2.5v2',
  music:  'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  image:  'M3 4h18v16H3z M3 16l5-5 4 4 3-3 6 6 M15.5 8.5h.01',
  review: 'M4 4h16v12H9l-5 4z M12 6.8l1.1 2.2 2.4.4-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.4z',
  qr:     'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v.01 M14 20h.01 M17 17h4v4h-4',
  edit:   'M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4',
  chart:  'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  down:   'M12 3v12 M7 10l5 5 5-5 M4 20h16',
  share:  'M12 3v12 M7 8l5-5 5 5 M5 13v7h14v-7',
  copy:   'M8 8h12v12H8z M16 8V4H4v12h4',
  trash:  'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  plus:   'M12 5v14 M5 12h14',
  check:  'M5 12.5l4.5 4.5L19 7',
  x:      'M6 6l12 12 M18 6L6 18',
  back:   'M15 5l-7 7 7 7',
  next:   'M9 5l7 7-7 7',
  gear:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2.1 1.2l-.3 2h-4l-.3-2a7 7 0 0 1-2.1-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.7a7 7 0 0 1 2.1-1.2l.3-2h4l.3 2a7 7 0 0 1 2.1 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 3z',
  install:'M12 3v10 M8 9l4 4 4-4 M5 15v5h14v-5',
  card2:  'M3 6h18v12H3z M3 10h18 M7 15h4',
  pause:  'M8 5v14 M16 5v14',
  play:   'M7 4l13 8-13 8z',
  sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  palette:'M12 3a9 9 0 1 0 0 18c1.2 0 1.6-1 1.1-1.9-.6-1-.1-2.1 1.1-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z M7.5 11.5h.01 M10 7.5h.01 M14.5 7.5h.01'
};
function iconSvg(name, size, sw) {
  return '<svg class="ic" viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
}

/* ───────── utilidades de color y geometría ───────── */
function hex2rgb(h) {
  h = String(h || '#000').replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(r) { return '#' + r.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
function mix(a, b, t) { var x = hex2rgb(a), y = hex2rgb(b); return rgb2hex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
function lum(h) {
  var c = hex2rgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) { var l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function f(n) { return Math.round(n * 1000) / 1000; }

/* rectángulo con esquinas independientes [tl,tr,br,bl] */
function rr(x, y, w, h, r) {
  if (typeof r === 'number' || r == null) r = [r || 0, r || 0, r || 0, r || 0];
  var m = Math.min(w, h) / 2, tl = Math.min(r[0], m), tr = Math.min(r[1], m), br = Math.min(r[2], m), bl = Math.min(r[3], m);
  var d = 'M' + f(x + tl) + ' ' + f(y) + 'H' + f(x + w - tr);
  if (tr) d += 'A' + f(tr) + ' ' + f(tr) + ' 0 0 1 ' + f(x + w) + ' ' + f(y + tr);
  d += 'V' + f(y + h - br);
  if (br) d += 'A' + f(br) + ' ' + f(br) + ' 0 0 1 ' + f(x + w - br) + ' ' + f(y + h);
  d += 'H' + f(x + bl);
  if (bl) d += 'A' + f(bl) + ' ' + f(bl) + ' 0 0 1 ' + f(x) + ' ' + f(y + h - bl);
  d += 'V' + f(y + tl);
  if (tl) d += 'A' + f(tl) + ' ' + f(tl) + ' 0 0 1 ' + f(x + tl) + ' ' + f(y);
  return d + 'Z';
}
function circ(cx, cy, r) {
  return 'M' + f(cx - r) + ' ' + f(cy) + 'a' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(2 * r) + ' 0a' + f(r) + ' ' + f(r) + ' 0 1 0 ' + f(-2 * r) + ' 0Z';
}
function poly(pts) { return 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z'; }

/* medir texto para que quepa */
var mctx = null;
var FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
function fitSize(txt, maxW, size) {
  if (!mctx) mctx = document.createElement('canvas').getContext('2d');
  var s = size;
  while (s > 5) {
    mctx.font = '900 ' + s + 'px ' + FONT;
    if (mctx.measureText(txt).width <= maxW) break;
    s -= 0.5;
  }
  return s;
}

/* ───────── opciones ───────── */
var DOTS = [
  ['square', 'Cuadrado'], ['rounded', 'Fluido'], ['dots', 'Puntos'], ['classy', 'Elegante'],
  ['diamond', 'Rombos'], ['mini', 'Píxel'], ['vbars', 'Barras V'], ['hbars', 'Barras H'], ['star', 'Destellos']
];
var EYES_OUT = [['square', 'Cuadrado'], ['rounded', 'Redondeado'], ['circle', 'Círculo'], ['leaf', 'Hoja'], ['frame', 'Mixto']];
var EYES_IN = [['square', 'Cuadrado'], ['rounded', 'Redondeado'], ['circle', 'Círculo'], ['diamond', 'Rombo'], ['leaf', 'Hoja']];
var LOGOS = ['none', 'upload', 'web', 'chat', 'phone', 'mail', 'wifi', 'pin', 'menu', 'coffee', 'cart', 'star', 'heart', 'coupon', 'event', 'user', 'video', 'music'];

var DEFAULT = {
  dots: 'square', eyeOut: 'square', eyeIn: 'square',
  fg: '#111827', fg2: '#4f46e5', grad: 'none', eye: '', eyeIn2: '',
  bg: '#ffffff', transparent: false,
  logo: 'none', logoImg: '', logoColor: '',
  frame: 'none', frameColor: '#111827', frameText: 'ESCANÉAME', frameTextColor: '#ffffff'
};
function norm(st) { var o = {}, k; for (k in DEFAULT) o[k] = DEFAULT[k]; if (st) for (k in st) if (st[k] != null && k in DEFAULT) o[k] = st[k]; return o; }

/* ───────── QR (módulos) ───────── */
function qrMatrix(text, ecl) {
  var q = qrcode(0, ecl);
  q.addData(unescape(encodeURIComponent(text)), 'Byte');
  q.make();
  return q;
}
function inFinder(n, r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); }

/* Dibuja el código (sin marco) en el cuadrado (x,y,s). Devuelve items. */
function qrItems(text, st, x, y, s, withBg) {
  var hasLogo = st.logo && st.logo !== 'none' && (st.logo !== 'upload' || st.logoImg);
  var q = qrMatrix(text, hasLogo ? 'H' : 'Q');
  var n = q.getModuleCount(), m = 2, k = s / (n + 2 * m);
  var ox = x + m * k, oy = y + m * k;
  var items = [];
  var fill = st.fg;
  if (st.grad !== 'none') {
    var g = { grad: st.grad === 'radial' ? 'radial' : 'linear', c1: st.fg, c2: st.fg2 };
    if (g.grad === 'radial') { g.cx = x + s / 2; g.cy = y + s / 2; g.r = s * 0.62; }
    else if (st.grad === 'h') { g.x1 = x; g.y1 = y; g.x2 = x + s; g.y2 = y; }
    else if (st.grad === 'v') { g.x1 = x; g.y1 = y; g.x2 = x; g.y2 = y + s; }
    else { g.x1 = x; g.y1 = y; g.x2 = x + s; g.y2 = y + s; }
    fill = g;
  }
  if (withBg && !st.transparent) items.push({ d: rr(x, y, s, s, s * 0.04), fill: st.bg });

  /* hueco del logo */
  var lz = 0, l0 = 0;
  if (hasLogo) { lz = Math.round(n * 0.24); if ((n - lz) % 2) lz++; l0 = (n - lz) / 2; }
  function dark(r, c) {
    if (r < 0 || c < 0 || r >= n || c >= n) return false;
    if (inFinder(n, r, c)) return false;
    if (lz && r >= l0 - 0.5 && r < l0 + lz + 0.5 && c >= l0 - 0.5 && c < l0 + lz + 0.5) return false;
    return q.isDark(r, c);
  }

  var d = '', r, c;
  var ty = st.dots;
  if (ty === 'vbars' || ty === 'hbars') {
    var vert = ty === 'vbars', w = k * 0.78, pad = (k - w) / 2;
    for (var a = 0; a < n; a++) {
      var b = 0;
      while (b < n) {
        var rr0 = vert ? b : a, cc0 = vert ? a : b;
        if (dark(rr0, cc0)) {
          var s0 = b; while (b < n && dark(vert ? b : a, vert ? a : b)) b++;
          var len = (b - s0) * k - 2 * pad;
          if (vert) d += rr(ox + a * k + pad, oy + s0 * k + pad, w, len, w / 2);
          else d += rr(ox + s0 * k + pad, oy + a * k + pad, len, w, w / 2);
        } else b++;
      }
    }
  } else {
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        if (!dark(r, c)) continue;
        var px = ox + c * k, py = oy + r * k;
        if (ty === 'square') {
          var s1 = c; while (c + 1 < n && dark(r, c + 1)) c++;
          d += 'M' + f(px) + ' ' + f(py) + 'h' + f((c - s1 + 1) * k + 0.01) + 'v' + f(k + 0.01) + 'h' + f(-(c - s1 + 1) * k - 0.01) + 'Z';
        } else if (ty === 'dots') d += circ(px + k / 2, py + k / 2, k * 0.46);
        else if (ty === 'mini') d += rr(px + k * 0.12, py + k * 0.12, k * 0.76, k * 0.76, k * 0.12);
        else if (ty === 'diamond') d += poly([[px + k / 2, py - 0.02 * k], [px + k * 1.02, py + k / 2], [px + k / 2, py + k * 1.02], [px - 0.02 * k, py + k / 2]]);
        else if (ty === 'star') {
          var cx = px + k / 2, cy = py + k / 2, R = k * 0.58, ri = k * 0.2;
          d += poly([[cx, cy - R], [cx + ri, cy - ri], [cx + R, cy], [cx + ri, cy + ri], [cx, cy + R], [cx - ri, cy + ri], [cx - R, cy], [cx - ri, cy - ri]]);
        } else {
          var up = dark(r - 1, c), dn = dark(r + 1, c), lf = dark(r, c - 1), rt = dark(r, c + 1), h = k / 2;
          var rad;
          if (ty === 'classy') rad = [(!up && !lf) ? h : 0, 0, (!dn && !rt) ? h : 0, 0];
          else rad = [(!up && !lf) ? h : 0, (!up && !rt) ? h : 0, (!dn && !rt) ? h : 0, (!dn && !lf) ? h : 0];
          d += rr(px - 0.005, py - 0.005, k + 0.01, k + 0.01, rad);
        }
      }
    }
  }
  items.push({ d: d, fill: fill });

  /* ojos */
  var eo = st.eye || null, ei = st.eyeIn2 || st.eye || null;
  [[0, 0], [0, n - 7], [n - 7, 0]].forEach(function (p, idx) {
    var ex = ox + p[1] * k, ey = oy + p[0] * k, E = 7 * k;
    var od, id2;
    var flip = idx === 1 ? 1 : idx === 2 ? 2 : 0;
    switch (st.eyeOut) {
      case 'rounded': od = rr(ex, ey, E, E, 2.2 * k) + rr(ex + k, ey + k, 5 * k, 5 * k, 1.4 * k); break;
      case 'circle': od = circ(ex + E / 2, ey + E / 2, E / 2) + circ(ex + E / 2, ey + E / 2, 2.5 * k); break;
      case 'leaf': {
        var L = [3.2 * k, 0, 3.2 * k, 0], Li = [2.2 * k, 0, 2.2 * k, 0];
        if (flip === 1) { L = [0, 3.2 * k, 0, 3.2 * k]; Li = [0, 2.2 * k, 0, 2.2 * k]; }
        od = rr(ex, ey, E, E, L) + rr(ex + k, ey + k, 5 * k, 5 * k, Li); break;
      }
      case 'frame': od = rr(ex, ey, E, E, [2.4 * k, 0.5 * k, 2.4 * k, 0.5 * k]) + rr(ex + k, ey + k, 5 * k, 5 * k, [1.6 * k, 0.2 * k, 1.6 * k, 0.2 * k]); break;
      default: od = rr(ex, ey, E, E, 0) + rr(ex + k, ey + k, 5 * k, 5 * k, 0);
    }
    var ix = ex + 2 * k, iy = ey + 2 * k, I = 3 * k;
    switch (st.eyeIn) {
      case 'rounded': id2 = rr(ix, iy, I, I, k * 0.9); break;
      case 'circle': id2 = circ(ix + I / 2, iy + I / 2, I / 2); break;
      case 'diamond': id2 = poly([[ix + I / 2, iy - 0.3 * k], [ix + I + 0.3 * k, iy + I / 2], [ix + I / 2, iy + I + 0.3 * k], [ix - 0.3 * k, iy + I / 2]]); break;
      case 'leaf': id2 = rr(ix, iy, I, I, flip === 1 ? [0, 1.5 * k, 0, 1.5 * k] : [1.5 * k, 0, 1.5 * k, 0]); break;
      default: id2 = rr(ix, iy, I, I, 0);
    }
    items.push({ d: od, fill: eo || fill, rule: 'evenodd' });
    items.push({ d: id2, fill: ei || fill });
  });

  /* logo */
  if (hasLogo) {
    var lx = ox + l0 * k, ly = oy + l0 * k, ls = lz * k;
    var lc = st.logoColor || (typeof fill === 'string' ? fill : st.fg);
    if (st.logo === 'upload') {
      items.push({ d: rr(lx, ly, ls, ls, ls * 0.18), fill: st.transparent ? '#ffffff' : st.bg });
      var p = ls * 0.08;
      items.push({ img: st.logoImg, x: lx + p, y: ly + p, w: ls - 2 * p, h: ls - 2 * p, r: ls * 0.12 });
    } else if (ICONS[st.logo]) {
      items.push({ d: circ(lx + ls / 2, ly + ls / 2, ls / 2), fill: st.transparent ? '#ffffff' : st.bg });
      items.push({ d: circ(lx + ls / 2, ly + ls / 2, ls * 0.43), fill: lc });
      var sc = ls * 0.5 / 24;
      items.push({ d: ICONS[st.logo], stroke: '#ffffff', sw: 2.2, tf: [lx + ls * 0.25, ly + ls * 0.25, sc] });
    }
  }
  return items;
}

/* ───────── marcos ───────── */
var FRAMES = [
  { id: 'none', name: 'Sin marco', cat: 'std' },
  { id: 'tarjeta', name: 'Tarjeta', cat: 'std' },
  { id: 'arriba', name: 'Cabecera', cat: 'std' },
  { id: 'fino', name: 'Línea', cat: 'std' },
  { id: 'burbuja', name: 'Bocadillo', cat: 'std' },
  { id: 'movil', name: 'Móvil', cat: 'std' },
  { id: 'ticket', name: 'Recibo', cat: 'std' },
  { id: 'sobre', name: 'Sobre', cat: 'std' },
  { id: 'portapapeles', name: 'Carpeta', cat: 'std' },
  { id: 'cinta', name: 'Cinta', cat: 'std' },
  { id: 'circulo', name: 'Círculo', cat: 'std' },
  { id: 'taza', name: 'Café', cat: 'food' },
  { id: 'plato', name: 'Plato', cat: 'food' },
  { id: 'palomitas', name: 'Palomitas', cat: 'food' },
  { id: 'vaso', name: 'Refresco', cat: 'food' },
  { id: 'banderines', name: 'Fiesta', cat: 'event' },
  { id: 'entrada', name: 'Entrada', cat: 'event' },
  { id: 'regalo', name: 'Regalo', cat: 'event' },
  { id: 'bolsa', name: 'Bolsa', cat: 'shop' },
  { id: 'etiqueta', name: 'Etiqueta', cat: 'shop' },
  { id: 'escaparate', name: 'Tienda', cat: 'shop' }
];
var FRAME_CATS = [['all', 'Todos'], ['std', 'Estándar'], ['food', 'Comida y bebida'], ['event', 'Eventos'], ['shop', 'Compras']];

function frameScene(st) {
  var C = st.frameColor, TC = st.frameTextColor, T = String(st.frameText || '').toUpperCase().slice(0, 28);
  var dk = mix(C, '#000000', 0.25), lt = mix(C, '#ffffff', 0.35);
  var bg = st.transparent ? '#ffffff' : st.bg;
  var o = { w: 100, h: 100, qx: 0, qy: 0, qs: 100, back: [], front: [], qrBg: true };
  function text(x, y, maxW, size, color, rot) {
    if (!T) return;
    o.front.push({ txt: T, x: x, y: y, size: fitSize(T, maxW, size), fill: color, rot: rot || 0 });
  }
  switch (st.frame) {
    case 'tarjeta':
      o.w = 120; o.h = 148; o.qx = 10; o.qy = 10;
      o.back.push({ d: rr(0, 0, 120, 148, 12), fill: C }, { d: rr(6, 6, 108, 108, 7), fill: bg });
      text(60, 131, 100, 16, TC); break;
    case 'arriba':
      o.w = 120; o.h = 148; o.qx = 10; o.qy = 38;
      o.back.push({ d: rr(0, 0, 120, 148, 12), fill: C }, { d: rr(6, 34, 108, 108, 7), fill: bg });
      text(60, 19, 100, 16, TC); break;
    case 'fino':
      o.w = 120; o.h = 144; o.qx = 10; o.qy = 10;
      o.back.push({ d: rr(1.5, 1.5, 117, 117, 12), fill: bg, stroke: C, sw: 3 });
      text(60, 134, 112, 15, C); break;
    case 'burbuja':
      o.w = 120; o.h = 152; o.qx = 10; o.qy = 10;
      o.back.push({ d: rr(1.5, 1.5, 117, 117, 14), fill: bg, stroke: C, sw: 3 });
      o.back.push({ d: rr(8, 124, 104, 27, 13.5) + poly([[52, 125], [60, 116], [68, 125]]), fill: C });
      text(60, 137.5, 92, 13, TC); break;
    case 'movil':
      o.w = 116; o.h = 172; o.qx = 8; o.qy = 34;
      o.back.push({ d: rr(0, 0, 116, 172, 18), fill: C }, { d: rr(5, 28, 106, 114, 6), fill: bg });
      o.back.push({ d: rr(44, 7, 28, 4, 2), fill: lt });
      o.front.push({ d: circ(58, 157, 7), stroke: TC, sw: 2 });
      text(58, 20, 96, 11, TC); break;
    case 'ticket': {
      o.w = 120; o.h = 156; o.qx = 10; o.qy = 10;
      var zz = [[0, 0], [120, 0], [120, 148]], i;
      for (i = 0; i < 12; i++) { zz.push([120 - i * 10 - 5, 156]); zz.push([120 - i * 10 - 10, 148]); }
      o.back.push({ d: poly(zz), fill: C }, { d: rr(6, 6, 108, 108, 5), fill: bg });
      o.back.push({ d: 'M8 120h104', stroke: lt, sw: 1, dash: '3 3' });
      text(60, 134, 100, 15, TC); break;
    }
    case 'sobre':
      o.w = 130; o.h = 158; o.qx = 17; o.qy = 6;
      o.back.push({ d: rr(12, 1, 106, 120, 6), fill: bg, stroke: C, sw: 2.5 });
      o.front.push({ d: poly([[0, 92], [65, 128], [130, 92], [130, 158], [0, 158]]), fill: C });
      o.front.push({ d: 'M0 158L56 120M130 158L74 120', stroke: dk, sw: 2 });
      o.front.push({ d: poly([[0, 92], [65, 128], [130, 92], [130, 96], [65, 132], [0, 96]]), fill: dk });
      text(65, 148, 70, 11, TC); break;
    case 'portapapeles':
      o.w = 124; o.h = 160; o.qx = 12; o.qy = 28;
      o.back.push({ d: rr(0, 10, 124, 150, 12), fill: C }, { d: rr(8, 22, 108, 130, 5), fill: bg });
      o.back.push({ d: rr(36, 0, 52, 22, 7), fill: dk }, { d: circ(62, 9, 4), fill: bg });
      text(62, 141, 96, 13, C); break;
    case 'cinta':
      o.w = 140; o.h = 152; o.qx = 20; o.qy = 0;
      o.back.push({ d: rr(18, -2, 104, 104, 10), fill: bg, stroke: C, sw: 3 });
      o.back.push({ d: poly([[0, 118], [22, 118], [22, 146], [0, 146], [8, 132]]), fill: dk });
      o.back.push({ d: poly([[140, 118], [118, 118], [118, 146], [140, 146], [132, 132]]), fill: dk });
      o.back.push({ d: poly([[14, 110], [126, 110], [126, 140], [14, 140]]), fill: C });
      text(70, 125, 104, 14, TC); o.qy = 0; break;
    case 'circulo':
      o.w = 150; o.h = 150; o.qx = 34; o.qy = 24; o.qs = 82;
      o.back.push({ d: circ(75, 75, 75), fill: C }, { d: circ(75, 65, 58), fill: bg });
      text(75, 136, 76, 12, TC); break;
    case 'taza':
      o.w = 136; o.h = 160; o.qx = 22; o.qy = 26; o.qs = 82;
      o.back.push({ d: 'M110 46c26 0 26 52-4 52', stroke: C, sw: 9, fill: 'none' });
      o.back.push({ d: poly([[12, 18], [112, 18], [100, 160], [24, 160]]), fill: C });
      o.back.push({ d: rr(4, 4, 116, 16, 7), fill: dk });
      o.back.push({ d: rr(19, 23, 88, 88, 6), fill: bg });
      text(62, 134, 66, 12, TC); break;
    case 'plato':
      o.w = 180; o.h = 164; o.qx = 48; o.qy = 30; o.qs = 84;
      o.back.push({ d: circ(90, 72, 68), fill: C }, { d: circ(90, 72, 60), fill: bg });
      o.back.push({ d: 'M8 12v26a7 7 0 0 0 14 0V12 M15 12v136 M12 12v20 M18 12v20', stroke: C, sw: 3.5, fill: 'none' });
      o.back.push({ d: 'M166 12c-9 9-10 30-10 52h10v84', stroke: C, sw: 3.5, fill: 'none' });
      text(90, 156, 120, 12, C); break;
    case 'palomitas': {
      o.w = 134; o.h = 166; o.qx = 25; o.qy = 46; o.qs = 84;
      var cb = '';
      [[18, 28, 15], [42, 20, 16], [67, 16, 17], [92, 20, 16], [116, 28, 15], [30, 36, 13], [104, 36, 13], [67, 32, 14]].forEach(function (z) { cb += circ(z[0], z[1], z[2]); });
      o.back.push({ d: cb, fill: lt });
      o.back.push({ d: poly([[4, 38], [130, 38], [116, 166], [18, 166]]), fill: C });
      o.back.push({ d: poly([[30, 38], [44, 38], [46, 166], [36, 166]]) + poly([[90, 38], [104, 38], [98, 166], [88, 166]]), fill: lt, op: 0.5 });
      o.back.push({ d: rr(22, 43, 90, 90, 6), fill: bg });
      text(67, 150, 80, 11, TC); break;
    }
    case 'vaso':
      o.w = 124; o.h = 170; o.qx = 20; o.qy = 40; o.qs = 84;
      o.back.push({ d: 'M70 22L84 0', stroke: dk, sw: 5, fill: 'none' });
      o.back.push({ d: rr(4, 20, 116, 14, 7), fill: dk });
      o.back.push({ d: poly([[10, 34], [114, 34], [102, 170], [22, 170]]), fill: C });
      o.back.push({ d: rr(17, 37, 90, 90, 6), fill: bg });
      text(62, 150, 76, 11, TC); break;
    case 'banderines': {
      o.w = 132; o.h = 164; o.qx = 16; o.qy = 44;
      o.back.push({ d: 'M2 6Q66 26 130 6', stroke: dk, sw: 1.5, fill: 'none' });
      var fl1 = '', fl2 = '';
      for (var j = 0; j < 7; j++) {
        var bx = 6 + j * 18, by = 6 + 20 * (1 - Math.pow((bx + 6 - 66) / 64, 2)) * 0.5;
        var tri = poly([[bx, by], [bx + 13, by + 1], [bx + 6.5, by + 18]]);
        if (j % 2) fl2 += tri; else fl1 += tri;
      }
      o.back.push({ d: fl1, fill: C }, { d: fl2, fill: lt });
      o.back.push({ d: rr(13, 41, 106, 106, 9), fill: bg, stroke: C, sw: 3 });
      text(66, 158, 120, 11, C); break;
    }
    case 'entrada':
      o.w = 160; o.h = 116; o.qx = 8; o.qy = 8;
      o.back.push({ d: rr(0, 0, 160, 116, 10), fill: C });
      o.back.push({ d: circ(116, 0, 8) + circ(116, 116, 8), fill: bg === '#ffffff' ? '#ffffff' : bg });
      o.back.push({ d: rr(4, 4, 108, 108, 6), fill: bg });
      o.back.push({ d: 'M116 12v92', stroke: lt, sw: 1.5, dash: '4 4' });
      text(138, 58, 96, 13, TC, -90); break;
    case 'regalo':
      o.w = 136; o.h = 180; o.qx = 18; o.qy = 56;
      o.back.push({ d: 'M68 32c-10-22-36-26-34-10 2 12 24 12 34 10z M68 32c10-22 36-26 34-10-2 12-24 12-34 10z', fill: dk });
      o.back.push({ d: rr(0, 30, 136, 22, 4), fill: C }, { d: rr(6, 52, 124, 128, 4), fill: C });
      o.back.push({ d: 'M62 30h12v150H62z', fill: dk });
      o.back.push({ d: rr(15, 53, 106, 106, 6), fill: bg });
      text(68, 170, 110, 11, TC); break;
    case 'bolsa':
      o.w = 124; o.h = 168; o.qx = 12; o.qy = 46;
      o.back.push({ d: 'M38 44V30a24 24 0 0 1 48 0v14', stroke: dk, sw: 6, fill: 'none' });
      o.back.push({ d: rr(0, 36, 124, 132, 10), fill: C });
      o.back.push({ d: rr(8, 42, 108, 108, 6), fill: bg });
      o.front.push({ d: circ(38, 44, 3) + circ(86, 44, 3), fill: dk });
      text(62, 159, 104, 12, TC); break;
    case 'etiqueta':
      o.w = 156; o.h = 144; o.qx = 46; o.qy = 8;
      o.back.push({ d: poly([[0, 72], [34, 0], [156, 0], [156, 144], [34, 144]]), fill: C });
      o.back.push({ d: circ(22, 72, 7), fill: '#ffffff' });
      o.back.push({ d: rr(42, 4, 108, 108, 6), fill: bg });
      text(96, 128, 104, 13, TC); break;
    case 'escaparate': {
      o.w = 140; o.h = 166; o.qx = 20; o.qy = 46;
      var aw = '';
      for (var a2 = 0; a2 < 7; a2++) aw += rr(a2 * 20, 14, 20, 22, [0, 0, 10, 10]);
      o.back.push({ d: rr(4, 0, 132, 18, 4), fill: dk });
      o.back.push({ d: aw, fill: C });
      o.back.push({ d: (function () { var s = ''; for (var b2 = 1; b2 < 7; b2 += 2) s += rr(b2 * 20, 14, 20, 22, [0, 0, 10, 10]); return s; })(), fill: '#ffffff', op: 0.85 });
      o.back.push({ d: rr(10, 36, 120, 130, 2), fill: C });
      o.back.push({ d: rr(17, 43, 106, 106, 5), fill: bg });
      text(70, 158, 110, 11, TC); break;
    }
  }
  return o;
}

/* escena completa */
function scene(text, stIn) {
  var st = norm(stIn);
  var fr = frameScene(st);
  var items = fr.back.slice();
  var noFrame = st.frame === 'none';
  items = items.concat(qrItems(text, st, fr.qx, fr.qy, fr.qs, noFrame));
  items = items.concat(fr.front);
  return { w: fr.w, h: fr.h, items: items, st: st };
}

/* ───────── salida SVG ───────── */
var gid = 0;
function toSVG(sc, size) {
  var defs = '', body = '';
  function paint(p) {
    if (!p || typeof p === 'string') return p || 'none';
    var id = 'g' + (++gid);
    if (p.grad === 'radial') defs += '<radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="' + f(p.cx) + '" cy="' + f(p.cy) + '" r="' + f(p.r) + '"><stop offset="0" stop-color="' + p.c1 + '"/><stop offset="1" stop-color="' + p.c2 + '"/></radialGradient>';
    else defs += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + f(p.x1) + '" y1="' + f(p.y1) + '" x2="' + f(p.x2) + '" y2="' + f(p.y2) + '"><stop offset="0" stop-color="' + p.c1 + '"/><stop offset="1" stop-color="' + p.c2 + '"/></linearGradient>';
    return 'url(#' + id + ')';
  }
  sc.items.forEach(function (it) {
    if (it.txt != null) {
      var tr = it.rot ? ' transform="rotate(' + it.rot + ' ' + f(it.x) + ' ' + f(it.y) + ')"' : '';
      body += '<text x="' + f(it.x) + '" y="' + f(it.y) + '" font-family=\'' + FONT.replace(/"/g, '') + '\' font-weight="900" font-size="' + f(it.size) + '" fill="' + it.fill + '" text-anchor="middle" dominant-baseline="central"' + tr + '>' + String(it.txt).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</text>';
    } else if (it.img) {
      var cid = 'c' + (++gid);
      defs += '<clipPath id="' + cid + '"><path d="' + rr(it.x, it.y, it.w, it.h, it.r || 0) + '"/></clipPath>';
      body += '<image href="' + it.img + '" x="' + f(it.x) + '" y="' + f(it.y) + '" width="' + f(it.w) + '" height="' + f(it.h) + '" preserveAspectRatio="xMidYMid meet" clip-path="url(#' + cid + ')"/>';
    } else {
      var a = ' d="' + it.d + '"';
      a += ' fill="' + (it.stroke && !it.fill ? 'none' : paint(it.fill)) + '"';
      if (it.rule) a += ' fill-rule="evenodd"';
      if (it.stroke) a += ' stroke="' + it.stroke + '" stroke-width="' + it.sw + '" stroke-linecap="round" stroke-linejoin="round"' + (it.dash ? ' stroke-dasharray="' + it.dash + '"' : '');
      if (it.op) a += ' opacity="' + it.op + '"';
      if (it.tf) a += ' transform="translate(' + f(it.tf[0]) + ' ' + f(it.tf[1]) + ') scale(' + f(it.tf[2]) + ')"' + (it.stroke ? ' vector-effect="none"' : '');
      body += '<path' + a + '/>';
    }
  });
  var W = size || 1024, H = Math.round(W * sc.h / sc.w);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + sc.w + ' ' + sc.h + '" width="' + W + '" height="' + H + '">' + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>';
}

/* ───────── salida canvas ───────── */
var imgCache = {};
function loadImg(src) {
  if (imgCache[src]) return imgCache[src];
  imgCache[src] = new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; });
  return imgCache[src];
}
function toCanvas(sc, canvas, pxW) {
  var srcs = sc.items.filter(function (i) { return i.img; }).map(function (i) { return i.img; });
  return Promise.all(srcs.map(loadImg)).then(function (imgs) {
    var map = {}; srcs.forEach(function (s, i) { map[s] = imgs[i]; });
    var W = pxW, H = Math.round(pxW * sc.h / sc.w), k = W / sc.w;
    canvas.width = W; canvas.height = H;
    var g = canvas.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.setTransform(k, 0, 0, k, 0, 0);
    function paint(p) {
      if (!p || typeof p === 'string') return p;
      var gr = p.grad === 'radial' ? g.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.r) : g.createLinearGradient(p.x1, p.y1, p.x2, p.y2);
      gr.addColorStop(0, p.c1); gr.addColorStop(1, p.c2); return gr;
    }
    sc.items.forEach(function (it) {
      g.save();
      if (it.op) g.globalAlpha = it.op;
      if (it.txt != null) {
        g.translate(it.x, it.y); if (it.rot) g.rotate(it.rot * Math.PI / 180);
        g.font = '900 ' + it.size + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = it.fill; g.fillText(it.txt, 0, 0);
      } else if (it.img) {
        var im = map[it.img];
        if (im) {
          g.clip(new Path2D(rr(it.x, it.y, it.w, it.h, it.r || 0)));
          var r = Math.min(it.w / im.width, it.h / im.height), dw = im.width * r, dh = im.height * r;
          g.drawImage(im, it.x + (it.w - dw) / 2, it.y + (it.h - dh) / 2, dw, dh);
        }
      } else {
        if (it.tf) { g.translate(it.tf[0], it.tf[1]); g.scale(it.tf[2], it.tf[2]); }
        var p = new Path2D(it.d);
        if (it.fill && it.fill !== 'none') { g.fillStyle = paint(it.fill); g.fill(p, it.rule || 'nonzero'); }
        if (it.stroke) {
          g.strokeStyle = it.stroke; g.lineWidth = it.sw; g.lineCap = 'round'; g.lineJoin = 'round';
          if (it.dash) g.setLineDash(it.dash.split(' ').map(Number));
          g.stroke(p);
        }
      }
      g.restore();
    });
    return canvas;
  });
}

/* plantillas rápidas */
var PRESETS = [
  { name: 'Clásico', st: {} },
  { name: 'Índigo', st: { dots: 'rounded', eyeOut: 'rounded', eyeIn: 'rounded', fg: '#312e81', grad: 'd', fg2: '#7c3aed' } },
  { name: 'Burbujas', st: { dots: 'dots', eyeOut: 'circle', eyeIn: 'circle', fg: '#0f766e', eye: '#0d9488' } },
  { name: 'Atardecer', st: { dots: 'classy', eyeOut: 'leaf', eyeIn: 'leaf', fg: '#e11d48', grad: 'h', fg2: '#f59e0b' } },
  { name: 'Océano', st: { dots: 'vbars', eyeOut: 'rounded', eyeIn: 'circle', fg: '#0369a1', grad: 'radial', fg2: '#22d3ee' } },
  { name: 'Lavanda', st: { dots: 'rounded', eyeOut: 'frame', eyeIn: 'rounded', fg: '#1e1b4b', bg: '#ede9fe', eye: '#7c3aed' } },
  { name: 'Bosque', st: { dots: 'mini', eyeOut: 'rounded', eyeIn: 'diamond', fg: '#166534', eye: '#65a30d' } },
  { name: 'Neón', st: { dots: 'star', eyeOut: 'circle', eyeIn: 'diamond', fg: '#db2777', grad: 'd', fg2: '#7c3aed', bg: '#fdf4ff' } }
];

window.QRStyle = {
  ICONS: ICONS, icon: iconSvg, DOTS: DOTS, EYES_OUT: EYES_OUT, EYES_IN: EYES_IN, LOGOS: LOGOS,
  FRAMES: FRAMES, FRAME_CATS: FRAME_CATS, PRESETS: PRESETS, DEFAULT: DEFAULT,
  norm: norm, scene: scene, toSVG: toSVG, toCanvas: toCanvas, contrast: contrast, mix: mix,
  svg: function (text, st, size) { return toSVG(scene(text, st), size); },
  draw: function (canvas, text, st, px) { return toCanvas(scene(text, st), canvas, px || 600); }
};
})();
