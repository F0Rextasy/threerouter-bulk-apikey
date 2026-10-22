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

**ThreeRouter-Konten in großen Mengen erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenlose Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-5-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Hinter einem Proxy](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

ThreeRouter betreibt **Sub2API v0.2.0** (ein Go + Vue-Panel, *nicht* new-api: `/api/status` und `/api/pricing` antworten mit `404 page not found`, die echten Zugänge liegen unter `/api/v1`). Jedes neue Konto startet mit **10 $ ausgabefähigem Guthaben** — die Hilfeseite nennt es *„Standardmäßig 2 USD Bonus, 10 USD Bonus für den Beitritt zur Gruppe"*, und das Guthaben bezahlt tatsächlich Aufrufe (gemessen: `10.00` → `9.99996524` nach einem Chat). Die Registrierung erfolgt per E-Mail + 6-stelligem Code, ist aber **nicht** captcha-frei: Das Panel liefert seine eigene „Menschliche Verifizierung" aus (ein Jigsaw-Slider oder ein Bild-Klick-Puzzle). Beide Modi werden **innerhalb dieses Tools** gelöst — kein Browser, kein Drittanbieter-Lösungsdienst, keine Abhängigkeiten — und die gesamte Kette wurde bewiesen, indem **10 Konten → 10 Schlüssel** erzeugt wurden (Chargen 3 + 5/7 + 2/2: eine verlorene E-Mail kostet ein Postfach, niemals einen Schlüssel), wobei jeder Schlüssel erst nach einem Live-Chat-200 behalten und dann unabhängig mit **10/10** erneut geprüft wurde.

## 🎁 Kostenlose Stufe — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Anmeldebonus | **10 $ Guthaben** (`GET /api/v1/auth/me` → `balance: 10`; ausgabefähig — ein Chat verschob es auf `9.99996524`) |
| Captcha | das **eigene** Widget des Panels: `mode: slider` (Jigsaw) oder `mode: image_click` (N Formen in Farbreihenfolge anklicken) — offline von diesem Tool gelöst |
| E-Mail-Gate | **6-stelliger alphanumerischer** Code (z. B. `74AGMV`) + eine Whitelist mit 198 Domains (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Weitere Gates | **kein** Telefon, **kein** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC alle `false`), **kein** Einladungscode |
| Katalog | 5 Modell-IDs auf der verifizierten Schlüssel-Linie (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Preisgestaltung | guthabenbasiert (1 CNY = 1 USD beim Aufladen, Gruppen-`rate_multiplier`); es gibt **keine $0-Modellklasse** und keinen `/api/pricing`-Endpunkt — der Anmeldebonus *ist* die kostenlose Stufe |
| Die skalierende Einheit | **ein Konto = ein Schlüssel** |

> 💡 Die kostenlose Stufe wird von ThreeRouter festgelegt und kann sich ändern. Prüfe die Live-Zahlen auf [threerouter.com](https://threerouter.com) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 5

`GET /v1/models` mit einem Live-Schlüssel listet **5 Modelle** auf; die verifizierte Linie ist `minimax-m3` (Reasoning-Modell — es antwortet mit `content` *und* `reasoning_content`, daher akzeptiert das Gate beides).

| Modell-ID | Verifiziert |
| --- | --- |
| `minimax-m3` | **10 Schlüssel Chat-200** während der Erzeugung unter `providers/threerouter/keys.txt`; unabhängige erneute Prüfung über die mitgelieferte CLI (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | von `/v1/models` mit denselben Schlüsseln aufgelistet |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 Die API verwenden

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

Ein Schlüssel wird **nur** dann in `keys.txt` geschrieben, wenn `/v1/chat/completions` mit 200 und Inhalt antwortet; `accounts.json` speichert die E-Mail, die Gruppe, den Grant und den Exit, den jedes Konto verwendet hat. Captcha: `captcha-solve.py` (neben der CLI mitgeliefert) wird verwendet, wenn Python + OpenCV installiert sind — das ist der Solver, mit dem die Schlüssel dieses Repos erzeugt wurden (Slider 6/6 und image_click verified-Verifizierungen); ohne Python übernimmt der eingebaute abhängigkeitsfreie JS-Solver (Slider äquivalent, image_click nach bestem Bemühen, eine neue Challenge pro Wiederholung). `--captcha-cmd <cmd>` ersetzt beide (Challenge-JSON auf stdin, Antwort-JSON auf stdout); `--solve-file <challenge.json>` löst eine gespeicherte Challenge offline.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste und der Anzahl, merkt sie sich und führt die CLI aus — Erzeugen, Verifizieren, Exits prüfen, Einstellungen, Hilfe, Mit 9Router verbinden.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, Whitelist mit 198 Domains, kein OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 s, einmalig verwendbar, an den lösenden Exit gebunden); Live-Lösungen: Slider **6/6** (Korrelation r = 0,998–0,9998) und image_click **8/8** mit `captcha-solve.py`; dieselben gespeicherten Challenges offline erneut abgespielt zeigen den eingebauten JS-Slider bei identischen Offsets |
| `POST /api/v1/auth/send-verify-code` | **200** — Code zugestellt (ein wiederverwendeter temp.tf-Alias antwortet mit `409 EMAIL_EXISTS` und das Tool rotiert das Postfach) |
| `POST /api/v1/auth/register` | **200** — `access_token`; der Code muss innerhalb seines 15-Minuten-Fensters verbraucht werden |
| `GET /api/v1/auth/me` | **200** — `balance: 10` bei jedem Konto |
| `POST /api/v1/keys` | **200** — `sk-…` einmalig zurückgegeben (Gruppe `12:default`; `13:vip` wird ebenfalls angeboten) |
| Mint-Ablauf — ein Schlüssel pro Konto, **nur** nach einem Chat-200 geschrieben | 10 Konten über die Node-Schiene + 1 Konto über die mitgelieferte CLI selbst (45 s von Anfang bis Ende, Chat-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | **200** mit echtem Inhalt für jeden Schlüssel, bevor er behalten wurde, und einzeln erneut geprüft |
| unabhängige erneute Prüfung der Node-Schienen-Schlüssel (seriell, frischer Exit) | **10/10 PASS** (2026-10-21; Nachweise pro Schlüssel in `out/keys-verify.json`) |
| Hinweise von Panel-Seite | das Bild-Puzzle antwortet gelegentlich mit `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` (eine veraltete oder verpasste Challenge) — das Tool fordert einfach eine neue an; ein geteilter temp.tf-Alias kann bereits auf dem Panel existieren (`EMAIL_EXISTS` → neues Postfach) und outlook.com-Postfächer haben nachweislich nie zugestellt, daher verwendet die CLI standardmäßig `--mail-providers hotmail` mit drei Versuchen |

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
| Postfach | temp.tf-Alias (oder Emailnator `@gmail.com`) | nur die vom Panel zugelassenen Domains |
| Code senden | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| Code | das Postfach abfragen | 6-stellig alphanumerisch, 15-Minuten-Fenster |
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
| `THREEROUTER_MODEL` | `minimax-m3` | Modell für die Live-Verifizierung |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen (Limits pro IP, Sperren).** Das Tool funktioniert auch ohne Proxy.

- **Mit einem Pool:** Übergib `--pool <file>` (oder setze `THREEROUTER_PROXIES`) und jede Anfrage läuft über einen Exit aus dieser Liste. Ein Captcha-Token wird an den Exit ausgestellt, der das Puzzle gelöst hat, daher läuft das gesamte Konto (beide Lösungen und der Register-Aufruf) über **einen festgelegten Exit** — stirbt dieser Exit, schlägt der Versuch fehl und der nächste Exit wird verwendet, niemals ein direkter Fallback.
- **Ohne einen Pool:** Die CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet direkt. An Registrierung, Schlüsselerzeugung oder Verifizierung ändert sich nichts — nur daran, wo die Pakete das System verlassen.
- `--screen` testet die Exits, die du hast (oder die direkte Route) gegen `https://threerouter.com/api/v1/settings/public` vor einem echten Lauf.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile — von Git ignoriert |
| `accounts.json` | E-Mail / Gruppe / Anmeldeguthaben / Exit pro Konto |
| `captcha-solve.py` | der Captcha-Solver (Python + OpenCV): Slider-Korrelation und image-click-Template-IoU |
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
| 🎁 Was der Anbieter gibt | **10 $ Guthaben** bei der Anmeldung (keine $0-Modellklasse — der Bonus ist die kostenlose Stufe) |
| 🔑 Was ein Schlüssel dir bringt | ein Schlüssel auf seinem eigenen Konto, chat-verifiziert auf `minimax-m3` |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Deine Daten | nur `threerouter.com` / `api.threerouter.com` und dein Postfach-Backend werden kontaktiert |

## 🐞 Probleme

Wenn ThreeRouter seine Registrierungs-Gates ändert (Captcha-Modus, Whitelist, Bonus) oder seinen Relay-Host, stoppt das Tool dort und sagt es. **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>