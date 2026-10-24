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
 * Both puzzle modes are solved inside src/solver.js — no browser, no service:
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
 *   --exits N        exits tried per account before giving up              [6]
 *   --timeout MS     per-request timeout                                [60000]
 *   --code-timeout S seconds to wait for the e-mail code                   [240]
 *   --auto           solve the captcha with src/solver.js (default, no browser)
 *   --no-auto        disable the embedded solver (then --captcha-cmd is needed)
 *   --dry            resolve the plan, print it and exit (no write, no request)
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
const {
  solveCaptcha,
  solveChallenge,
  decodePng,
  solveSlider,
  solveImageClick,
  parseProxy,
  exitJson,
  setDefaultTimeout,
  pythonSolver,
  UA,
  BASE,
  API,
} = require('./solver.js');
const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
const OUT_DIR = path.join(ROOT, 'out');

const DEFAULT_RELAY = 'https://api.threerouter.com/v1';
const TEMPTF = 'https://temp.tf';
const EMAILNATOR = 'https://www.emailnator.com';
const MODEL_LIST = ['minimax-m3', 'deepseek-v4-pro', 'glm-5.3', 'kimi-k3', 'qwen3.8-max'];
// BASE / API / UA and the whole captcha engine live in src/solver.js: the panel
// requests, the pool transport and the `--auto` solve all go through it.

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

  One command:
    node src/cli.js --count N            mint N keys (the panel's captcha is solved automatically)

  node src/cli.js --count 5            mint (a key is kept only after a chat 200)
  node src/cli.js --verify-only        re-check every key in keys.txt
  node src/cli.js --screen             test your proxy list against ThreeRouter
  node src/cli.js --connect-9router    register the provider + one key on a local 9Router
  node src/cli.js --dry                print the resolved plan, write nothing, send nothing
  node src/cli.js --help

  --count N        accounts to mint                                     [5]
  --conc N         accounts in flight (keep 1 — serial is the proven mode) [1]
  --model <id>     model used for the live gate              [minimax-m3]
  --group <id>     group for the key (default: the panel's first)       [-]
  --mail <rail>    temptf | emailnator                              [temptf]
  --pool <file>    proxy list, one exit per line (env THREEROUTER_PROXIES) [optional]
  --auto           solve the captcha with src/solver.js (default; no browser, no CDP)
  --no-auto        disable the embedded solver (then --captcha-cmd is required)
  --dry            resolve the plan and exit (no write, no request)
  --captcha-cmd C  advanced: external captcha solver (challenge JSON on stdin)

Requests go through the exits in your proxy list when one is provided (--pool or
the THREEROUTER_PROXIES env). Without a pool the tool connects DIRECTLY.

The panel's own captcha (jigsaw slider / image-click puzzle) is solved in-process
by src/solver.js, with no browser and no third-party service: captcha-solve.py next
to this file is used when python + opencv are installed (the configuration that
minted the keys in this repo), otherwise the built-in dependency-free JS solver
takes over - the slider path is equivalent, the image-click path is best effort,
and each attempt just asks for a new challenge. --captcha-cmd overrides both.`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '5'), 10) || 5);
const CONC = Math.min(2, Math.max(1, parseInt(arg('conc', '1'), 10) || 1));
const GAP_MS = Math.max(0, parseInt(arg('gap', '1500'), 10) || 0);
// A temp.tf alias can already exist on the panel (EMAIL_EXISTS) and outlook boxes
// have been seen not to deliver at all, so failing an attempt on mail is normal —
// the default budget is six attempts (a fresh mailbox each), not one.
const EXITS = Math.max(1, parseInt(arg('exits', '6'), 10) || 6);
const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
const CODE_TIMEOUT_MS = Math.max(30, parseInt(arg('code-timeout', '240'), 10) || 240) * 1000;
const MODEL = arg('model', process.env.THREEROUTER_MODEL || 'minimax-m3');
const GROUP = arg('group', '');
const MAIL_RAIL = arg('mail', 'temptf');
const MAIL_PROVIDERS = arg('mail-providers', 'hotmail,outlook').split(',').map((s) => s.trim()).filter(Boolean);
const CAPTCHA_CMD = arg('captcha-cmd', '');
const SOLVE_FILE = arg('solve-file', '');
const AUTO = !has('no-auto'); // the embedded solver is the default path (one command)
const DRY = has('dry'); // resolve the plan, print it, write nothing, send nothing
const TAG = arg('tag', 'tr');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const CONNECT_9ROUTER = has('connect-9router');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!DRY) fs.mkdirSync(OUT_DIR, { recursive: true });
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const pad = (s) => String(s).padStart(2, '0');

/** `--dry`: the resolved plan, then exit 0. The pool file is only read, never written. */
function printPlan() {
  const poolArg = arg('pool', process.env.THREEROUTER_PROXIES || 'proxies.txt');
  const poolFile = fs.existsSync(path.resolve(poolArg)) ? path.resolve(poolArg) : path.resolve(ROOT, poolArg);
  const exits = fs.existsSync(poolFile)
    ? fs.readFileSync(poolFile, 'utf8').split(/\r?\n/).map(parseProxy).filter(Boolean).length
    : 0;
  const py = pythonSolver();
  console.log('threerouter dry run — nothing is written and no request is sent.');
  console.log(`  count    ${COUNT} key(s), ${CONC} in flight, ${GAP_MS} ms between batches`);
  console.log(`  pool     ${exits ? `${exits} exit(s) from ${poolFile}` : `direct (no usable exit in ${poolFile})`}`);
  console.log(`  model    ${MODEL}   mail ${MAIL_RAIL}`);
  console.log(`  solver   ${AUTO ? `embedded src/solver.js (--auto, default) — slider + image_click, python helper ${py ? `present (${py.cmd})` : 'absent'}` : 'off (--no-auto)'}`);
  console.log('  browser  none — the solve is in-process, no Chrome and nothing to download');
}
if (DRY) {
  printPlan();
  process.exit(0);
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
/** A dead exit, not a panel verdict — the flow rotates to the next candidate. */
const isExitError = (e) =>
  /proxy connect failed|proxy CONNECT refused|proxy timeout|connect timeout|connect failed|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|ENETUNREACH|EHOSTUNREACH|EAI_AGAIN|socket hang up|secureConnect|TLS|handshake/i.test(
    String((e && e.message) || e),
  );

/** `host:port` of the exit in play, or `direct` when the pool is empty. */
const exitLabel = (e) => (e ? `${e.host}:${e.port}` : 'direct');


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


/**
 * A solved captcha token for the pinned exit (single use, 900 s). It must be the
 * exit the caller spends it on — the panel binds the token to the solving exit.
 * src/solver.js owns the challenge → solve → verify round trip.
 */
async function captchaToken(exit, tries = 6) {
  if (!AUTO && !CAPTCHA_CMD) throw new Error('--no-auto: no captcha source — pass --captcha-cmd "<cmd>"');
  return solveCaptcha({
    type: 'auto',
    url: `${API}/auth/captcha/challenge`,
    proxy: exit ? exit.line : null,
    externalCmd: CAPTCHA_CMD,
    tries,
    log,
  });
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
  const routes = exits[0] === null ? 1 : EXITS;
  log(`threerouter · ${COUNT} key(s) · conc ${CONC} · mail ${MAIL_RAIL} · exits ${exits.filter(Boolean).length || 'direct'} · up to ${routes} per account · relay ${relay}`);
  let made = 0;
  let transportDead = 0;
  for (let round = 0; round < COUNT; round += CONC) {
    const jobs = [];
    for (let k = 0; k < CONC && round + k < COUNT; k++) {
      const i = round + k;
      jobs.push(
        (async () => {
          let lastErr = null;
          let lastWasExit = false;
          for (let a = 0; a < routes; a++) {
            const exit = exits[(i + a) % exits.length];
            lastWasExit = false;
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
              lastWasExit = isExitError(e);
              if (lastWasExit) {
                const where = exit ? `exit ${a + 1}/${routes} ${exitLabel(exit)}` : `direct attempt ${a + 1}/${routes}`;
                log(`account ${i + 1}: ${where} dead (${String(e.message).slice(0, 70)})${exit ? ' → next exit' : ''}`);
              } else {
                log(`account ${i + 1} attempt ${a + 1}: ${String(e.message).slice(0, 120)}`);
              }
            }
          }
          if (lastWasExit) transportDead++;
          log(`account ${i + 1} ✘ ${lastErr ? String(lastErr.message).slice(0, 140) : 'failed'}`);
        })(),
      );
    }
    await Promise.all(jobs);
    if (GAP_MS) await sleep(GAP_MS);
  }
  if (!made && transportDead === COUNT) {
    const route = exits[0] === null ? 'direct mode (no proxy list)' : `${exits.length}-exit pool`;
    console.error(`[fatal] no usable route — ${COUNT} account(s) × ${routes} candidate(s) over ${route}: every attempt died at the transport layer.`);
    process.exit(1);
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
  const dead = [];
  for (let i = 0; i < keys.length; i++) {
    const exit = exits[i % exits.length];
    const t0 = Date.now();
    try {
      const g = await chatGate(exit, keys[i], MODEL, relay);
      const ms = Date.now() - t0;
      const mark = `${pad(i + 1)}/${pad(keys.length)}`;
      if (g.ok) live++;
      else if ([401, 402, 403].includes(Number(g.status))) dead.push({ key: keys[i], why: g.status });
      console.log(`  ${g.ok ? '✔' : '✘'} ${mark} ${keys[i].slice(0, 14)}… chat=${g.status} ${ms}ms ${g.ok ? '' : g.sample}`);
    } catch (e) {
      console.log(`  ✘ ${pad(i + 1)}/${pad(keys.length)} ${keys[i].slice(0, 14)}… ${Date.now() - t0}ms ${String(e.message).slice(0, 90)} (transport — key kept)`);
    }
  }
  if (dead.length) {
    const deadFile = path.join(ROOT, 'keys-dead.txt');
    const seen = fs.existsSync(deadFile) ? fs.readFileSync(deadFile, 'utf8') : '';
    for (const d of dead) if (!seen.includes(d.key)) fs.appendFileSync(deadFile, `${d.key}\t${d.why}\t${new Date().toISOString()}\n`);
    console.log(`  ${dead.length} dead key(s) written to keys-dead.txt`);
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
    // `--solve-file -` reads the challenge JSON from stdin, so this CLI also
    // works as an external solver for another tool (`--captcha-cmd '… --solve-file -'`).
    const raw = SOLVE_FILE === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(SOLVE_FILE, 'utf8');
    const challenge = JSON.parse(raw);
    const c = challenge.data && challenge.data.mode ? challenge.data : challenge;
    const ans = solveChallenge(c, { externalCmd: CAPTCHA_CMD });
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
