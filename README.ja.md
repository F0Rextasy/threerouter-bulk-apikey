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

**自動生成された API キーで ThreeRouter アカウントを一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-5-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

ThreeRouter は **Sub2API v0.2.0** を実行しています（Go + Vue のパネルであり、new-api では*ありません*: `/api/status` と `/api/pricing` は `404 page not found` を返し、実際のゲートは `/api/v1` 配下にあります）。新しいアカウントには毎回 **$10 の使用可能な残高**が付与されます — ヘルプページではこれを *「デフォルト 2 USD ボーナス、グループ参加で 10 USD ボーナス」* と呼んでおり、この残高は実際に呼び出しの支払いに使えます（実測: 1 回のチャット後に `10.00` → `9.99996524`）。登録はメールアドレス + 6 文字のコードですが、**キャプチャなしでは済みません**: パネルは独自の「人間確認」（ジグソースライダーまたは画像クリックパズル）を提供します。どちらのモードも**このツール内で**解決されます — ブラウザも、サードパーティの解決サービスも、依存関係も不要です — そしてこの一連の流れは **10 アカウント → 10 キー**を作成することで証明されました（バッチ 3 + 5/7 + 2/2: メールを失っても失うのはメールボックスだけで、キーは決して失われません）。各キーは実際のチャットで 200 を確認した後にのみ保持され、その後独立して再確認され **10/10** でした。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| 登録ボーナス | **$10 の残高**（`GET /api/v1/auth/me` → `balance: 10`、使用可能 — 1 回のチャットで `9.99996524` に減少） |
| キャプチャ | パネル**独自**のウィジェット: `mode: slider`（ジグソー）または `mode: image_click`（色の順序で N 個の図形をクリック） — このツールがオフラインで解決 |
| メールゲート | **6 文字の英数字**コード（例: `74AGMV`）+ 198 ドメインのホワイトリスト（`gmail.com`、`hotmail.com`、`outlook.com`、`live.com`、`icloud.com`、`proton.me` …） |
| その他のゲート | 電話**なし**、OAuth **なし**（GitHub/Google/WeChat/LinuxDo/OIDC はすべて `false`）、招待コード**なし** |
| カタログ | 検証済みキーライン上の 5 つのモデル ID（`minimax-m3`、`deepseek-v4-pro`、`glm-5.3`、`kimi-k3`、`qwen3.8-max`） |
| 価格 | 残高ベース（チャージ時 1 CNY = 1 USD、グループの `rate_multiplier`）。**$0 のモデルクラス**はなく、`/api/pricing` エンドポイントもありません — 登録ボーナス*が*無料枠です |
| スケールする単位 | **1 アカウント = 1 キー** |

> 💡 無料枠は ThreeRouter が設定するもので、変更される可能性があります。最新の数値は [threerouter.com](https://threerouter.com) で確認してください — そしてツール自身のゲートに判断させましょう:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — その 5 つすべて

有効なキーで `GET /v1/models` を実行すると **5 つのモデル**が一覧表示されます。検証済みのラインは `minimax-m3` です（推論モデル — `content` *と* `reasoning_content` の両方を返すため、ゲートはどちらでも受け付けます）。

| モデル ID | 検証済み |
| --- | --- |
| `minimax-m3` | `providers/threerouter/keys.txt` での作成時に **10 キーがチャット 200**。同梱の CLI（`--verify-only`）による独立した再確認 |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | 同じキーで `/v1/models` により一覧表示 |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 API の使い方

ベース URL は **`https://api.threerouter.com/v1`** — OpenAI 互換です（コンソール自体が `api_base_url` としてこれを告知しています）。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

このパネルの推論モデルはしばしば `reasoning_content` を先に埋めます: `max_tokens` を少なくとも約 32 にしないと `content` フィールドが空で返ります（キー自体は問題ありません）。

## 🛠 クイックスタート

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

キーは `/v1/chat/completions` がコンテンツ付きで 200 を返した**後にのみ** `keys.txt` に書き込まれます。`accounts.json` は各アカウントが使用したメールアドレス、グループ、付与額、出口を保持します。キャプチャ: `captcha-solve.py`（CLI の隣に同梱）は python + opencv がインストールされている場合に使用されます — これがこのリポジトリのキーが作成された際に使われたソルバーです（スライダー 6/6、image_click 8/8 のライブ検証）。python がない場合は、依存関係のない組み込み JS ソルバーが引き継ぎます（スライダーは同等、image_click はベストエフォート、リトライごとに新しいチャレンジを 1 つ）。`--captcha-cmd <cmd>` はどちらかを置き換えます（チャレンジ JSON を stdin に、回答 JSON を stdout に）。`--solve-file <challenge.json>` は保存された 1 つのチャレンジをオフラインで解決します。

### 🖱️ ランチャー

ランチャーはプロキシリストと件数を尋ね、それらを記憶し、CLI を実行します — 作成、検証、出口のスクリーニング、設定、ヘルプ、9Router への接続。

## ✅ 動作検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`、`email_verify_enabled`、`registration_click_captcha_enabled: true`、198 ドメインのホワイトリスト、OAuth なし |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token`（900 秒、単回使用、解決した出口にバインド）; ライブ解決: スライダー **6/6**（相関 r = 0.998–0.9998）、`captcha-solve.py` による image_click **8/8**; 同じ保存済みチャレンジをオフラインで再生すると、組み込み JS スライダーが同一のオフセットを示す |
| `POST /api/v1/auth/send-verify-code` | **200** — コード配信済み（再利用された temp.tf エイリアスは `409 EMAIL_EXISTS` を返し、ツールはメールボックスをローテーションする） |
| `POST /api/v1/auth/register` | **200** — `access_token`; コードは 15 分の有効期限内に使用する必要がある |
| `GET /api/v1/auth/me` | **200** — すべてのアカウントで `balance: 10` |
| `POST /api/v1/keys` | **200** — `sk-…` が一度だけ返される（グループ `12:default`; `13:vip` も提供） |
| 作成フロー — 1 アカウントにつき 1 キー、チャット 200 の**後にのみ**書き込み | node レール経由で 10 アカウント + 同梱の CLI 自体経由で 1 アカウント（エンドツーエンドで 45 秒、チャット 200） |
| `POST /v1/chat/completions`（`minimax-m3`） | 保持される前のすべてのキーで実際のコンテンツ付き **200**、その後 1 つずつ再確認 |
| node レールのキーの独立した再確認（直列、新しい出口） | **10/10 PASS**（2026-10-21; キーごとの証拠は `out/keys-verify.json`） |
| パネル側の注記 | 画像パズルは時折 `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` を返す（古い、または見逃したチャレンジ） — ツールは単に新しいものを要求する; 共有の temp.tf エイリアスがパネルに既に存在する場合がある（`EMAIL_EXISTS` → 新しいメールボックス）、また outlook.com のメールボックスは配信されないことが確認されているため、CLI はデフォルトで `--mail-providers hotmail` を 3 回の試行で使用する |

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| ゲート | `GET /api/v1/settings/public` | 登録 / メール / キャプチャのフラグ、メールホワイトリスト |
| キャプチャ | `POST /api/v1/auth/captcha/challenge` → 解決 → `POST /api/v1/auth/captcha/verify` | `captcha_token`、単回使用、それを消費する呼び出しと**同じ出口** |
| メールボックス | temp.tf エイリアス（または Emailnator `@gmail.com`） | パネルのホワイトリストにあるドメインのみ |
| コード送信 | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| コード | メールボックスをポーリング | 6 文字の英数字、15 分の有効期限 |
| 登録 | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| グループ | `GET /api/v1/groups/available` | ボーナスはそこで使用可能 |
| キー | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| 証明 | `POST <relay>/chat/completions` | コンテンツ（または `reasoning_content`）付きの 200 = キーが有効 |

## ⚙️ CLI オプション

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

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | 出口プール、1 行につき 1 プロキシ |
| `THREEROUTER_MODEL` | `minimax-m3` | ライブ検証に使用するモデル |

## 🛰️ プロキシの背後で

**任意 — 規模を拡大する場合は推奨（IP ごとの制限、BAN）。** このツールはプロキシなしでも動作します。

- **プールあり:** `--pool <file>` を渡す（または `THREEROUTER_PROXIES` を設定する）と、すべてのリクエストがそのリストの出口を経由します。キャプチャトークンはパズルを解決した出口に対して発行されるため、アカウント全体（両方の解決と登録呼び出し）が**1 つの固定された出口**で実行されます — その出口が死ぬと試行は失敗し、次の出口が使用され、直接フォールバックは決して行われません。
- **プールなし:** CLI は `running WITHOUT a proxy (direct)` と表示し、直接接続します。登録、キー作成、検証について何も変わりません — 変わるのはパケットが出ていく場所だけです。
- `--screen` は実際の実行前に、手持ちの出口（または直接ルート）を `https://threerouter.com/api/v1/settings/public` に対してテストします。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つのライブ検証済みキー — git 無視 |
| `accounts.json` | アカウントごとのメール / グループ / 登録残高 / 出口 |
| `captcha-solve.py` | キャプチャソルバー（python + opencv）: スライダー相関と image-click テンプレート IoU |
| `proxies.txt` | あなたの出口 — git 無視 |
| `out/` | 実行ログ — git 無視 |

## 🔌 9Router への接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

デフォルト: `--9router-prefix threerouter`、`--9router-base-url https://api.threerouter.com/v1`、`--model minimax-m3`。モデルは `threerouter/<model id>` として提供されます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 プロバイダーが提供するもの | 登録時に **$10 の残高**（$0 のモデルクラスはなし — ボーナスが無料枠） |
| 🔑 1 つのキーで得られるもの | 独自のアカウント上の 1 つのキー、`minimax-m3` でチャット検証済み |
| 🌐 API の形式 | OpenAI 互換: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 あなたのデータ | 接続されるのは `threerouter.com` / `api.threerouter.com` とあなたの受信トレイバックエンドのみ |

## 🐞 問題報告

ThreeRouter が登録ゲート（キャプチャモード、ホワイトリスト、ボーナス）やリレーホストを変更した場合、ツールはそこで停止し、その旨を報告します。コマンドと正確な出力を添えて**[issue を作成してください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>