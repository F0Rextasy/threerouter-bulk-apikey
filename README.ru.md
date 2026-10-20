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

**Массовое создание аккаунтов ThreeRouter с автоматически сгенерированными API-ключами — OpenAI-совместимый инференс + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-5-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

ThreeRouter работает на **Sub2API v0.2.0** (панель на Go + Vue, *не* new-api: `/api/status` и `/api/pricing` отвечают `404 page not found`, реальные шлюзы находятся под `/api/v1`). Каждый новый аккаунт получает **$10 расходуемого баланса** — на странице помощи это называется *«Default 2 USD bonus, 10 USD bonus for joining the group»*, и баланс действительно оплачивает вызовы (измерено: `10.00` → `9.99996524` после одного чата). Регистрация — это e-mail + 6-символьный код, но она **не** свободна от капчи: панель показывает собственную «проверку на человека» (слайдер-пазл или пазл с кликами по картинке). Оба режима решаются **внутри этого инструмента** — без браузера, без сторонних сервисов решения капчи, без зависимостей — и вся цепочка была доказана созданием **10 аккаунтов → 10 ключей** (партии 3 + 5/7 + 2/2: потерянный e-mail стоит почтового ящика, но никогда — ключа), каждый ключ сохранялся только после живого чата с ответом 200, а затем независимо перепроверялся с результатом **10/10**.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Бонус за регистрацию | **баланс $10** (`GET /api/v1/auth/me` → `balance: 10`; расходуемый — чат уменьшил его до `9.99996524`) |
| Капча | **собственный** виджет панели: `mode: slider` (пазл) или `mode: image_click` (кликните N фигур в порядке цветов) — решается офлайн этим инструментом |
| Шлюз e-mail | **6-символьный буквенно-цифровой** код (например, `74AGMV`) + белый список из 198 доменов (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Другие шлюзы | **нет** телефона, **нет** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC — все `false`), **нет** инвайт-кода |
| Каталог | 5 идентификаторов моделей на проверенной линии ключей (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Цены | на основе баланса (1 CNY = 1 USD при пополнении, `rate_multiplier` группы); **нет** класса моделей за $0 и нет эндпоинта `/api/pricing` — бонус за регистрацию *и есть* бесплатный тариф |
| Единица масштабирования | **один аккаунт = один ключ** |

> 💡 Бесплатный тариф задаётся ThreeRouter и может измениться. Проверяйте актуальные цифры на [threerouter.com](https://threerouter.com) — и пусть решает собственный шлюз инструмента:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 5

`GET /v1/models` с живым ключом перечисляет **5 моделей**; проверенная линия — `minimax-m3` (reasoning-модель — она отвечает и `content`, и `reasoning_content`, поэтому шлюз принимает любое из них).

| ID модели | Проверено |
| --- | --- |
| `minimax-m3` | **10 ключей с чатом 200** во время создания в `providers/threerouter/keys.txt`; независимая перепроверка через поставляемый CLI (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | перечислены `/v1/models` на тех же ключах |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 Как использовать API

Базовый URL **`https://api.threerouter.com/v1`** — совместим с OpenAI (сама консоль рекламирует его как `api_base_url`).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Reasoning-модели на этой панели часто сначала заполняют `reasoning_content`: задайте `max_tokens` не менее ~32, иначе поле `content` вернётся пустым (ключ при этом всё равно рабочий).

## 🛠 Быстрый старт

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Ключ записывается в `keys.txt` **только** после того, как `/v1/chat/completions` ответит 200 с содержимым; `accounts.json` хранит e-mail, группу, грант и выход, использованный каждым аккаунтом. `--captcha-cmd <cmd>` заменяет встроенный решатель на внешний (JSON задачи на stdin, JSON ответа на stdout).

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси и количество, запоминает их и запускает CLI — создание, проверку, тестирование выходов, настройки, справку, Connect to 9Router.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, белый список из 198 доменов, без OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 с, одноразовый, привязан к выходу, решившему капчу); оба режима работают: корреляция слайдера **r = 0.9992–0.9998**, image_click **4/4** проверок |
| `POST /api/v1/auth/send-verify-code` | **200** — код доставлен (повторно используемый алиас temp.tf отвечает `409 EMAIL_EXISTS`, и инструмент меняет почтовый ящик) |
| `POST /api/v1/auth/register` | **200** — `access_token`; код должен быть использован в течение 15-минутного окна |
| `GET /api/v1/auth/me` | **200** — `balance: 10` на каждом аккаунте |
| `POST /api/v1/keys` | **200** — `sk-…` возвращается один раз (группа `12:default`; также предлагается `13:vip`) |
| `POST /v1/chat/completions` (`minimax-m3`) — для **каждого** ключа перед записью | **200** с реальным содержимым — создано 10 аккаунтов, **10 ключей в `keys.txt`** |
| независимая перепроверка — **каждый ключ** в `keys.txt`, по одному, `minimax-m3` чат-200 | **10/10 PASS** (2026-10-21; доказательства по каждому ключу в `out/keys-verify.json`) |
| заметки со стороны панели | пазл с картинкой иногда отвечает `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` (устаревшая/пропущенная задача) — инструмент просто запрашивает новую; общий алиас temp.tf может уже существовать на панели (`EMAIL_EXISTS` → новый почтовый ящик) |

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| шлюзы | `GET /api/v1/settings/public` | флаги регистрации / e-mail / капчи, белый список e-mail |
| капча | `POST /api/v1/auth/captcha/challenge` → решение → `POST /api/v1/auth/captcha/verify` | `captcha_token`, одноразовый, **тот же выход**, что и у вызовов, которые его расходуют |
| почтовый ящик | алиас temp.tf (или Emailnator `@gmail.com`) | только домены из белого списка панели |
| отправка кода | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| код | опрос почтового ящика | 6-символьный буквенно-цифровой, окно 15 минут |
| регистрация | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| группы | `GET /api/v1/groups/available` | бонус можно там расходовать |
| ключ | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| доказательство | `POST <relay>/chat/completions` | 200 с содержимым (или `reasoning_content`) = ключ рабочий |

## ⚙️ Опции CLI

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

| Переменная | По умолчанию | Значение |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | пул выходов, по одной строке на прокси |
| `THREEROUTER_MODEL` | `minimax-m3` | модель для живой проверки |

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабе (лимиты на IP, баны).** Инструмент работает и без прокси.

- **С пулом:** передайте `--pool <file>` (или задайте `THREEROUTER_PROXIES`), и каждый запрос пойдёт через выход из этого списка. Токен капчи выдаётся тому выходу, который решил пазл, поэтому весь аккаунт (оба решения и вызов регистрации) работает на **одном закреплённом выходе** — если этот выход умирает, попытка проваливается и используется следующий выход, но никогда не прямой резерв.
- **Без пула:** CLI выводит `running WITHOUT a proxy (direct)` и подключается напрямую. В регистрации, создании ключей и проверке ничего не меняется — только то, откуда уходят пакеты.
- `--screen` тестирует имеющиеся выходы (или прямой маршрут) против `https://threerouter.com/api/v1/settings/public` перед реальным запуском.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один живой проверенный ключ на строку — игнорируется git |
| `accounts.json` | e-mail / группа / баланс при регистрации / выход для каждого аккаунта |
| `proxies.txt` | ваши выходы — игнорируется git |
| `out/` | логи запусков — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый OpenAI-совместимый роутер:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

По умолчанию: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Модели подаются как `threerouter/<model id>`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 Что даёт провайдер | **баланс $10** при регистрации (нет класса моделей за $0 — бонус и есть бесплатный тариф) |
| 🔑 Что даёт один ключ | один ключ на собственном аккаунте, проверенный чатом на `minimax-m3` |
| 🌐 Форма API | совместим с OpenAI: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Ваши данные | контактирует только с `threerouter.com` / `api.threerouter.com` и вашим почтовым бэкендом |

## 🐞 Проблемы

Если ThreeRouter изменит свои шлюзы регистрации (режим капчи, белый список, бонус) или хост ретрансляции, инструмент остановится там и сообщит об этом. **[Откройте issue](../../issues)** с командой и точным выводом.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>