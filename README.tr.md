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

**ThreeRouter hesaplarını otomatik oluşturulan API anahtarlarıyla toplu oluşturun — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-5-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

ThreeRouter, **Sub2API v0.2.0** çalıştırır (bir Go + Vue paneli, *new-api değil*: `/api/status` ve `/api/pricing` `404 page not found` yanıtı verir, gerçek kapılar `/api/v1` altında bulunur). Her yeni hesap **10 $ harcanabilir bakiye** ile açılır — yardım sayfası buna *"Varsayılan 2 USD bonus, gruba katılım için 10 USD bonus"* der ve bakiye gerçekten çağrıları öder (ölçüldü: bir sohbetten sonra `10.00` → `9.99996524`). Kayıt, e-posta + 6 karakterli koddur, ancak **captcha'sız değildir**: panel kendi "insan doğrulamasını" sunar (bir yapboz kaydırıcısı veya resme tıklama bulmacası). Her iki mod da **bu aracın içinde** çözülür — tarayıcı yok, üçüncü taraf çözüm servisi yok, bağımlılık yok — ve tüm hat **10 hesap → 10 anahtar** basılarak kanıtlandı (partiler 3 + 5/7 + 2/2: kaybolan bir e-posta bir posta kutusuna mal olur, asla bir anahtara değil), her anahtar yalnızca canlı bir sohbet 200'ünden sonra saklandı ve ardından bağımsız olarak **10/10** ile yeniden kontrol edildi.

## 🎁 Ücretsiz katman — ne kadar alırsınız

| Ne | Değer |
| --- | --- |
| Kayıt bonusu | **10 $ bakiye** (`GET /api/v1/auth/me` → `balance: 10`; harcanabilir — bir sohbet bunu `9.99996524` yaptı) |
| Captcha | panelin **kendi** widget'ı: `mode: slider` (yapboz) veya `mode: image_click` (renk sırasına göre N şekle tıklayın) — bu araç tarafından çevrimdışı çözülür |
| E-posta kapısı | **6 karakterli alfanümerik** kod (örn. `74AGMV`) + 198 alan adlı beyaz liste (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Diğer kapılar | **telefon yok**, **OAuth yok** (GitHub/Google/WeChat/LinuxDo/OIDC hepsi `false`), **davet kodu yok** |
| Katalog | doğrulanmış anahtar hattında 5 model kimliği (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Fiyatlandırma | bakiye tabanlı (yüklemede 1 CNY = 1 USD, grup `rate_multiplier`); **0 $ model sınıfı** yoktur ve `/api/pricing` uç noktası yoktur — kayıt bonusu *ücretsiz katmanın ta kendisidir* |
| Ölçeklenen birim | **bir hesap = bir anahtar** |

> 💡 Ücretsiz katman ThreeRouter tarafından belirlenir ve değişebilir. Güncel sayıları [threerouter.com](https://threerouter.com) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 5 tanesinin tamamı

Canlı bir anahtarla `GET /v1/models` **5 model** listeler; doğrulanmış hat `minimax-m3`'tür (akıl yürütme modeli — hem `content` hem de `reasoning_content` yanıtlar, bu yüzden kapı ikisinden birini kabul eder).

| Model Kimliği | Doğrulandı |
| --- | --- |
| `minimax-m3` | `providers/threerouter/keys.txt` konumundaki üretim sırasında **10 anahtar sohbet-200**; gönderilen CLI (`--verify-only`) aracılığıyla bağımsız yeniden kontrol |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | aynı anahtarlarda `/v1/models` tarafından listelenir |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 API nasıl kullanılır

Temel URL **`https://api.threerouter.com/v1`** — OpenAI uyumlu (konsolun kendisi bunu `api_base_url` olarak tanıtır).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Bu paneldeki akıl yürütme modelleri genellikle önce `reasoning_content` alanını doldurur: `max_tokens` değerini en az ~32 verin, aksi halde `content` alanı boş döner (anahtar yine de sorunsuzdur).

## 🛠 Hızlı başlangıç

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Bir anahtar `keys.txt` dosyasına **yalnızca** `/v1/chat/completions` içerikle 200 yanıt verdikten sonra yazılır; `accounts.json` e-postayı, grubu, hibeyi ve her hesabın kullandığı çıkışı saklar. `--captcha-cmd <cmd>` yerleşik çözücüyü harici bir tanesiyle değiştirir (stdin'de challenge JSON, stdout'ta yanıt JSON).

### 🖱️ Başlatıcı

Başlatıcı proxy listesini ve sayıyı sorar, bunları hatırlar ve CLI'yi çalıştırır — üret, doğrula, çıkışları tara, ayarlar, yardım, 9Router'a Bağlan.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, 198 alan adlı beyaz liste, OAuth yok |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 sn, tek kullanımlık, çözen çıkışa bağlı); her iki mod da canlı: kaydırıcı korelasyonu **r = 0.9992–0.9998**, image_click **4/4** doğrulama |
| `POST /api/v1/auth/send-verify-code` | **200** — kod teslim edildi (yeniden kullanılan bir temp.tf takma adı `409 EMAIL_EXISTS` yanıtı verir ve araç posta kutusunu döndürür) |
| `POST /api/v1/auth/register` | **200** — `access_token`; kod 15 dakikalık penceresi içinde kullanılmalıdır |
| `GET /api/v1/auth/me` | **200** — her hesapta `balance: 10` |
| `POST /api/v1/keys` | **200** — `sk-…` bir kez döndürülür (grup `12:default`; `13:vip` de sunulur) |
| `POST /v1/chat/completions` (`minimax-m3`) — yazılmadan önce **her** anahtar için | gerçek içerikle **200** — 10 hesap üretildi, **`keys.txt` içinde 10 anahtar** |
| bağımsız yeniden kontrol — `keys.txt` içindeki **her anahtar**, tek tek, `minimax-m3` sohbet-200 | **10/10 PASS** (2026-10-21; anahtar başına kanıt `out/keys-verify.json` içinde) |
| panel tarafı notlar | resim bulmacası ara sıra `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` yanıtı verir (eski/kaçırılmış bir challenge) — araç basitçe yenisini ister; paylaşılan bir temp.tf takma adı panelde zaten mevcut olabilir (`EMAIL_EXISTS` → yeni posta kutusu) |

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| kapılar | `GET /api/v1/settings/public` | kayıt / e-posta / captcha bayrakları, e-posta beyaz listesi |
| captcha | `POST /api/v1/auth/captcha/challenge` → çöz → `POST /api/v1/auth/captcha/verify` | `captcha_token`, tek kullanımlık, onu harcayan çağrılarla **aynı çıkış** |
| posta kutusu | temp.tf takma adı (veya Emailnator `@gmail.com`) | yalnızca panelin beyaz listesindeki alan adları |
| kod gönder | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| kod | posta kutusunu yokla | 6 karakterli alfanümerik, 15 dakikalık pencere |
| kayıt | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| gruplar | `GET /api/v1/groups/available` | bonus orada harcanabilir |
| anahtar | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| kanıt | `POST <relay>/chat/completions` | içerikle (veya `reasoning_content` ile) 200 = anahtar canlı |

## ⚙️ CLI seçenekleri

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

| Ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | çıkış havuzu, her satırda bir proxy |
| `THREEROUTER_MODEL` | `minimax-m3` | canlı doğrulama için model |

## 🛰️ Proxy arkasında

**İsteğe bağlı — ölçekte önerilir (IP başına limitler, yasaklar).** Araç proxy olmadan da çalışır.

- **Bir havuzla:** `--pool <file>` geçin (veya `THREEROUTER_PROXIES` ayarlayın) ve her istek o listeden bir çıkıştan geçer. Bir captcha token'ı bulmacayı çözen çıkışa verilir, bu yüzden tüm hesap (her iki çözüm ve kayıt çağrısı) **tek bir sabitlenmiş çıkışta** çalışır — o çıkış ölürse deneme başarısız olur ve bir sonraki çıkış kullanılır, asla doğrudan geri dönüş yapılmaz.
- **Havuz olmadan:** CLI `running WITHOUT a proxy (direct)` yazdırır ve doğrudan bağlanır. Kayıt, anahtar üretimi veya doğrulamayla ilgili hiçbir şey değişmez — yalnızca paketlerin nereden çıktığı değişir.
- `--screen`, gerçek bir çalıştırmadan önce sahip olduğunuz çıkışları (veya doğrudan rotayı) `https://threerouter.com/api/v1/settings/public` adresine karşı test eder.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir canlı doğrulanmış anahtar — git tarafından yok sayılır |
| `accounts.json` | hesap başına e-posta / grup / kayıt bakiyesi / çıkış |
| `proxies.txt` | çıkışlarınız — git tarafından yok sayılır |
| `out/` | çalıştırma günlükleri — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

Varsayılanlar: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Modeller `threerouter/<model id>` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 Sağlayıcının verdikleri | kayıtta **10 $ bakiye** (0 $ model sınıfı yok — bonus ücretsiz katmandır) |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabında bir anahtar, `minimax-m3` üzerinde sohbet doğrulamalı |
| 🌐 API şekli | OpenAI uyumlu: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `threerouter.com` / `api.threerouter.com` ve posta kutusu arka ucunuzla iletişim kurulur |

## 🐞 Sorunlar

ThreeRouter kayıt kapılarını (captcha modu, beyaz liste, bonus) veya aktarma ana bilgisayarını değiştirirse, araç orada durur ve bunu bildirir. Komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey katkıda bulunanlar

</div>