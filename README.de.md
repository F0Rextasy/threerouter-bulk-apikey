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

**ThreeRouter-Konten im Bulk erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-5-of-them) · [🧪 Die API nutzen](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

ThreeRouter betreibt **Sub2API v0.2.0** (ein Go-+-Vue-Panel, *nicht* new-api: `/api/status` und `/api/pricing` antworten mit `404 page not found`, die echten Gates liegen unter `/api/v1`). Jedes neue Konto startet mit **10 $ ausgabefähigem Guthaben** — die Hilfeseite nennt es *„Default 2 USD bonus, 10 USD bonus for joining the group"*, und das Guthaben bezahlt tatsächlich Aufrufe (gemessen: `10.00` → `9.99996524` nach einem Chat). Die Registrierung läuft über E-Mail + 6-stelligen Code, ist aber **nicht** captcha-frei: Das Panel liefert seine eigene „Human Verification" aus (ein Jigsaw-Slider oder ein Bild-Klick-Puzzle). Beide Modi werden **innerhalb dieses Tools** gelöst — kein Browser, kein Drittanbieter-Lösungsdienst, keine Abhängigkeiten — und die gesamte Linie wurde bewiesen, indem **10 Konten → 10 Schlüssel** geprägt wurden (Chargen 3 + 5/7 + 2/2: eine verlorene E-Mail kostet ein Postfach, niemals einen Schlüssel), wobei jeder Schlüssel erst nach einem Live-Chat-200 behalten und anschließend unabhängig mit **10/10** erneut geprüft wurde.

## 🎁 Free-Tier — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Anmeldebonus | **10 $ Guthaben** (`GET /api/v1/auth/me` → `balance: 10`; ausgabefähig — ein Chat bewegte es auf `9.99996524`) |
| Captcha | das **eigene** Widget des Panels: `mode: slider` (Jigsaw) oder `mode: image_click` (N Formen in Farbreihenfolge anklicken) — offline von diesem Tool gelöst |
| E-Mail-Gate | **6-stelliger alphanumerischer** Code (z. B. `74AGMV`) + eine Whitelist mit 198 Domains (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Weitere Gates | **kein** Telefon, **kein** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC alle `false`), **kein** Invite-Code |
| Katalog | 5 Modell-IDs auf der verifizierten Schlüssellinie (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Preisgestaltung | guthabenbasiert (1 CNY = 1 USD beim Aufladen, Gruppen-`rate_multiplier`); es gibt **keine $0-Modellklasse** und keinen `/api/pricing`-Endpunkt — der Anmeldebonus *ist* der Free-Tier |
| Die skalierende Einheit | **ein Konto = ein Schlüssel** |

> 💡 Der Free-Tier wird von ThreeRouter festgelegt und kann sich ändern. Prüfe die Live-Zahlen auf [threerouter.com](https://threerouter.com) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 5

`GET /v1/models` mit einem Live-Schlüssel listet **5 Modelle** auf; die verifizierte Linie ist `minimax-m3` (Reasoning-Modell — es antwortet mit `content` *und* `reasoning_content`, daher akzeptiert das Gate beides).

| Modell-ID | Verifiziert |
| --- | --- |
| `minimax-m3` | **10 Schlüssel Chat-200** während des Mints unter `providers/threerouter/keys.txt`; unabhängige Nachprüfung über das mitgelieferte CLI (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | von `/v1/models` mit denselben Schlüsseln gelistet |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 Die API nutzen

Basis-URL **`https://api.threerouter.com/v1`** — OpenAI-kompatibel (die Konsole selbst bewirbt sie als `api_base_url`).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Reasoning-Modelle auf diesem Panel füllen oft zuerst `reasoning_content`: Gib `max_tokens` mindestens ~32, sonst kommt das `content`-Feld leer zurück (der Schlüssel ist trotzdem in Ordnung).

## 🛠 Schnellstart

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Ein Schlüssel wird **nur** dann in `keys.txt` geschrieben, wenn `/v1/chat/completions` mit 200 und Inhalt antwortet; `accounts.json` speichert die E-Mail, die Gruppe, den Grant und den Exit, den jedes Konto verwendet hat. `--captcha-cmd <cmd>` ersetzt den eingebauten Solver durch einen externen (Challenge-JSON auf stdin, Antwort-JSON auf stdout).

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste und der Anzahl, merkt sie sich und führt das CLI aus — Mint, Verify, Exits screenen, Einstellungen, Hilfe, Connect to 9Router.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, Whitelist mit 198 Domains, kein OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 s, einmalig verwendbar, an den lösenden Exit gebunden); beide Modi live: Slider-Korrelation **r = 0.9992–0.9998**, image_click **4/4** verifiziert |
| `POST /api/v1/auth/send-verify-code` | **200** — Code zugestellt (ein wiederverwendeter temp.tf-Alias antwortet mit `409 EMAIL_EXISTS` und das Tool rotiert das Postfach) |
| `POST /api/v1/auth/register` | **200** — `access_token`; der Code muss innerhalb seines 15-Minuten-Fensters eingelöst werden |
| `GET /api/v1/auth/me` | **200** — `balance: 10` bei jedem Konto |
| `POST /api/v1/keys` | **200** — `sk-…` einmalig zurückgegeben (Gruppe `12:default`; `13:vip` wird ebenfalls angeboten) |
| `POST /v1/chat/completions` (`minimax-m3`) — für **jeden** Schlüssel, bevor er geschrieben wird | **200** mit echtem Inhalt — 10 Konten geprägt, **10 Schlüssel in `keys.txt`** |
| unabhängige Nachprüfung — **jeder Schlüssel** in `keys.txt`, einer nach dem anderen, `minimax-m3` Chat-200 | **10/10 PASS** (2026-10-21; Nachweise pro Schlüssel in `out/keys-verify.json`) |
| Hinweise von der Panel-Seite | das Bild-Puzzle antwortet gelegentlich mit `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` (eine veraltete/verpasste Challenge) — das Tool fordert einfach eine neue an; ein geteilter temp.tf-Alias kann auf dem Panel bereits existieren (`EMAIL_EXISTS` → neues Postfach) |

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Gates | `GET /api/v1/settings/public` | Register-/E-Mail-/Captcha-Flags, E-Mail-Whitelist |
| Captcha | `POST /api/v1/auth/captcha/challenge` → lösen → `POST /api/v1/auth/captcha/verify` | `captcha_token`, einmalig verwendbar, **derselbe Exit** wie die Aufrufe, die ihn verbrauchen |
| Postfach | temp.tf-Alias (oder Emailnator `@gmail.com`) | nur die vom Panel gewhitelisteten Domains |
| Code senden | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| Code | das Postfach pollen | 6-stellig alphanumerisch, 15-Minuten-Fenster |
| Registrieren | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| Gruppen | `GET /api/v1/groups/available` | dort ist der Bonus ausgabefähig |
| Schlüssel | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| Nachweis | `POST <relay>/chat/completions` | 200 mit Inhalt (oder `reasoning_content`) = der Schlüssel ist live |

## ⚙️ CLI-Optionen

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

| Env | Standard | Bedeutung |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | Exit-Pool, eine Zeile pro Proxy |
| `THREEROUTER_MODEL` | `minimax-m3` | Modell für die Live-Verifikation |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen (Limits pro IP, Bans).** Das Tool funktioniert auch ohne Proxy.

- **Mit einem Pool:** übergib `--pool <file>` (oder setze `THREEROUTER_PROXIES`), und jede Anfrage läuft über einen Exit aus dieser Liste. Ein Captcha-Token wird an den Exit ausgegeben, der das Puzzle gelöst hat, daher läuft das gesamte Konto (beide Lösungen und der Register-Aufruf) über **einen festgelegten Exit** — stirbt dieser Exit, schlägt der Versuch fehl und der nächste Exit wird verwendet, niemals ein direkter Fallback.
- **Ohne einen Pool:** das CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet direkt. An der Registrierung, dem Prägen von Schlüsseln oder der Verifikation ändert sich nichts — nur daran, wo die Pakete das Gerät verlassen.
- `--screen` testet die Exits, die du hast (oder die direkte Route) gegen `https://threerouter.com/api/v1/settings/public`, bevor ein echter Lauf startet.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile — von Git ignoriert |
| `accounts.json` | E-Mail / Gruppe / Anmeldeguthaben / Exit pro Konto |
| `proxies.txt` | deine Exits — von Git ignoriert |
| `out/` | Lauf-Logs — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

Standardwerte: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Modelle werden als `threerouter/<model id>` bereitgestellt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 Was der Anbieter gibt | **10 $ Guthaben** bei der Anmeldung (keine $0-Modellklasse — der Bonus ist der Free-Tier) |
| 🔑 Was ein Schlüssel dir bringt | ein Schlüssel auf seinem eigenen Konto, chat-verifiziert auf `minimax-m3` |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Deine Daten | nur `threerouter.com` / `api.threerouter.com` und dein Postfach-Backend werden kontaktiert |

## 🐞 Issues

Wenn ThreeRouter seine Register-Gates ändert (Captcha-Modus, Whitelist, Bonus) oder seinen Relay-Host, stoppt das Tool dort und sagt es dir. **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>