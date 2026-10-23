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

**Crea cuentas de ThreeRouter en masa con claves API autogeneradas — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-5-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

ThreeRouter ejecuta **Sub2API v0.2.0** (un panel Go + Vue, *no* new-api: `/api/status` y `/api/pricing` responden `404 page not found`, las puertas reales están bajo `/api/v1`). Cada cuenta nueva llega con **$10 de saldo gastable** — la página de ayuda lo llama *"Bono predeterminado de 2 USD, bono de 10 USD por unirse al grupo"*, y el saldo realmente paga las llamadas (medido: `10.00` → `9.99996524` tras un chat). El registro es correo electrónico + código de 6 caracteres, pero **no** está libre de captcha: el panel sirve su propia "verificación humana" (un deslizador de rompecabezas o un puzle de clic sobre imagen). Ambos modos se resuelven **dentro de esta herramienta** — sin navegador, sin servicio de resolución de terceros, sin dependencias — y toda la línea quedó demostrada acuñando **cada cuenta acuñó su propia clave** (lotes 3 + 5/7 + 2/2: un correo perdido cuesta un buzón, nunca una clave), cada clave se conservó solo tras un chat en vivo con 200 y luego se volvió a comprobar de forma independiente en **10/10**.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Bono de registro | **$10 de saldo** (`GET /api/v1/auth/me` → `balance: 10`; gastable — un chat lo movió a `9.99996524`) |
| Captcha | el widget **propio** del panel: `mode: slider` (rompecabezas) o `mode: image_click` (haz clic en N formas en orden de color) — resuelto sin conexión por esta herramienta |
| Puerta de correo | código **alfanumérico de 6 caracteres** (p. ej. `74AGMV`) + una lista blanca de 198 dominios (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Otras puertas | **sin** teléfono, **sin** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC todos `false`), **sin** código de invitación |
| Catálogo | 5 ids de modelo en la línea de clave verificada (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Precios | basados en saldo (1 CNY = 1 USD al recargar, `rate_multiplier` del grupo); **no** hay clase de modelo a $0 ni endpoint `/api/pricing` — el bono de registro *es* el nivel gratuito |
| La unidad que escala | **una cuenta = una clave** |

> 💡 El nivel gratuito lo define ThreeRouter y puede cambiar. Consulta las cifras en vivo en [threerouter.com](https://threerouter.com) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 5

`GET /v1/models` con una clave en vivo lista **5 modelos**; la línea verificada es `minimax-m3` (modelo de razonamiento — responde `content` *y* `reasoning_content`, así que la puerta acepta cualquiera de los dos).

| ID de modelo | Verificado |
| --- | --- |
| `minimax-m3` | **cada clave, chat-200** durante la acuñación en `providers/threerouter/keys.txt`; recomprobación independiente mediante el CLI incluido (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | listados por `/v1/models` con las mismas claves |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 Cómo usar la API

URL base **`https://api.threerouter.com/v1`** — compatible con OpenAI (la propia consola lo anuncia como `api_base_url`).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Los modelos de razonamiento de este panel a menudo llenan primero `reasoning_content`: da a `max_tokens` al menos ~32 o el campo `content` vuelve vacío (la clave sigue estando bien).

## 🛠 Inicio rápido

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Una clave se escribe en `keys.txt` **solo** después de que `/v1/chat/completions` responda 200 con contenido; `accounts.json` guarda el correo, el grupo, la concesión y la salida que usó cada cuenta. Captcha: `captcha-solve.py` (incluido junto al CLI) se usa cuando python + opencv están instalados — ese es el solucionador con el que se acuñaron las claves de este repositorio (slider 6/6 y verificaciones en vivo de image_click); sin python entra en juego el solucionador JS integrado sin dependencias (equivalente al slider, image_click con el mejor esfuerzo, un nuevo desafío por reintento). `--captcha-cmd <cmd>` reemplaza a cualquiera de los dos (JSON del desafío por stdin, JSON de la respuesta por stdout); `--solve-file <challenge.json>` resuelve un desafío guardado sin conexión.

### 🖱️ El lanzador

El lanzador pide la lista de proxies y la cantidad, las recuerda y ejecuta el CLI — acuñar, verificar, probar salidas, ajustes, ayuda, Conectar a 9Router.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, lista blanca de 198 dominios, sin OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 s, un solo uso, vinculado a la salida que resuelve); resoluciones en vivo: slider **6/6** (correlación r = 0.998–0.9998) e image_click **8/8** con `captcha-solve.py`; los mismos desafíos guardados, reproducidos sin conexión, muestran el slider JS integrado en desplazamientos idénticos |
| `POST /api/v1/auth/send-verify-code` | **200** — código entregado (un alias de temp.tf reutilizado responde `409 EMAIL_EXISTS` y la herramienta rota el buzón) |
| `POST /api/v1/auth/register` | **200** — `access_token`; el código debe gastarse dentro de su ventana de 15 minutos |
| `GET /api/v1/auth/me` | **200** — `balance: 10` en cada cuenta |
| `POST /api/v1/keys` | **200** — `sk-…` devuelto una vez (grupo `12:default`; `13:vip` también ofrecido) |
| flujo de acuñación — una clave por cuenta, escrita **solo** tras un chat 200 | 10 cuentas mediante el raíl de node + 1 cuenta mediante el propio CLI incluido (45 s de principio a fin, chat-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | **200** con contenido real para cada clave antes de conservarla, y recomprobada una por una |
| recomprobación independiente de las claves del raíl de node (en serie, salida nueva) | **todas pasan** (2026-10-21; evidencia por clave en `out/keys-verify.json`) |
| notas del lado del panel | el puzle de imagen responde ocasionalmente `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` (un desafío obsoleto o perdido) — la herramienta simplemente solicita uno nuevo; un alias de temp.tf compartido puede existir ya en el panel (`EMAIL_EXISTS` → nuevo buzón) y se ha visto que los buzones de outlook.com nunca entregan, así que el CLI usa por defecto `--mail-providers hotmail` con tres intentos |

> **Puertas de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se publican). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| puertas | `GET /api/v1/settings/public` | indicadores de registro / correo / captcha, lista blanca de correo |
| captcha | `POST /api/v1/auth/captcha/challenge` → resolver → `POST /api/v1/auth/captcha/verify` | `captcha_token`, un solo uso, **misma salida** que las llamadas que lo gastan |
| buzón | alias de temp.tf (o Emailnator `@gmail.com`) | solo los dominios en la lista blanca del panel |
| enviar código | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| código | sondear el buzón | alfanumérico de 6 caracteres, ventana de 15 minutos |
| registrar | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| grupos | `GET /api/v1/groups/available` | el bono es gastable allí |
| clave | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| prueba | `POST <relay>/chat/completions` | 200 con contenido (o `reasoning_content`) = la clave está viva |

## ⚙️ Opciones del CLI

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

| Env | Predeterminado | Significado |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | grupo de salidas, una línea por proxy |
| `THREEROUTER_MODEL` | `minimax-m3` | modelo para la verificación en vivo |

## 🛰️ Detrás de un proxy

**Opcional — recomendado a escala (límites por IP, bloqueos).** La herramienta también funciona sin proxy.

- **Con un grupo:** pasa `--pool <file>` (o define `THREEROUTER_PROXIES`) y cada solicitud pasa por una salida de esa lista. Un token de captcha se emite a la salida que resolvió el puzle, así que toda la cuenta (ambas resoluciones y la llamada de registro) se ejecuta en **una salida fijada** — si esa salida muere, el intento falla y se usa la siguiente salida, nunca un respaldo directo.
- **Sin un grupo:** el CLI imprime `running WITHOUT a proxy (direct)` y se conecta directamente. Nada del registro, la acuñación de claves o la verificación cambia — solo desde dónde salen los paquetes.
- `--screen` prueba las salidas que tengas (o la ruta directa) contra `https://threerouter.com/api/v1/settings/public` antes de una ejecución real.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea — ignorada por git |
| `accounts.json` | correo / grupo / saldo de registro / salida por cuenta |
| `captcha-solve.py` | el solucionador de captcha (python + opencv): correlación del slider e IoU de plantilla para image-click |
| `proxies.txt` | tus salidas — ignorado por git |
| `out/` | registros de ejecución — ignorados por git |

## 🔌 Conectar a 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

Valores predeterminados: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Los modelos se sirven como `threerouter/<model id>`.

## 🔌 Conectar a OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456 \
  --api-key YOUR_KEY
```

Valores predeterminados: `--omniroute-prefix threerouter`, `--omniroute-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Los modelos se sirven como `threerouter/<model id>`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 Qué da el proveedor | **$10 de saldo** al registrarte (sin clase de modelo a $0 — el bono es el nivel gratuito) |
| 🔑 Qué te da una clave | una clave en su propia cuenta, verificada por chat en `minimax-m3` |
| 🌐 Forma de la API | compatible con OpenAI: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con `threerouter.com` / `api.threerouter.com` y tu backend de buzón |

## 🐞 Problemas

Si ThreeRouter cambia sus puertas de registro (modo de captcha, lista blanca, bono) o su host de retransmisión, la herramienta se detiene ahí y lo indica. **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>