<div align="center">

```
████████╗██╗  ██╗██████╗ ███████╗███████╗██████╗  ██████╗ ██╗   ██╗████████╗
╚══██╔══╝██║  ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
   ██║   ███████║██████╔╝█████╗  █████╗  ██████╔╝██║   ██║██║   ██║   ██║
   ██║   ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗██║   ██║██║   ██║   ██║
   ██║   ██║  ██║██║  ██║███████╗███████╗██║  ██║╚██████╔╝╚██████╔╝   ██║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝

███████╗██████╗
██╔════╝██╔══██╗
█████╗  ██████╔╝
██╔══╝  ██╔══██╗
███████╗██║  ██║
╚══════╝╚═╝  ╚═╝
```

# threerouter-bulk-apikey

**Bulk-create ThreeRouter accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-5-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

ThreeRouter runs **Sub2API v0.2.0** (a Go + Vue panel, *not* new-api: `/api/status` and `/api/pricing` answer `404 page not found`, the real gates live under `/api/v1`). Every new account lands with **$10 of spendable balance** — the help page calls it *"Default 2 USD bonus, 10 USD bonus for joining the group"*, and the balance really pays for calls (measured: `10.00` → `9.99996524` after one chat). Registration is e-mail + 6-char code, but it is **not** captcha-free: the panel serves its own "human verification" (a jigsaw slider or an image-click puzzle). Both modes are solved **inside this tool** — no browser, no third-party solving service, no dependencies — and the whole line was proven by minting **10 accounts → 10 keys** (batches 3 + 5/7 + 2/2: a lost e-mail costs a mailbox, never a key), each key kept only after a live chat 200 and then re-checked independently at **10/10**.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Signup bonus | **$10 balance** (`GET /api/v1/auth/me` → `balance: 10`; spendable — a chat moved it to `9.99996524`) |
| Captcha | the panel's **own** widget: `mode: slider` (jigsaw) or `mode: image_click` (click N shapes in colour order) — solved offline by this tool |
| E-mail gate | **6-char alphanumeric** code (e.g. `74AGMV`) + a 198-domain whitelist (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Other gates | **no** phone, **no** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC all `false`), **no** invite code |
| Catalogue | 5 model ids on the verified key line (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Pricing | balance-based (1 CNY = 1 USD on top-up, group `rate_multiplier`); there is **no $0 model class** and no `/api/pricing` endpoint — the signup bonus *is* the free tier |
| The unit that scales | **one account = one key** |

> 💡 The free tier is set by ThreeRouter and can change. Check the live numbers at [threerouter.com](https://threerouter.com) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 5 of them

`GET /v1/models` with a live key lists **5 models**; the verified line is `minimax-m3` (reasoning model — it answers `content` *and* `reasoning_content`, so the gate accepts either).

| Model ID | Verified |
| --- | --- |
| `minimax-m3` | **10 keys chat-200** during the mint at `providers/threerouter/keys.txt`; independent re-check via the shipped CLI (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | listed by `/v1/models` on the same keys |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 How to use the API

Base URL **`https://api.threerouter.com/v1`** — OpenAI-compatible (the console itself advertises it as `api_base_url`).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Reasoning models on this panel often fill `reasoning_content` first: give `max_tokens` at least ~32 or the `content` field comes back empty (the key is still fine).

## 🛠 Quick start

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

A key is written to `keys.txt` **only** after `/v1/chat/completions` answers 200 with content; `accounts.json` keeps the e-mail, the group, the grant and the exit each account used. Captcha: `captcha-solve.py` (shipped next to the CLI) is used when python + opencv are installed — that is the solver this repo's keys were minted with (slider 6/6 and image_click 8/8 live verifies); without python the built-in dependency-free JS solver takes over (slider equivalent, image_click best effort, one new challenge per retry). `--captcha-cmd <cmd>` replaces either one (challenge JSON on stdin, answer JSON on stdout); `--solve-file <challenge.json>` solves one saved challenge offline.

### 🖱️ The launcher

The launcher asks for the proxy list and the count, remembers them, and runs the CLI — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, 198-domain whitelist, no OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 s, single use, bound to the solving exit); live solves: slider **6/6** (correlation r = 0.998–0.9998) and image_click **8/8** with `captcha-solve.py`; the same saved challenges replayed offline show the built-in JS slider at identical offsets |
| `POST /api/v1/auth/send-verify-code` | **200** — code delivered (a reused temp.tf alias answers `409 EMAIL_EXISTS` and the tool rotates the mailbox) |
| `POST /api/v1/auth/register` | **200** — `access_token`; the code must be spent within its 15-minute window |
| `GET /api/v1/auth/me` | **200** — `balance: 10` on every account |
| `POST /api/v1/keys` | **200** — `sk-…` returned once (group `12:default`; `13:vip` also offered) |
| mint flow — one key per account, written **only** after a chat 200 | 10 accounts via the node rail + 1 account via the shipped CLI itself (45 s end to end, chat-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | **200** with real content for every key before it was kept, and re-checked one by one |
| independent re-check of the node-rail keys (serial, fresh exit) | **10/10 PASS** (2026-10-21; per-key evidence in `out/keys-verify.json`) |
| panel-side notes | the image puzzle occasionally answers `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` (a stale or missed challenge) — the tool simply requests a new one; a shared temp.tf alias can already exist on the panel (`EMAIL_EXISTS` → new mailbox) and outlook.com boxes have been seen to never deliver, so the CLI defaults to `--mail-providers hotmail` with three attempts |

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| gates | `GET /api/v1/settings/public` | register / e-mail / captcha flags, e-mail whitelist |
| captcha | `POST /api/v1/auth/captcha/challenge` → solve → `POST /api/v1/auth/captcha/verify` | `captcha_token`, single use, **same exit** as the calls that spend it |
| mailbox | temp.tf alias (or Emailnator `@gmail.com`) | only the panel's whitelisted domains |
| send code | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| code | poll the mailbox | 6-char alphanumeric, 15-minute window |
| register | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| groups | `GET /api/v1/groups/available` | the bonus is spendable there |
| key | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| proof | `POST <relay>/chat/completions` | 200 with content (or `reasoning_content`) = the key is live |

## ⚙️ CLI options

```bash
node src/cli.js --count N         # mint N keys (captcha + chat gate per account)
node src/cli.js --group 12        # pin the key group (id or name)
node src/cli.js --verify-only     # re-verify every key in keys.txt
node src/cli.js --screen          # exit pool self-test
node src/cli.js --captcha-cmd 'node solver.js'   # external captcha solver
node src/cli.js --solve-file chal.json           # offline: solve one saved challenge
node src/cli.js --connect-9router
node src/cli.js --help
```

| Env | Default | Meaning |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | exit pool, one line per proxy |
| `THREEROUTER_MODEL` | `minimax-m3` | model for the live verification |

## 🛰️ Behind a proxy

**Optional — recommended at scale (per-IP limits, bans).** The tool works without a proxy too.

- **With a pool:** pass `--pool <file>` (or set `THREEROUTER_PROXIES`) and every request goes through an exit from that list. A captcha token is issued to the exit that solved the puzzle, so the whole account (both solves and the register call) runs on **one pinned exit** — if that exit dies the attempt fails and the next exit is used, never a direct fallback.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and connects directly. Nothing about sign-up, key minting or verification changes — only where the packets leave from.
- `--screen` tests the exits you have (or the direct route) against `https://threerouter.com/api/v1/settings/public` before a real run.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line — git-ignored |
| `accounts.json` | e-mail / group / signup balance / exit per account |
| `captcha-solve.py` | the captcha solver (python + opencv): slider correlation and image-click template IoU |
| `proxies.txt` | your exits — git-ignored |
| `out/` | run logs — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

Defaults: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Models are served as `threerouter/<model id>`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 What the provider gives | **$10 balance** on signup (no $0 model class — the bonus is the free tier) |
| 🔑 What one key gets you | one key on its own account, chat-verified on `minimax-m3` |
| 🌐 API shape | OpenAI-compatible: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Your data | only `threerouter.com` / `api.threerouter.com` and your inbox backend are contacted |

## 🐞 Issues

If ThreeRouter changes its register gates (captcha mode, whitelist, bonus) or its relay host, the tool stops there and says so. **[Open an issue](../../issues)** with the command and the exact output.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>
