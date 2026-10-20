#!/usr/bin/env node
'use strict';

/**
 * threerouter-bulk-apikey CLI — mint ThreeRouter accounts, one API key per
 * account, and keep only the keys that survived a live chat call.
 *
 * The panel is **Sub2API v0.2.0** (Go + Vue), not new-api: `/api/status` and
 * `/api/pricing` answer 404, the real gates live under `/api/v1` and the relay
 * on its own host (`api_base_url` from `/api/v1/settings/public`). Every new
 * account lands with a **$10 signup bonus** of spendable balance.
 *
 * Registration is gated by the panel's own "human verification" (a jigsaw
 * slider or an image-click puzzle) plus a **6-char alphanumeric e-mail code**.
 * Both puzzle modes are solved inside this file — no browser, no service:
 *
 *   slider      the notch in the background is the piece content times a
 *               constant, so the offset is plain template correlation
 *               (measured Pearson r = 0.9997, ratio CV 0.004);
 *   image_click shapes are painted translucent over a photo, so the fill is not
 *               the palette RGB — it is flat *within* a shape but shifts per
 *               challenge, so detection keys on the image's own dominant
 *               saturated fills, colour comes from the fill's hue, and the
 *               shape from IoU against rotated ideal templates.
 *
 * Flow, per account, with every panel request through one pinned exit when a
 * proxy list is provided:
 *   1. gates      `GET  /api/v1/settings/public`  → register/e-mail/captcha flags
 *   2. captcha    `POST /api/v1/auth/captcha/challenge` → solve → `/verify` →
 *                 `captcha_token` (900 s, single use, bound to the exit that solved it)
 *   3. mailbox    temp.tf alias (@hotmail/@outlook/@live/@msn, panel-whitelisted)
 *                 or Emailnator @gmail.com
 *   4. send code  `POST /api/v1/auth/send-verify-code` {email, click_captcha_token}
 *   5. code       poll the mailbox for the 6-char code
 *   6. register   `POST /api/v1/auth/register` {email, password, verify_code, click_captcha_token}
 *                 → `access_token`
 *   7. groups     `GET  /api/v1/groups/available` (the signup bonus is spendable there)
 *   8. key        `POST /api/v1/keys` {name, group_id}
 *   9. gate       `POST <relay>/chat/completions` → 200 with content = keep
 *
 * A key is appended to `keys.txt` only after step 9 answers 200 with content
 * (or `reasoning_content` — this panel's reasoning models sometimes spend the
 * whole budget on thinking and answer with an empty `content`). Everything else
 * is recorded in `accounts.json`.
 *
 * Options:
 *   --count N        accounts (= keys) to mint                            [5]
 *   --conc N         accounts in flight (keep 1 — serial is the proven mode) [1]
 *   --gap MS         pause between batches                                [1500]
 *   --model <id>     model used for the live gate               [minimax-m3]
 *   --group <id|name> group for the key (default: the panel's first group)
 *   --mail <rail>    temptf | emailnator                                [temptf]
 *   --mail-providers temp.tf providers, comma separated   [hotmail,outlook]
 *   --pool <file>    proxy list, one exit per line (env THREEROUTER_PROXIES) [optional]
 *   --tries N        exits tried per account before giving up              [2]
 *   --timeout MS     per-request timeout                                [60000]
 *   --code-timeout S seconds to wait for the e-mail code                   [240]
 *   --captcha-cmd C  solve with an external command instead of the built-in
 *                    solver: the challenge JSON goes to its stdin, the answer
 *                    ({drop_x,trajectory} or {clicks}) comes back on stdout
 *   --solve-file F   offline: solve one saved challenge JSON and print the answer
 *   --verify-only    re-run every key in keys.txt through the chat gate
 *   --screen         only test the proxy list against the panel
 *   --connect-9router  register this provider (and one key) on a local 9Router
 *   --help
 *
 * Zero dependencies. Node.js >= 18. Your proxy list is OPTIONAL: pass `--pool`
 * (or the THREEROUTER_PROXIES env) and every request goes through an exit from
 * it; without a pool the tool connects directly.
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const tls = require('tls');
const http = require('http');
const zlib = require('zlib');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
const OUT_DIR = path.join(ROOT, 'out');

const BASE = 'https://threerouter.com';
const API = `${BASE}/api/v1`;
const DEFAULT_RELAY = 'https://api.threerouter.com/v1';
const TEMPTF = 'https://temp.tf';
const EMAILNATOR = 'https://www.emailnator.com';
const MODEL_LIST = ['minimax-m3', 'deepseek-v4-pro', 'glm-5.3', 'kimi-k3', 'qwen3.8-max'];
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  return dflt;
}
const has = (name) => argv.includes(`--${name}`) || argv.includes(`-${name}`);

if (has('help') || has('h')) {
  console.log(`threerouter-bulk-apikey — mint ThreeRouter accounts, one key each, verified by a live chat call.

  node src/cli.js --count 5            mint (a key is kept only after a chat 200)
  node src/cli.js --verify-only        re-check every key in keys.txt
  node src/cli.js --screen             test your proxy list against ThreeRouter
  node src/cli.js --connect-9router    register the provider + one key on a local 9Router
  node src/cli.js --help

  --count N        accounts to mint                                     [5]
  --conc N         accounts in flight (keep 1 — serial is the proven mode) [1]
  --model <id>     model used for the live gate              [minimax-m3]
  --group <id>     group for the key (default: the panel's first)       [-]
  --mail <rail>    temptf | emailnator                              [temptf]
  --pool <file>    proxy list, one exit per line (env THREEROUTER_PROXIES) [optional]
  --captcha-cmd C  external captcha solver (challenge JSON on stdin)

Requests go through the exits in your proxy list when one is provided (--pool or
the THREEROUTER_PROXIES env). Without a pool the tool connects DIRECTLY.

The panel's own captcha (jigsaw slider / image-click puzzle) is solved by the
built-in solver — no browser, no third-party service, no dependencies.`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '5'), 10) || 5);
const CONC = Math.min(2, Math.max(1, parseInt(arg('conc', '1'), 10) || 1));
const GAP_MS = Math.max(0, parseInt(arg('gap', '1500'), 10) || 0);
const TRIES = Math.max(1, parseInt(arg('tries', '2'), 10) || 2);
const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
const CODE_TIMEOUT_MS = Math.max(30, parseInt(arg('code-timeout', '240'), 10) || 240) * 1000;
const MODEL = arg('model', process.env.THREEROUTER_MODEL || 'minimax-m3');
const GROUP = arg('group', '');
const MAIL_RAIL = arg('mail', 'temptf');
const MAIL_PROVIDERS = arg('mail-providers', 'hotmail,outlook').split(',').map((s) => s.trim()).filter(Boolean);
const CAPTCHA_CMD = arg('captcha-cmd', '');
const SOLVE_FILE = arg('solve-file', '');
const TAG = arg('tag', 'tr');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const CONNECT_9ROUTER = has('connect-9router');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT_DIR, { recursive: true });
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const pad = (s) => String(s).padStart(2, '0');

// ------------------------------------------------------------------- proxy
function parseProxy(line) {
  const s = String(line || '').trim();
  if (!s || s.startsWith('#')) return null;
  let m = s.match(/^(https?|socks5h?|socks4):\/\/(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)/i);
  if (!m) m = s.match(/^(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)$/);
  if (!m) return null;
  if (m.length === 6) {
    const raw = m[1].toLowerCase();
    if (raw === 'socks4') return null;
    return {
      protocol: raw.startsWith('socks') ? 'socks5' : 'http',
      host: m[4],
      port: Number(m[5]),
      auth: m[2] ? `${m[2]}:${m[3]}` : null,
      line: s,
    };
  }
  return { protocol: 'http', host: m[3], port: Number(m[4]), auth: m[1] ? `${m[1]}:${m[2]}` : null, line: s };
}

/** A raw socket straight to host:port — the direct-mode twin of connectThrough. */
function directConnect(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    const t = setTimeout(() => {
      sock.destroy();
      reject(new Error(`connect timeout (${host}:${port})`));
    }, timeoutMs);
    sock.once('connect', () => {
      clearTimeout(t);
      resolve(sock);
    });
    sock.once('error', (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function connectThrough(proxy, host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxy.host, port: proxy.port });
    const t = setTimeout(() => {
      sock.destroy();
      reject(new Error(`proxy timeout (${proxy.host}:${proxy.port})`));
    }, timeoutMs);
    const done = (err, s) => {
      clearTimeout(t);
      if (err) {
        try {
          sock.destroy();
        } catch (e) {
          /* already gone */
        }
        reject(err);
      } else resolve(s);
    };
    sock.once('error', (e) => done(new Error(`proxy connect failed: ${e.message}`)));
    sock.once('connect', () => {
      if (proxy.protocol === 'socks5') {
        sock.write(proxy.auth ? Buffer.from([5, 2, 0, 2]) : Buffer.from([5, 1, 0]));
        let stage = 0;
        let buf = Buffer.alloc(0);
        const sendConnect = () => {
          const hb = Buffer.from(host);
          sock.write(Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 0xff])]));
        };
        const onData = (d) => {
          try {
            buf = Buffer.concat([buf, d]);
            for (;;) {
              if (stage === 0) {
                if (buf.length < 2) return;
                const v = buf;
                buf = buf.slice(2);
                if (v[0] !== 5) return done(new Error('SOCKS5 bad version'));
                if (v[1] === 2) {
                  if (!proxy.auth) return done(new Error('SOCKS5 auth required'));
                  const [u, p] = proxy.auth.split(':');
                  sock.write(
                    Buffer.concat([Buffer.from([1, u.length]), Buffer.from(u), Buffer.from([p.length]), Buffer.from(p)]),
                  );
                  stage = 1;
                  continue;
                }
                if (v[1] !== 0) return done(new Error('SOCKS5 no acceptable method'));
                stage = 2;
                sendConnect();
                continue;
              }
              if (stage === 1) {
                if (buf.length < 2) return;
                const v = buf;
                buf = buf.slice(2);
                if (v[1] !== 0) return done(new Error('SOCKS5 auth failed'));
                stage = 2;
                sendConnect();
                continue;
              }
              if (stage === 2) {
                if (buf.length < 5) return;
                const atyp = buf[3];
                const need = 4 + (atyp === 1 ? 4 : atyp === 3 ? 1 + buf[4] : 16) + 2;
                if (buf.length < need) return;
                const rep = buf[1];
                buf = buf.slice(need);
                if (rep !== 0) return done(new Error(`SOCKS5 connect failed (code ${rep})`));
                sock.off('data', onData);
                return done(null, sock);
              }
            }
          } catch (e) {
            done(e);
          }
        };
        sock.on('data', onData);
        return;
      }
      const auth = proxy.auth ? `Proxy-Authorization: Basic ${Buffer.from(proxy.auth).toString('base64')}\r\n` : '';
      sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n${auth}\r\n`);
      let buf = '';
      const onData = (d) => {
        buf += d;
        if (!buf.includes('\r\n\r\n')) return;
        sock.off('data', onData);
        if (!/^HTTP\/\d(\.\d)? 200/.test(buf)) return done(new Error(`proxy CONNECT refused: ${buf.split('\r\n')[0]}`));
        done(null, sock);
      };
      sock.on('data', onData);
    });
  });
}

/** One HTTPS request through one exit (or directly). Returns { status, headers, body }. */
async function exitFetch(proxy, url, { method = 'GET', headers = {}, body = null, timeoutMs = TIMEOUT_MS } = {}) {
  const u = new URL(url);
  const raw = proxy
    ? await connectThrough(proxy, u.hostname, u.port || 443, timeoutMs)
    : await directConnect(u.hostname, u.port || 443, timeoutMs);
  const sock = tls.connect({ socket: raw, servername: u.hostname });
  await new Promise((res, rej) => {
    sock.once('secureConnect', res);
    sock.once('error', rej);
  });
  const chunks = [];
  let resolve;
  let reject;
  const p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const req = http.request({
    method,
    path: u.pathname + u.search,
    createConnection: () => sock,
    headers: { host: u.host, 'user-agent': UA, accept: '*/*', ...headers },
  });
  const t = setTimeout(() => {
    try {
      req.destroy();
    } catch (e) {
      /* gone */
    }
    reject(new Error('request timeout'));
  }, timeoutMs);
  req.on('response', (res) => {
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
      clearTimeout(t);
      resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') });
    });
  });
  req.on('error', (e) => {
    clearTimeout(t);
    reject(e);
  });
  if (body != null) {
    req.write(Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
  }
  req.end();
  return p;
}

async function exitJson(proxy, url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body != null && !Buffer.isBuffer(opts.body)) headers['content-type'] = 'application/json';
  const r = await exitFetch(proxy, url, { ...opts, headers });
  let json = null;
  try {
    json = JSON.parse(r.body);
  } catch (e) {
    /* not json */
  }
  return { status: r.status, json, text: r.body };
}

// ------------------------------------------------------------------- pool
let PROXIES = [null];
function loadExits() {
  const poolArg = arg('pool', process.env.THREEROUTER_PROXIES || 'proxies.txt');
  const poolFile = fs.existsSync(path.resolve(poolArg)) ? path.resolve(poolArg) : path.resolve(ROOT, poolArg);
  if (!fs.existsSync(poolFile)) {
    console.log(
      `no proxy list at ${poolFile} — running WITHOUT a proxy (direct). Put exits there (or pass --pool) to route through them.`,
    );
    return [null];
  }
  const exits = fs
    .readFileSync(poolFile, 'utf8')
    .split(/\r?\n/)
    .map(parseProxy)
    .filter(Boolean);
  if (!exits.length) {
    console.log(`${poolFile} has no usable exits — running WITHOUT a proxy (direct).`);
    return [null];
  }
  console.log(`proxy list ${poolFile}: ${exits.length} exit(s)`);
  return exits;
}

async function screen(exits) {
  let ok = 0;
  for (const e of exits.slice(0, 64)) {
    try {
      const t0 = Date.now();
      const r = await exitJson(e, `${API}/settings/public`, { timeoutMs: 20000 });
      const good = r.status === 200 && r.json && r.json.data && r.json.data.registration_enabled !== undefined;
      if (good) ok++;
      console.log(`  ${good ? '✔' : '✘'} ${e ? `${e.host}:${e.port}` : 'direct'} status=${r.status} ${Date.now() - t0}ms`);
    } catch (err) {
      console.log(`  ✘ ${e ? `${e.host}:${e.port}` : 'direct'} ${String(err.message).slice(0, 80)}`);
    }
  }
  console.log(`screened ${Math.min(exits.length, 64)} exit(s): ${ok} reach ${BASE}`);
  return ok;
}

// ================================================================== captcha
// Everything below is pure JS: PNG decode (zlib + defilter), a correlation
// solver for the slider and a template-IoU classifier for the image puzzle.

const PALETTE = {
  red: [0xef, 0x44, 0x44],
  blue: [0x3b, 0x82, 0xf6],
  green: [0x22, 0xc5, 0x5e],
  yellow: [0xea, 0xb3, 0x08],
  purple: [0xa8, 0x55, 0xf7],
};
const SHAPES = ['circle', 'square', 'hexagon', 'triangle', 'star'];
const NORM = 64;
const FILL_TOL = 14;
const SAT_MIN = 90;
const MIN_PEAK = 250;
const MIN_AREA = 350;

/** PNG (8-bit, non-interlaced, colour types 0/2/4/6) → { width, height, rgba }. */
function decodePng(buf) {
  if (!buf || buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8;
  let hdr = null;
  const idat = [];
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      hdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!hdr) throw new Error('PNG without IHDR');
  if (hdr.depth !== 8) throw new Error(`PNG bit depth ${hdr.depth} unsupported`);
  if (hdr.interlace) throw new Error('interlaced PNG unsupported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[hdr.colorType];
  if (!channels) throw new Error(`PNG colour type ${hdr.colorType} unsupported`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = hdr.width * channels;
  const out = Buffer.alloc(stride * hdr.height);
  let prev = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < hdr.height; y++) {
    const filter = raw[p++];
    const line = Buffer.from(raw.slice(p, p + stride));
    p += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (filter === 1) v = (v + a) & 0xff;
      else if (filter === 2) v = (v + b) & 0xff;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const pa = Math.abs(b - c);
        const pb = Math.abs(a - c);
        const pc = Math.abs(a + b - 2 * c);
        const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        v = (v + pred) & 0xff;
      }
      line[i] = v;
    }
    line.copy(out, y * stride);
    prev = line;
  }
  const rgba = new Uint8Array(hdr.width * hdr.height * 4);
  for (let i = 0, n = hdr.width * hdr.height; i < n; i++) {
    const s = i * channels;
    const d = i * 4;
    if (channels === 1 || channels === 2) {
      rgba[d] = rgba[d + 1] = rgba[d + 2] = out[s];
      rgba[d + 3] = channels === 2 ? out[s + 1] : 255;
    } else {
      rgba[d] = out[s];
      rgba[d + 1] = out[s + 1];
      rgba[d + 2] = out[s + 2];
      rgba[d + 3] = channels === 4 ? out[s + 3] : 255;
    }
  }
  return { width: hdr.width, height: hdr.height, rgba };
}

function hueOf([r, g, b]) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h / 2; // OpenCV scale 0..180
}
const satOf = ([r, g, b]) => {
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : ((max - Math.min(r, g, b)) / max) * 255;
};
const hueDist = (a, b) => {
  const d = Math.abs(a - b);
  return Math.min(d, 180 - d);
};
const HUE = Object.fromEntries(Object.entries(PALETTE).map(([n, c]) => [n, hueOf(c)]));

function colorOfRgb(rgb) {
  const h = hueOf(rgb);
  let best = '?';
  let score = 1e9;
  for (const [name, hh] of Object.entries(HUE)) {
    const d = hueDist(h, hh);
    if (d < score) {
      score = d;
      best = name;
    }
  }
  return { color: best, dist: score };
}

function solveSlider(data) {
  const bg = decodePng(Buffer.from(data.bg_image, 'base64'));
  const piece = decodePng(Buffer.from(data.piece_image, 'base64'));
  const y = Number(data.piece_y);
  const pw = piece.width;
  const ph = piece.height;
  let mask = [];
  for (let i = 0; i < pw * ph; i++) if (piece.rgba[i * 4 + 3] === 255) mask.push(i);
  if (!mask.length) for (let i = 0; i < pw * ph; i++) if (piece.rgba[i * 4 + 3] > 0) mask.push(i);
  if (!mask.length) return null;
  // Pearson correlation of the piece content against the strip at piece_y. Both
  // the reference and the candidate are pooled over the three channels, so the
  // reference variance must be pooled the same way: subtracting per-channel
  // means instead drops the between-channel spread and inflates r (measured
  // 2.27 against a true 0.9992 on a live challenge).
  const N = mask.length * 3;
  let refSum = 0;
  let refSum2 = 0;
  for (let k = 0; k < mask.length; k++) {
    const i = mask[k];
    for (let ch = 0; ch < 3; ch++) {
      const a = piece.rgba[i * 4 + ch];
      refSum += a;
      refSum2 += a * a;
    }
  }
  const refVar = refSum2 / N - (refSum / N) ** 2;
  if (refVar <= 0) return null;
  let best = { r: -2, x: 0 };
  for (let x = 0; x + pw <= bg.width; x++) {
    if (y + ph > bg.height) break;
    let sRC = 0;
    let sC = 0;
    let sC2 = 0;
    for (let k = 0; k < mask.length; k++) {
      const i = mask[k];
      const px = x + (i % pw);
      const py = y + Math.floor(i / pw);
      const o = (py * bg.width + px) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const a = piece.rgba[i * 4 + ch];
        const b = bg.rgba[o + ch];
        sRC += a * b;
        sC += b;
        sC2 += b * b;
      }
    }
    const varC = sC2 / N - (sC / N) ** 2;
    if (varC <= 0) continue;
    const cov = sRC / N - (refSum / N) * (sC / N);
    const r = cov / Math.sqrt(refVar * varC);
    if (r > best.r) best = { r, x };
  }
  if (best.r < 0.9) return null;
  return { drop_x: best.x, trajectory: humanTrack(best.x, y), _r: Number(best.r.toFixed(5)) };
}

function humanTrack(dropX, pieceY, steps = 26, duration = 900) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    let x = dropX * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, f * 0.94)));
    if (f > 0.88 && f < 0.965) x = dropX * (1 + 0.012 * Math.sin(((f - 0.88) / 0.085) * Math.PI));
    x += Math.sin(i * 1.7) * 0.6;
    pts.push({
      x: Number(Math.max(0, Math.min(x, dropX + 3)).toFixed(2)),
      y: Number((pieceY + Math.sin(i * 0.9) * 0.5).toFixed(2)),
      t: Math.round(f * duration),
    });
  }
  pts[pts.length - 1] = { x: dropX, y: pieceY, t: duration };
  return pts;
}

/** Rasterise one ideal shape into a NORM x NORM 0/1 canvas (bbox-normalised convention). */
function template(name) {
  const t = new Uint8Array(NORM * NORM);
  const R = NORM / 2;
  const poly = (pts) => {
    for (let y = 0; y < NORM; y++) {
      for (let x = 0; x < NORM; x++) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) t[y * NORM + x] = 1;
      }
    }
  };
  if (name === 'square') t.fill(1);
  else if (name === 'circle') {
    for (let y = 0; y < NORM; y++)
      for (let x = 0; x < NORM; x++) if (((x - R) / R) ** 2 + ((y - R) / R) ** 2 <= 1) t[y * NORM + x] = 1;
  } else if (name === 'hexagon') {
    poly(Array.from({ length: 6 }, (_, i) => [R + R * Math.cos((Math.PI / 3) * i), R + R * Math.sin((Math.PI / 3) * i)]));
  } else if (name === 'triangle') {
    poly([
      [NORM / 2, 0],
      [0, NORM - 1],
      [NORM - 1, NORM - 1],
    ]);
  } else if (name === 'star') {
    poly(
      Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? R : R * 0.42;
        const a = -Math.PI / 2 + (Math.PI / 5) * i;
        return [R + r * Math.cos(a), R + r * Math.sin(a)];
      }),
    );
  }
  return t;
}
const TEMPLATES = Object.fromEntries(SHAPES.map((n) => [n, template(n)]));

/** Crop to content and resample to NORM x NORM (nearest) — same as the bbox normalisation the templates assume. */
function normalise(mask, w, h) {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0 || y1 < y0) return null;
  const sw = x1 - x0 + 1;
  const sh = y1 - y0 + 1;
  const out = new Uint8Array(NORM * NORM);
  for (let y = 0; y < NORM; y++) {
    const sy = y0 + Math.min(sh - 1, Math.floor((y * sh) / NORM));
    for (let x = 0; x < NORM; x++) {
      const sx = x0 + Math.min(sw - 1, Math.floor((x * sw) / NORM));
      out[y * NORM + x] = mask[sy * w + sx];
    }
  }
  return out;
}

function rotate(mask, w, h, deg) {
  const out = new Uint8Array(w * h);
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const sx = Math.round(cx + dx * cos + dy * sin);
      const sy = Math.round(cy + -dx * sin + dy * cos);
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
      out[y * w + x] = mask[sy * w + sx];
    }
  }
  return out;
}

function classifyShape(mask, w, h) {
  const scores = {};
  for (let angle = 0; angle < 360; angle += 15) {
    const cand = normalise(angle === 0 ? mask : rotate(mask, w, h, angle), w, h);
    if (!cand) continue;
    for (const name of SHAPES) {
      const tpl = TEMPLATES[name];
      let inter = 0;
      let union = 0;
      for (let i = 0; i < NORM * NORM; i++) {
        const a = cand[i];
        const b = tpl[i];
        if (a && b) inter++;
        if (a || b) union++;
      }
      const iou = union ? inter / union : 0;
      if (!(name in scores) || iou > scores[name]) scores[name] = iou;
    }
  }
  let best = ['?', 0];
  for (const [k, v] of Object.entries(scores)) if (v > best[1]) best = [k, v];
  return best;
}

function dominantFills(img) {
  const { width, height, rgba } = img;
  const counts = new Map();
  for (let i = 0; i < width * height; i++) {
    const key = (rgba[i * 4] << 16) | (rgba[i * 4 + 1] << 8) | rgba[i * 4 + 2];
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 400);
  const out = [];
  for (const [key, count] of top) {
    if (count < MIN_PEAK) break;
    const rgb = [(key >> 16) & 0xff, (key >> 8) & 0xff, key & 0xff];
    if (satOf(rgb) < SAT_MIN) continue;
    if (out.some((o) => Math.max(...o.rgb.map((v, i) => Math.abs(v - rgb[i]))) <= FILL_TOL)) continue;
    out.push({ rgb, count });
    if (out.length >= 12) break;
  }
  return out;
}

function componentsOf(mask, w, h) {
  const seen = new Uint8Array(w * h);
  const comps = [];
  const stack = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || seen[start]) continue;
    stack.length = 0;
    stack.push(start);
    seen[start] = 1;
    const pix = [];
    while (stack.length) {
      const p = stack.pop();
      pix.push(p);
      const x = p % w;
      const y = (p - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const n = ny * w + nx;
          if (mask[n] && !seen[n]) {
            seen[n] = 1;
            stack.push(n);
          }
        }
      }
    }
    comps.push(pix);
  }
  return comps;
}

/** Fill interior holes: flood the background from the border, everything not reached is a hole. */
function fillHoles(mask, w, h) {
  const outside = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const p = y * w + x;
      if (!mask[p] && !outside[p]) {
        outside[p] = 1;
        stack.push(p);
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const p = y * w + x;
      if (!mask[p] && !outside[p]) {
        outside[p] = 1;
        stack.push(p);
      }
    }
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p - x) / w;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (!mask[n] && !outside[n]) {
          outside[n] = 1;
          stack.push(n);
        }
      }
    }
  }
  const filled = Uint8Array.from(mask);
  for (let i = 0; i < w * h; i++) if (!mask[i] && !outside[i]) filled[i] = 1;
  return filled;
}

function shapeBlobs(img) {
  const { width: w, height: h, rgba } = img;
  const out = [];
  for (const peak of dominantFills(img)) {
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const dr = Math.abs(rgba[i * 4] - peak.rgb[0]);
      const dg = Math.abs(rgba[i * 4 + 1] - peak.rgb[1]);
      const db = Math.abs(rgba[i * 4 + 2] - peak.rgb[2]);
      if (Math.max(dr, dg, db) <= FILL_TOL) mask[i] = 1;
    }
    for (const pix of componentsOf(mask, w, h)) {
      if (pix.length < MIN_AREA) continue;
      const comp = new Uint8Array(w * h);
      let sx = 0;
      let sy = 0;
      for (const p of pix) {
        comp[p] = 1;
        sx += p % w;
        sy += Math.floor(p / w);
      }
      const filled = fillHoles(comp, w, h);
      const [shape, iou] = classifyShape(filled, w, h);
      const { color, dist } = colorOfRgb(peak.rgb);
      out.push({
        color,
        hue_dist: dist,
        shape,
        iou: Number(iou.toFixed(4)),
        area: pix.length,
        x: sx / pix.length,
        y: sy / pix.length,
      });
    }
  }
  return out;
}

function solveImageClick(data) {
  const img = decodePng(Buffer.from(data.image, 'base64'));
  const prompt = data.prompt || [];
  const blobs = shapeBlobs(img);
  const clicks = [];
  const used = new Set();
  for (const want of prompt) {
    const color = String(want.color || '').toLowerCase();
    const shape = String(want.shape || '').toLowerCase();
    const same = blobs.filter((b) => b.color === color && !used.has(`${Math.round(b.x)},${Math.round(b.y)}`));
    if (!same.length) return null;
    let picked = same.filter((b) => b.shape === shape);
    if (!picked.length) picked = same; // misclassification: take the colour's main blob
    picked.sort((a, b) => b.area - a.area);
    const pick = picked[0];
    used.add(`${Math.round(pick.x)},${Math.round(pick.y)}`);
    clicks.push({ x: Number(pick.x.toFixed(2)), y: Number(pick.y.toFixed(2)) });
  }
  if (clicks.length !== Number(data.click_count || prompt.length)) return null;
  return { clicks, _blobs: blobs.map((b) => [b.color, b.shape, b.iou, b.area]) };
}

/** Answer one challenge: external `--captcha-cmd`, else the built-in solver. */
function solveChallenge(challenge) {
  if (CAPTCHA_CMD) {
    const r = spawnSync(CAPTCHA_CMD, {
      shell: true,
      input: JSON.stringify(challenge),
      encoding: 'utf8',
      timeout: 90000,
      windowsHide: true,
    });
    if (r.error) return { ok: false, error: String(r.error.message).slice(0, 120) };
    try {
      return JSON.parse(String(r.stdout || '{}').trim());
    } catch (e) {
      return { ok: false, error: `captcha-cmd output unreadable: ${String(r.stdout || r.stderr).slice(0, 120)}` };
    }
  }
  const mode = challenge.mode;
  try {
    const answer = mode === 'slider' ? solveSlider(challenge.slider || {}) : solveImageClick(challenge.image_click || {});
    if (!answer) return { ok: false, error: `no answer (${mode})` };
    return { ok: true, mode, ...answer };
  } catch (e) {
    return { ok: false, error: `${mode}: ${String(e.message).slice(0, 140)}` };
  }
}

/** A solved captcha token, for the pinned exit (single use, 900 s). */
async function captchaToken(exit, tries = 6) {
  for (let i = 0; i < tries; i++) {
    const ch = await exitJson(exit, `${API}/auth/captcha/challenge`, {
      method: 'POST',
      body: {},
      headers: { origin: BASE, referer: `${BASE}/register` },
      timeoutMs: 25000,
    });
    const data = ch.json && ch.json.data;
    if (!data) {
      log(`  captcha challenge ${ch.status} ${String(ch.text).slice(0, 90)}`);
      continue;
    }
    const ans = solveChallenge(data);
    if (!ans.ok) {
      log(`  solver failed (${data.mode}): ${ans.error}`);
      continue;
    }
    const body = { challenge_id: data.challenge_id };
    if (data.mode === 'slider') {
      body.drop_x = ans.drop_x;
      body.trajectory = ans.trajectory;
    } else {
      body.clicks = ans.clicks;
    }
    const vr = await exitJson(exit, `${API}/auth/captcha/verify`, {
      method: 'POST',
      body,
      headers: { origin: BASE, referer: `${BASE}/register` },
      timeoutMs: 25000,
    });
    const token = vr.json && vr.json.data && vr.json.data.captcha_token;
    if (token) return { token, mode: data.mode };
    log(`  captcha verify ${data.mode} -> ${vr.status} ${String(vr.text).slice(0, 100)}`);
  }
  return null;
}

// ------------------------------------------------------------------- mail
/** temp.tf — real Microsoft/gmail aliases on a shared pool (no account, no browser). */
async function temptfMailbox(exit) {
  const q = `providers=${encodeURIComponent(MAIL_PROVIDERS.join(','))}&dot=0&plus=1`;
  const r = await exitJson(exit, `${TEMPTF}/api/account?${q}`, { timeoutMs: 45000 });
  const address = r.json && r.json.email;
  if (!address || !/@/.test(address)) throw new Error(`temp.tf account ${r.status}: ${String(r.text).slice(0, 120)}`);
  return { rail: 'temptf', address, list: async () => {
    const m = await exitJson(exit, `${TEMPTF}/api/check`, { method: 'POST', body: { email: address, wait: false }, timeoutMs: 45000 });
    const list = (m.json && (m.json.data || m.json.messages)) || [];
    return list.map((x, i) => ({
      id: String(x.id || x.messageId || i),
      subject: String(x.subject || ''),
      from: String(x.from || x.sender || ''),
      to: String(x.to || x.recipient || ''),
      date: String(x.date || x.timestamp || ''),
      text: String(x.text || x.textBody || x.body || x.html || x.htmlBody || x.snippet || '').replace(/<[^>]+>/g, ' '),
    }));
  } };
}

/** Emailnator — fresh @gmail.com boxes (dot-free form is what the panel must see). */
async function emailnatorMailbox(exit) {
  const g = await exitJson(exit, `${EMAILNATOR}/api/generate-email`, {
    method: 'POST',
    body: { ids: [3] },
    headers: { origin: EMAILNATOR, referer: `${EMAILNATOR}/` },
    timeoutMs: 45000,
  });
  const dotted = g.json && g.json.email;
  if (!dotted || !/@gmail\.com$/i.test(dotted)) throw new Error(`emailnator generate ${g.status}: ${String(g.text).slice(0, 120)}`);
  const [local, domain] = dotted.split('@');
  const address = `${local.replace(/\./g, '')}@${domain}`;
  return { rail: 'emailnator', address, list: async () => {
    const l = await exitJson(exit, `${EMAILNATOR}/api/message-list`, { method: 'POST', body: { email: address, limit: 20 }, timeoutMs: 45000 });
    const msgs = (l.json && l.json.messages) || [];
    const out = [];
    for (const m of msgs) {
      // The list carries no body here (and the shared pool must not spend a
      // stranger's code), so every new message is fetched in full.
      const full = await exitJson(exit, `${EMAILNATOR}/api/message/${encodeURIComponent(m.id)}`, { timeoutMs: 45000 }).catch(() => null);
      out.push({
        id: String(m.id),
        subject: String(m.subject || ''),
        from: String(m.from || ''),
        to: address,
        date: String(m.created_at || m.timestamp || ''),
        text: String((full && full.text) || '').replace(/<[^>]+>/g, ' '),
      });
    }
    return out;
  } };
}

const newMailbox = (exit) => (MAIL_RAIL === 'emailnator' ? emailnatorMailbox(exit) : temptfMailbox(exit));

/**
 * The panel mails a 6-char ALPHANUMERIC code (its own input rule /^[0-9A-Za-z]{6}$/:
 * "Your verification code is:  74AGMV  This code expires in 15 minutes."). The
 * first pattern is anchored on the exact phrasing; the fallback only accepts the
 * single 6-char token in the mail that carries a digit, so prose words
 * ("please") can never be spent as a code.
 */
const CODE_PATTERNS = [
  /verification code\s*(?:is)?\s*[:：]?\s*([0-9A-Za-z]{6})(?![0-9A-Za-z])/i,
  /(?:code|验证码|otp)\s*(?:is)?\s*[:：]\s*([0-9A-Za-z]{6})(?![0-9A-Za-z])/i,
];
const BRAND = /threerouter|three\s*router|verification|验证/i;
function extractCode(text) {
  const s = String(text || '');
  for (const re of CODE_PATTERNS) {
    const m = re.exec(s);
    if (m && /[0-9]/.test(m[1])) return m[1];
  }
  const hits = [...s.matchAll(/(?<![0-9A-Za-z])([0-9A-Za-z]{6})(?![0-9A-Za-z])/g)].map((m) => m[1]).filter((c) => /[0-9]/.test(c));
  return hits.length === 1 ? hits[0] : null;
}

async function pollCode(box, { since = 0, timeoutMs = CODE_TIMEOUT_MS, pollMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  const seen = new Set();
  while (Date.now() < deadline) {
    let msgs = [];
    try {
      msgs = await box.list();
    } catch (e) {
      /* transient — keep polling */
    }
    for (const m of msgs) {
      if (seen.has(m.id)) continue;
      if (m.to && !m.to.toLowerCase().includes(box.address.toLowerCase())) {
        seen.add(m.id); // somebody else's alias in the shared pool
        continue;
      }
      const ts = Date.parse(m.date) / 1000 || 0;
      if (since && ts && ts + 60 < since) {
        seen.add(m.id);
        continue;
      }
      const text = `${m.subject} ${m.from} ${m.text}`;
      const code = extractCode(text);
      if (!code) continue;
      if (!BRAND.test(text)) continue;
      seen.add(m.id);
      return { code, subject: m.subject };
    }
    await sleep(pollMs);
  }
  return null;
}

// ------------------------------------------------------------------- flows
function readKeys() {
  try {
    return fs
      .readFileSync(KEYS_FILE, 'utf8')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}
function appendKey(key) {
  const head = fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '\n' : '';
  fs.appendFileSync(KEYS_FILE, `${head}${key}\n`);
}
function loadAccounts() {
  try {
    return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}
function saveAccounts(list) {
  fs.writeFileSync(ACCOUNTS_FILE, `${JSON.stringify(list, null, 2)}\n`);
}
const randPass = () => `Tr${crypto.randomBytes(5).toString('hex')}aB1!`;

async function relayBaseOf(exit) {
  const r = await exitJson(exit, `${API}/settings/public`);
  const s = (r.json && r.json.data) || {};
  return { settings: s, relay: String(s.api_base_url || DEFAULT_RELAY).replace(/\/$/, '') };
}

async function signUp(exit, relay) {
  const settings = (await relayBaseOf(exit)).settings;
  if (settings.registration_enabled === false) throw new Error('registration is disabled on the panel right now');
  if (settings.email_verify_enabled === false) {
    log('  note: the panel has e-mail verification off — the code step is skipped');
  }
  const box = await newMailbox(exit);
  const cap = await captchaToken(exit);
  if (!cap) throw new Error('captcha unsolved');
  const sentAt = Math.floor(Date.now() / 1000);
  const sent = await exitJson(exit, `${API}/auth/send-verify-code`, {
    method: 'POST',
    body: { email: box.address, click_captcha_token: cap.token },
    headers: { origin: BASE, referer: `${BASE}/register` },
    timeoutMs: 30000,
  });
  if (sent.json && /EMAIL_EXISTS/i.test(String(sent.text))) throw new Error(`EMAIL_EXISTS (${box.address})`);
  if (!(sent.json && (sent.json.code === 0 || sent.json.success === true))) {
    throw new Error(`send-verify-code ${sent.status}: ${String(sent.text).slice(0, 140)}`);
  }
  const got = await pollCode(box, { since: sentAt });
  if (!got) throw new Error(`no e-mail code for ${box.address}`);
  const cap2 = await captchaToken(exit);
  if (!cap2) throw new Error('captcha unsolved (register)');
  const password = randPass();
  const reg = await exitJson(exit, `${API}/auth/register`, {
    method: 'POST',
    body: { email: box.address, password, verify_code: got.code, click_captcha_token: cap2.token },
    headers: { origin: BASE, referer: `${BASE}/email-verify` },
    timeoutMs: 30000,
  });
  const d = (reg.json && reg.json.data) || {};
  const token = d.access_token || (d.tokens && d.tokens.access_token);
  if (!(reg.json && (reg.json.code === 0 || reg.json.success === true) && token)) {
    throw new Error(`register ${reg.status}: ${String(reg.text).slice(0, 140)}`);
  }
  const auth = { authorization: `Bearer ${token}` };
  const me = await exitJson(exit, `${API}/auth/me`, { headers: auth });
  const user = (me.json && (me.json.data || me.json)) || {};
  const groups = await exitJson(exit, `${API}/groups/available`, { headers: auth });
  const gl = (groups.json && (groups.json.data || groups.json)) || [];
  const list = Array.isArray(gl) ? gl : gl.items || [];
  let key = null;
  let usedGroup = null;
  const wanted = GROUP ? list.filter((g) => String(g.id) === GROUP || g.name === GROUP) : [];
  for (const g of [...wanted, ...list]) {
    if (!g || g.id === undefined) continue;
    const created = await exitJson(exit, `${API}/keys`, {
      method: 'POST',
      headers: auth,
      body: { name: `${TAG}-${crypto.randomBytes(3).toString('hex')}`, group_id: g.id },
      timeoutMs: 30000,
    });
    const dd = (created.json && (created.json.data || created.json)) || {};
    const cand = dd.key || dd.api_key || dd.token;
    if (typeof cand === 'string' && cand.length > 10 && !cand.includes('*')) {
      key = cand;
      usedGroup = `${g.id}:${g.name}`;
      break;
    }
  }
  if (!key) {
    const list2 = await exitJson(exit, `${API}/keys`, { headers: auth });
    const dl = (list2.json && (list2.json.data || list2.json)) || [];
    const items = Array.isArray(dl) ? dl : dl.items || [];
    for (const it of items) {
      const cand = it.key || it.api_key || '';
      if (typeof cand === 'string' && cand.length > 10 && !cand.includes('*')) {
        key = cand;
        usedGroup = String(it.group_id ?? '');
        break;
      }
    }
  }
  return { box, password, token, user, groups: list.map((g) => ({ id: g.id, name: g.name })), key, usedGroup, code: got.code };
}

/** The live gate: 200 + real content (reasoning models answer reasoning_content). */
async function chatGate(exit, key, model = MODEL, relay = DEFAULT_RELAY) {
  const r = await exitJson(exit, `${relay}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: { model, messages: [{ role: 'user', content: 'Reply with the single word: ok' }], max_tokens: 32, stream: false },
  });
  const msg = r.json && r.json.choices && r.json.choices[0] && r.json.choices[0].message;
  const content = msg && ((msg.content || '').trim() || (msg.reasoning_content || '').trim());
  return { ok: r.status === 200 && Boolean(content), status: r.status, sample: String(r.text).slice(0, 140) };
}

async function mint() {
  const exits = PROXIES;
  const accounts = loadAccounts();
  const relay = (await relayBaseOf(exits[0]).catch(() => ({ relay: DEFAULT_RELAY }))).relay;
  log(`threerouter · ${COUNT} key(s) · conc ${CONC} · mail ${MAIL_RAIL} · exits ${exits.filter(Boolean).length || 'direct'} · relay ${relay}`);
  let made = 0;
  for (let round = 0; round < COUNT; round += CONC) {
    const jobs = [];
    for (let k = 0; k < CONC && round + k < COUNT; k++) {
      const i = round + k;
      jobs.push(
        (async () => {
          let lastErr = null;
          for (let t = 0; t < TRIES; t++) {
            const exit = exits[(i + t) % exits.length];
            try {
              const rec = await signUp(exit, relay);
              if (!rec.key) {
                lastErr = new Error('no key material in the create response');
                continue;
              }
              const g = await chatGate(exit, rec.key, MODEL, relay);
              const stamp = new Date().toISOString();
              if (!g.ok) {
                lastErr = new Error(`chat gate ${g.status}: ${g.sample}`);
                accounts.push({
                  at: stamp,
                  email: rec.box.address,
                  rail: rec.box.rail,
                  group: rec.usedGroup,
                  balance: rec.user.balance,
                  exit: exit ? `${exit.host}:${exit.port}` : 'direct',
                  gate: g.status,
                });
                saveAccounts(accounts);
                continue;
              }
              appendKey(rec.key);
              accounts.push({
                at: stamp,
                email: rec.box.address,
                password: rec.password,
                rail: rec.box.rail,
                uid: rec.user.id,
                balance: rec.user.balance,
                group: rec.usedGroup,
                exit: exit ? `${exit.host}:${exit.port}` : 'direct',
                key_masked: `${rec.key.slice(0, 12)}…${rec.key.slice(-4)}`,
                gate: 200,
              });
              saveAccounts(accounts);
              made++;
              log(`account ${i + 1} ✔ chat-200 ${MODEL} · ${rec.usedGroup} · balance ${rec.user.balance} · ${rec.key.slice(0, 12)}…`);
              return;
            } catch (e) {
              lastErr = e;
              log(`account ${i + 1} attempt ${t + 1}: ${String(e.message).slice(0, 120)}`);
            }
          }
          log(`account ${i + 1} ✘ ${lastErr ? String(lastErr.message).slice(0, 140) : 'failed'}`);
        })(),
      );
    }
    await Promise.all(jobs);
    if (GAP_MS) await sleep(GAP_MS);
  }
  log(`done — ${made}/${COUNT} key(s) written to ${KEYS_FILE}`);
  process.exit(made ? 0 : 1);
}

async function verifyOnly() {
  const exits = PROXIES;
  const keys = readKeys();
  if (!keys.length) {
    console.log(`no keys in ${KEYS_FILE}`);
    process.exit(0);
  }
  const relay = (await relayBaseOf(exits[0]).catch(() => ({ relay: DEFAULT_RELAY }))).relay;
  let live = 0;
  for (let i = 0; i < keys.length; i++) {
    const exit = exits[i % exits.length];
    try {
      const g = await chatGate(exit, keys[i], MODEL, relay);
      const mark = `${pad(i + 1)}/${pad(keys.length)}`;
      if (g.ok) live++;
      console.log(`  ${g.ok ? '✔' : '✘'} ${mark} ${keys[i].slice(0, 14)}… chat=${g.status} ${g.ok ? '' : g.sample}`);
    } catch (e) {
      console.log(`  ✘ ${pad(i + 1)}/${pad(keys.length)} ${keys[i].slice(0, 14)}… ${String(e.message).slice(0, 90)}`);
    }
  }
  console.log(`verify: ${live}/${keys.length} keys live`);
  process.exit(live === keys.length ? 0 : 1);
}

// ------------------------------------------------------------- connect 9router
async function login9router(base, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ password: password ?? '123456' }),
  });
  const sc = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  const cookie = sc.map((c) => c.split(';')[0]).join('; ');
  return { ok: res.ok, cookie, body: (await res.text()).slice(0, 200) };
}

async function r9(base, cookie, p, init = {}) {
  const res = await fetch(`${base}${p}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': UA,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    /* not json */
  }
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 300) };
}

/**
 * Register the provider-node and one connection on a local 9Router. 9Router is
 * the local router (usually http://localhost:20128), so this call is deliberately
 * direct — provider traffic keeps going through the exit pool.
 */
async function connect9router() {
  const base = (arg('9router-base', 'http://localhost:20128')).replace(/\/$/, '');
  const password = arg('9router-password', '123456');
  const name = arg('9router-name', 'ThreeRouter');
  const prefix = arg('9router-prefix', 'threerouter');
  const relay = (await relayBaseOf(PROXIES[0]).catch(() => ({ relay: DEFAULT_RELAY }))).relay;
  const keys = readKeys();
  const apiKey = arg('api-key', keys[keys.length - 1] || '');
  if (!apiKey) {
    console.log(`no key yet — mint one first (node src/cli.js --count 1), then re-run with --api-key <sk-…>`);
    process.exit(1);
  }
  const { cookie, ok, body } = await login9router(base, password);
  console.log(`9Router login: ${ok ? 'ok' : `not required/failed ${body}`}`);
  const nodes = await r9(base, cookie, '/api/provider-nodes');
  const existing = (((nodes.json || {}).nodes) || []).find((n) => n.prefix === prefix || n.name === name);
  let node = existing;
  if (node) {
    console.log(`provider-node exists: ${node.id} (prefix ${node.prefix})`);
  } else {
    const created = await r9(base, cookie, '/api/provider-nodes', {
      method: 'POST',
      body: JSON.stringify({ name, prefix, apiType: 'chat', type: 'openai-compatible', baseUrl: relay }),
    });
    if (!created.ok) throw new Error(`create node failed ${created.status}: ${created.text}`);
    node = created.json.node;
    console.log(`provider-node created: ${node.id} (${relay})`);
  }
  const conns = await r9(base, cookie, '/api/providers');
  const mine = (((conns.json || {}).connections) || []).find((c) => c.provider === node.id || c.name === name);
  if (mine) {
    console.log(`connection exists: ${mine.id} (${mine.name})`);
  } else {
    const created = await r9(base, cookie, '/api/providers', {
      method: 'POST',
      body: JSON.stringify({ provider: node.id, apiKey, name, priority: 1, defaultModel: MODEL }),
    });
    if (!created.ok && created.status !== 409) throw new Error(`create connection failed ${created.status}: ${created.text}`);
    console.log(`connection created: ${(created.json && created.json.connection && created.json.connection.id) || '(conflict)'}`);
  }
  console.log(`\nDone. Models are served as ${prefix}/<model id>:\n  ${MODEL_LIST.map((m) => `${prefix}/${m}`).join('\n  ')}`);
}

// ------------------------------------------------------------------- main
(async () => {
  if (SOLVE_FILE) {
    const challenge = JSON.parse(fs.readFileSync(SOLVE_FILE, 'utf8'));
    const c = challenge.data && challenge.data.mode ? challenge.data : challenge;
    const ans = solveChallenge(c);
    console.log(JSON.stringify(ans, null, 1));
    process.exit(ans.ok ? 0 : 1);
  }
  if (CONNECT_9ROUTER) {
    await connect9router();
    process.exit(0);
  }
  PROXIES = loadExits();
  if (SCREEN) {
    await screen(PROXIES);
    process.exit(0);
  }
  await (VERIFY_ONLY ? verifyOnly() : mint());
})().catch((e) => {
  console.error('[fatal]', e.message);
  process.exit(1);
});

module.exports = { parseProxy, decodePng, solveSlider, solveImageClick, extractCode, chatGate };
