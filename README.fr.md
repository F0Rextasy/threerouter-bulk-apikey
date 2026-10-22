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

**Créez en masse des comptes ThreeRouter avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-5-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

ThreeRouter fait tourner **Sub2API v0.2.0** (un panneau Go + Vue, *pas* new-api : `/api/status` et `/api/pricing` répondent `404 page not found`, les vraies portes se trouvent sous `/api/v1`). Chaque nouveau compte arrive avec **10 $ de solde dépensable** — la page d'aide l'appelle *« Bonus par défaut de 2 USD, bonus de 10 USD pour avoir rejoint le groupe »*, et le solde paie réellement les appels (mesuré : `10.00` → `9.99996524` après un chat). L'inscription se fait par e-mail + code de 6 caractères, mais elle n'est **pas** sans captcha : le panneau sert sa propre « vérification humaine » (un curseur puzzle ou un puzzle à clics d'images). Les deux modes sont résolus **à l'intérieur de cet outil** — pas de navigateur, pas de service de résolution tiers, aucune dépendance — et toute la chaîne a été prouvée en créant **10 comptes → 10 clés** (lots 3 + 5/7 + 2/2 : un e-mail perdu coûte une boîte mail, jamais une clé), chaque clé conservée uniquement après un chat 200 en direct, puis revérifiée indépendamment à **10/10**.

## 🎁 Offre gratuite — ce que vous obtenez

| Quoi | Valeur |
| --- | --- |
| Bonus d'inscription | **10 $ de solde** (`GET /api/v1/auth/me` → `balance: 10` ; dépensable — un chat l'a fait passer à `9.99996524`) |
| Captcha | le widget **propre** au panneau : `mode: slider` (puzzle) ou `mode: image_click` (cliquez sur N formes dans l'ordre des couleurs) — résolu hors ligne par cet outil |
| Porte e-mail | code **alphanumérique de 6 caractères** (ex. `74AGMV`) + une liste blanche de 198 domaines (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Autres portes | **pas** de téléphone, **pas** d'OAuth (GitHub/Google/WeChat/LinuxDo/OIDC tous à `false`), **pas** de code d'invitation |
| Catalogue | 5 identifiants de modèles sur la ligne de clés vérifiée (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Tarification | basée sur le solde (1 CNY = 1 USD à la recharge, `rate_multiplier` du groupe) ; il n'y a **aucune classe de modèle à 0 $** et aucun point d'accès `/api/pricing` — le bonus d'inscription *est* l'offre gratuite |
| L'unité qui s'accumule | **un compte = une clé** |

> 💡 L'offre gratuite est définie par ThreeRouter et peut changer. Vérifiez les chiffres en direct sur [threerouter.com](https://threerouter.com) — et laissez la porte de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 5 au complet

`GET /v1/models` avec une clé active liste **5 modèles** ; la ligne vérifiée est `minimax-m3` (modèle de raisonnement — il répond `content` *et* `reasoning_content`, donc la porte accepte l'un ou l'autre).

| ID du modèle | Vérifié |
| --- | --- |
| `minimax-m3` | **10 clés chat-200** lors de la création dans `providers/threerouter/keys.txt` ; revérification indépendante via le CLI fourni (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | listés par `/v1/models` sur les mêmes clés |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 Comment utiliser l'API

URL de base **`https://api.threerouter.com/v1`** — compatible OpenAI (la console elle-même l'annonce comme `api_base_url`).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Les modèles de raisonnement de ce panneau remplissent souvent `reasoning_content` en premier : donnez à `max_tokens` au moins ~32, sinon le champ `content` revient vide (la clé reste valide).

## 🛠 Démarrage rapide

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Une clé n'est écrite dans `keys.txt` **qu'**après que `/v1/chat/completions` a répondu 200 avec du contenu ; `accounts.json` conserve l'e-mail, le groupe, l'attribution et la sortie utilisée par chaque compte. Captcha : `captcha-solve.py` (fourni à côté du CLI) est utilisé quand python + opencv sont installés — c'est le solveur avec lequel les clés de ce dépôt ont été créées (vérifications en direct : slider 6/6 et image_click 8/8) ; sans python, le solveur JS intégré sans dépendance prend le relais (équivalent slider, image_click au mieux, un nouveau défi par tentative). `--captcha-cmd <cmd>` remplace l'un ou l'autre (JSON du défi sur stdin, JSON de la réponse sur stdout) ; `--solve-file <challenge.json>` résout un défi sauvegardé hors ligne.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxies et le nombre, les mémorise, et exécute le CLI — création, vérification, test des sorties, paramètres, aide, Connect to 9Router.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, liste blanche de 198 domaines, pas d'OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 s, usage unique, lié à la sortie de résolution) ; résolutions en direct : slider **6/6** (corrélation r = 0,998–0,9998) et image_click **8/8** avec `captcha-solve.py` ; les mêmes défis sauvegardés rejoués hors ligne montrent le slider JS intégré aux mêmes décalages |
| `POST /api/v1/auth/send-verify-code` | **200** — code délivré (un alias temp.tf réutilisé répond `409 EMAIL_EXISTS` et l'outil fait tourner la boîte mail) |
| `POST /api/v1/auth/register` | **200** — `access_token` ; le code doit être utilisé dans sa fenêtre de 15 minutes |
| `GET /api/v1/auth/me` | **200** — `balance: 10` sur chaque compte |
| `POST /api/v1/keys` | **200** — `sk-…` renvoyé une seule fois (groupe `12:default` ; `13:vip` également proposé) |
| flux de création — une clé par compte, écrite **uniquement** après un chat 200 | 10 comptes via le rail node + 1 compte via le CLI fourni lui-même (45 s de bout en bout, chat-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | **200** avec du contenu réel pour chaque clé avant d'être conservée, puis revérifiée une par une |
| revérification indépendante des clés du rail node (série, sortie fraîche) | **10/10 PASS** (2026-10-21 ; preuves par clé dans `out/keys-verify.json`) |
| notes côté panneau | le puzzle d'images répond parfois `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` (un défi périmé ou manqué) — l'outil en demande simplement un nouveau ; un alias temp.tf partagé peut déjà exister sur le panneau (`EMAIL_EXISTS` → nouvelle boîte mail) et des boîtes outlook.com n'ont jamais livré, donc le CLI utilise par défaut `--mail-providers hotmail` avec trois tentatives |

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Notes |
| --- | --- | --- |
| portes | `GET /api/v1/settings/public` | indicateurs register / e-mail / captcha, liste blanche d'e-mails |
| captcha | `POST /api/v1/auth/captcha/challenge` → résoudre → `POST /api/v1/auth/captcha/verify` | `captcha_token`, usage unique, **même sortie** que les appels qui le consomment |
| boîte mail | alias temp.tf (ou Emailnator `@gmail.com`) | uniquement les domaines en liste blanche du panneau |
| envoi du code | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| code | interroger la boîte mail | alphanumérique de 6 caractères, fenêtre de 15 minutes |
| inscription | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| groupes | `GET /api/v1/groups/available` | le bonus y est dépensable |
| clé | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| preuve | `POST <relay>/chat/completions` | 200 avec contenu (ou `reasoning_content`) = la clé est active |

## ⚙️ Options du CLI

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

| Env | Défaut | Signification |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | pool de sorties, une ligne par proxy |
| `THREEROUTER_MODEL` | `minimax-m3` | modèle pour la vérification en direct |

## 🛰️ Derrière un proxy

**Facultatif — recommandé à grande échelle (limites par IP, bannissements).** L'outil fonctionne aussi sans proxy.

- **Avec un pool :** passez `--pool <file>` (ou définissez `THREEROUTER_PROXIES`) et chaque requête passe par une sortie de cette liste. Un jeton de captcha est émis pour la sortie qui a résolu le puzzle, donc tout le compte (les deux résolutions et l'appel d'inscription) tourne sur **une seule sortie épinglée** — si cette sortie meurt, la tentative échoue et la sortie suivante est utilisée, jamais de repli direct.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et se connecte directement. Rien ne change pour l'inscription, la création de clés ou la vérification — seul le point de départ des paquets change.
- `--screen` teste les sorties dont vous disposez (ou la route directe) contre `https://threerouter.com/api/v1/settings/public` avant une exécution réelle.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée en direct par ligne — ignoré par git |
| `accounts.json` | e-mail / groupe / solde d'inscription / sortie par compte |
| `captcha-solve.py` | le solveur de captcha (python + opencv) : corrélation slider et IoU de gabarit image-click |
| `proxies.txt` | vos sorties — ignoré par git |
| `out/` | journaux d'exécution — ignorés par git |

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé, compatible OpenAI :

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

Défauts : `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Les modèles sont servis sous `threerouter/<model id>`.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 Ce que le fournisseur donne | **10 $ de solde** à l'inscription (aucune classe de modèle à 0 $ — le bonus est l'offre gratuite) |
| 🔑 Ce qu'une clé vous apporte | une clé sur son propre compte, vérifiée par chat sur `minimax-m3` |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Vos données | seuls `threerouter.com` / `api.threerouter.com` et votre backend de boîte mail sont contactés |

## 🐞 Problèmes

Si ThreeRouter modifie ses portes d'inscription (mode de captcha, liste blanche, bonus) ou son hôte de relais, l'outil s'arrête là et le signale. **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>