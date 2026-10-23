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

**Массовое создание аккаунтов ThreeRouter с автоматически сгенерированными API-ключами — инференс, совместимый с OpenAI, + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-5-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

ThreeRouter работает на **Sub2API v0.2.0** (панель на Go + Vue, *не* new-api: `/api/status` и `/api/pricing` отвечают `404 page not found`, реальные шлюзы находятся под `/api/v1`). Каждый новый аккаунт получает **$10 расходуемого баланса** — на странице справки это называется *«Стандартный бонус 2 USD, бонус 10 USD за вступление в группу»*, и баланс действительно оплачивает вызовы (измерено: `10.00` → `9.99996524` после одного чата). Регистрация — это e-mail + 6-символьный код, но она **не** свободна от капчи: панель показывает собственную «проверку на человека» (слайдер-пазл или пазл с кликами по изображению). Оба режима решаются **внутри этого инструмента** — без браузера, без сторонних сервисов решения капчи, без зависимостей — и вся линейка была подтверждена тем, что **каждый аккаунт создавал собственный ключ** (партии 3 + 5/7 + 2/2: потерянный e-mail стоит почтового ящика, но никогда — ключа), каждый ключ сохранялся только после живого чата с ответом 200, а затем независимо перепроверялся с результатом **10/10**.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Бонус за регистрацию | **баланс $10** (`GET /api/v1/auth/me` → `balance: 10`; расходуемый — чат уменьшил его до `9.99996524`) |
| Капча | **собственный** виджет панели: `mode: slider` (пазл) или `mode: image_click` (кликните N фигур в порядке цветов) — решается офлайн этим инструментом |
| Шлюз e-mail | **6-символьный буквенно-цифровой** код (например, `74AGMV`) + белый список из 198 доменов (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Другие шлюзы | **нет** телефона, **нет** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC — все `false`), **нет** кода приглашения |
| Каталог | 5 идентификаторов моделей на проверенной линии ключей (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Ценообразование | на основе баланса (1 CNY = 1 USD при пополнении, `rate_multiplier` группы); **нет** класса моделей за $0 и нет эндпоинта `/api/pricing` — бонус за регистрацию *и есть* бесплатный тариф |
| Единица масштабирования | **один аккаунт = один ключ** |

> 💡 Бесплатный тариф устанавливается ThreeRouter и может измениться. Проверяйте актуальные цифры на [threerouter.com](https://threerouter.com) — и пусть собственный шлюз инструмента решает:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 5

`GET /v1/models` с живым ключом перечисляет **5 моделей**; проверенная линия — `minimax-m3` (модель рассуждений — она отвечает `content` *и* `reasoning_content`, поэтому шлюз принимает любое).

| ID модели | Проверено |
| --- | --- |
| `minimax-m3` | **каждый ключ, chat-200** во время создания в `providers/threerouter/keys.txt`; независимая перепроверка через поставляемый CLI (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | перечислены в `/v1/models` на тех же ключах |

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

Модели рассуждений на этой панели часто сначала заполняют `reasoning_content`: задайте `max_tokens` не менее ~32, иначе поле `content` вернётся пустым (ключ при этом всё равно в порядке).

## ⚡ Одна команда

```bash
node src/cli.js --count N      # mint N keys — the panel's slider/image captcha is solved in-process
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto` используется по умолчанию и не требует ничего, кроме Node: `src/solver.js` содержит движок капчи (корреляция слайдера + IoU шаблонов для image-click), и он вызывает поставляемый `captcha-solve.py` для режимов, которые не может выполнить нативно, когда доступны python + opencv — без браузера, без CDP, без сторонних сервисов решения капчи. Прокси остаются необязательными: `proxies.txt` рядом с CLI используется автоматически, иначе инструмент работает напрямую. `--no-auto` отключает встроенный решатель; продвинутые обходные пути (`--captcha-cmd`, `--solve-file`) предназначены для операторов, у которых уже есть свой решатель.

> ⚠️ **Условия и риск для аккаунта.** Автоматизация провайдера может нарушать его Условия использования и привести к блокировке аккаунтов или IP. Вы запускаете это на своих собственных аккаунтах, со своей машины, на свой риск; инструмент лишь управляет собственной страницей регистрации сайта и никогда не обходит платный шлюз. Прочитайте Условия использования провайдера перед крупной кампанией.

## 🛠 Быстрый старт

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Ключ записывается в `keys.txt` **только** после того, как `/v1/chat/completions` ответит 200 с содержимым; `accounts.json` хранит e-mail, группу, грант и выход, использованный каждым аккаунтом. Капча: `captcha-solve.py` (поставляется рядом с CLI) используется, когда установлены python + opencv — именно этим решателем были созданы ключи этого репозитория (слайдер 6/6 и живые проверки image_click); без python в дело вступает встроенный JS-решатель без зависимостей (эквивалент для слайдера, image_click по мере возможностей, один новый вызов на каждую повторную попытку). `--captcha-cmd <cmd>` заменяет любой из них (JSON вызова на stdin, JSON ответа на stdout); `--solve-file <challenge.json>` решает один сохранённый вызов офлайн.

### 🖱️ Лаунчер

`npm start` открывает меню лаунчера, и пункт **1) Mint keys** задаёт один вопрос — сколько ключей — затем запускает создание с `--auto`: капча решается в процессе, а `proxies.txt` рядом с CLI подхватывается автоматически (иначе напрямую). Вопросов о капче, токене или прокси нет. Остальные пункты меню оборачивают `--verify-only`, `--screen` и коннекторы 9Router / OmniRoute.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, белый список из 198 доменов, без OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 с, одноразовый, привязан к выходу, решившему капчу); живые решения: слайдер **6/6** (корреляция r = 0.998–0.9998) и image_click **8/8** с `captcha-solve.py`; те же сохранённые вызовы, воспроизведённые офлайн, показывают встроенный JS-слайдер на идентичных смещениях |
| `POST /api/v1/auth/send-verify-code` | **200** — код доставлен (повторно используемый алиас temp.tf отвечает `409 EMAIL_EXISTS`, и инструмент меняет почтовый ящик) |
| `POST /api/v1/auth/register` | **200** — `access_token`; код должен быть использован в течение его 15-минутного окна |
| `GET /api/v1/auth/me` | **200** — `balance: 10` на каждом аккаунте |
| `POST /api/v1/keys` | **200** — `sk-…` возвращается один раз (группа `12:default`; также предлагается `13:vip`) |
| процесс создания — один ключ на аккаунт, записывается **только** после chat 200 | 10 аккаунтов через node-рельс + 1 аккаунт через сам поставляемый CLI (45 с от начала до конца, chat-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | **200** с реальным содержимым для каждого ключа до его сохранения, и перепроверено по одному |
| независимая перепроверка ключей node-рельса (последовательно, свежий выход) | **все проходят** (2026-10-21; доказательства по каждому ключу в `out/keys-verify.json`) |
| заметки со стороны панели | пазл с изображением иногда отвечает `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` (устаревший или пропущенный вызов) — инструмент просто запрашивает новый; общий алиас temp.tf может уже существовать на панели (`EMAIL_EXISTS` → новый почтовый ящик), а ящики outlook.com, как замечено, никогда не доставляют, поэтому CLI по умолчанию использует `--mail-providers hotmail` с тремя попытками |

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` до того, как был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг проверки в любое время;
> сбои сообщаются, но никогда не скрываются.

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
| капча | `POST /api/v1/auth/captcha/challenge` → решение → `POST /api/v1/auth/captcha/verify` | `captcha_token`, одноразовый, **тот же выход**, что и у вызовов, которые его используют |
| почтовый ящик | алиас temp.tf (или Emailnator `@gmail.com`) | только домены из белого списка панели |
| отправка кода | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| код | опрос почтового ящика | 6-символьный буквенно-цифровой, 15-минутное окно |
| регистрация | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| группы | `GET /api/v1/groups/available` | бонус можно там потратить |
| ключ | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| доказательство | `POST <relay>/chat/completions` | 200 с содержимым (или `reasoning_content`) = ключ живой |

## ⚙️ Опции CLI

```bash
node src/cli.js --count N         # mint N keys (captcha + chat gate per account)
node src/cli.js --auto            # solve the captcha with src/solver.js (default, no browser)
node src/cli.js --no-auto         # disable the embedded solver (--captcha-cmd then required)
node src/cli.js --dry             # resolve the plan and exit (no write, no request)
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
| `THREEROUTER_PROXIES` | `proxies.txt` | пул выходов, одна строка на прокси |
| `THREEROUTER_MODEL` | `minimax-m3` | модель для живой проверки |

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабе (лимиты на IP, блокировки).** Инструмент работает и без прокси.

- **С пулом:** передайте `--pool <file>` (или задайте `THREEROUTER_PROXIES`), и каждый запрос идёт через выход из этого списка. Токен капчи выдаётся тому выходу, который решил пазл, поэтому весь аккаунт (оба решения и вызов регистрации) работает на **одном закреплённом выходе** — если этот выход умирает, попытка завершается неудачей и используется следующий выход, но никогда не прямой откат.
- **Без пула:** CLI выводит `running WITHOUT a proxy (direct)` и подключается напрямую. В регистрации, создании ключей или проверке ничего не меняется — только то, откуда уходят пакеты.
- `--screen` тестирует имеющиеся у вас выходы (или прямой маршрут) против `https://threerouter.com/api/v1/settings/public` перед реальным запуском.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один живой проверенный ключ на строку — игнорируется git |
| `accounts.json` | e-mail / группа / баланс при регистрации / выход для каждого аккаунта |
| `captcha-solve.py` | решатель капчи (python + opencv): корреляция слайдера и IoU шаблонов для image-click |
| `proxies.txt` | ваши выходы — игнорируется git |
| `keys-dead.txt` | ключи, не прошедшие шлюз чата — записывается `--verify-only` — игнорируется git |
| `src/solver.js` | движок капчи (slider + image_click, помощник на python, точка входа `--auto`) |
| `out/` | логи запусков — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

По умолчанию: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Модели предоставляются как `threerouter/<model id>`.

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456 \
  --api-key YOUR_KEY
```

По умолчанию: `--omniroute-prefix threerouter`, `--omniroute-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Модели предоставляются как `threerouter/<model id>`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 Что даёт провайдер | **баланс $10** при регистрации (нет класса моделей за $0 — бонус и есть бесплатный тариф) |
| 🔑 Что даёт один ключ | один ключ на собственном аккаунте, проверенный чатом на `minimax-m3` |
| 🌐 Форма API | совместим с OpenAI: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Ваши данные | связь только с `threerouter.com` / `api.threerouter.com` и вашим почтовым бэкендом |

## 🐞 Проблемы

Если ThreeRouter изменит свои шлюзы регистрации (режим капчи, белый список, бонус) или хост ретрансляции, инструмент остановится там и сообщит об этом. **[Откройте issue](../../issues)** с командой и точным выводом.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>