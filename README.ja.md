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

**自動生成されたAPIキーでThreeRouterアカウントを一括作成 — OpenAI互換の推論 + 9Routerコネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-5-of-them) · [🧪 APIの使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

ThreeRouterは**Sub2API v0.2.0**を実行しています（Go + Vueのパネルであり、*new-apiではありません*：`/api/status`と`/api/pricing`は`404 page not found`を返し、実際のゲートは`/api/v1`配下にあります）。新しいアカウントにはすべて**$10の使用可能な残高**が付与されます — ヘルプページでは*「デフォルト2 USDボーナス、グループ参加で10 USDボーナス」*と説明されており、この残高は実際に呼び出しの支払いに使えます（実測：1回のチャット後に`10.00` → `9.99996524`）。登録はメールアドレス + 6文字コードですが、**キャプチャなしではありません**：パネルは独自の「人間確認」（ジグソースライダーまたは画像クリックパズル）を提供します。どちらのモードも**このツール内で**解決されます — ブラウザなし、サードパーティの解決サービスなし、依存関係なし — そしてこの一連の流れは、**各アカウントが自身のキーを発行する**ことで証明されています（バッチ3 + 5/7 + 2/2：メールを失っても失うのはメールボックスだけで、キーは失われません）。各キーは実際のチャット200の後でのみ保持され、その後**10/10**で独立して再確認されています。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| 登録ボーナス | **$10の残高**（`GET /api/v1/auth/me` → `balance: 10`；使用可能 — チャットで`9.99996524`に減少） |
| キャプチャ | パネル**独自**のウィジェット：`mode: slider`（ジグソー）または`mode: image_click`（指定された色の順序でN個の図形をクリック） — このツールがオフラインで解決 |
| メールゲート | **6文字の英数字**コード（例：`74AGMV`）+ 198ドメインのホワイトリスト（`gmail.com`、`hotmail.com`、`outlook.com`、`live.com`、`icloud.com`、`proton.me` …） |
| その他のゲート | 電話**なし**、OAuth**なし**（GitHub/Google/WeChat/LinuxDo/OIDCはすべて`false`）、招待コード**なし** |
| カタログ | 検証済みキーライン上の5つのモデルID（`minimax-m3`、`deepseek-v4-pro`、`glm-5.3`、`kimi-k3`、`qwen3.8-max`） |
| 価格 | 残高ベース（チャージ時1 CNY = 1 USD、グループの`rate_multiplier`）；**$0のモデルクラス**はなく、`/api/pricing`エンドポイントもありません — 登録ボーナス*が*無料枠です |
| スケールする単位 | **1アカウント = 1キー** |

> 💡 無料枠はThreeRouterが設定するもので、変更される可能性があります。最新の数値は[threerouter.com](https://threerouter.com)で確認してください — そしてツール自身のゲートに判断させてください：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全5つ

有効なキーで`GET /v1/models`を実行すると**5つのモデル**が一覧表示されます。検証済みのラインは`minimax-m3`です（推論モデル — `content`*と*`reasoning_content`の両方を返すため、ゲートはどちらでも受け入れます）。

| モデルID | 検証済み |
| --- | --- |
| `minimax-m3` | **すべてのキー、チャット200** — `providers/threerouter/keys.txt`での発行時に；同梱のCLI（`--verify-only`）による独立した再確認 |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | 同じキーで`/v1/models`により一覧表示 |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 APIの使い方

ベースURL **`https://api.threerouter.com/v1`** — OpenAI互換（コンソール自体が`api_base_url`として宣伝しています）。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

このパネルの推論モデルはしばしば`reasoning_content`を先に埋めます：`max_tokens`を少なくとも約32にしないと`content`フィールドが空で返ります（キー自体は問題ありません）。

## ⚡ コマンド1つ

```bash
node src/cli.js --count N      # mint N keys — the panel's slider/image captcha is solved in-process
node src/cli.js --dry          # print the resolved plan: writes nothing, sends nothing
```

`--auto`がデフォルトで、Node以外に何もインストールする必要はありません：`src/solver.js`がキャプチャエンジン（スライダー相関 + 画像クリックのテンプレートIoU）を保持しており、python + opencvが存在する場合、ネイティブで処理できないモードでは同梱の`captcha-solve.py`を呼び出します — ブラウザなし、CDPなし、サードパーティの解決サービスなし。プロキシは任意のままです：CLIの隣に`proxies.txt`があれば自動的に使用され、なければツールは直接接続します。`--no-auto`は組み込みソルバーを無効にします；高度なエスケープハッチ（`--captcha-cmd`、`--solve-file`）は、すでに独自のソルバーを持っているオペレーター向けです。

> ⚠️ **利用規約とアカウントのリスク。** プロバイダーの自動化は利用規約に違反し、アカウントやIPがBANされる可能性があります。これはご自身が所有するアカウントに対して、ご自身のマシンから、自己責任で実行してください；このツールはサイト自身の登録ページを操作するだけで、有料ゲートを回避することはありません。大規模なキャンペーンの前にプロバイダーの利用規約をお読みください。

## 🛠 クイックスタート

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

キーは`/v1/chat/completions`がコンテンツ付きで200を返した**後でのみ**`keys.txt`に書き込まれます；`accounts.json`はメールアドレス、グループ、付与額、および各アカウントが使用した出口を保持します。キャプチャ：python + opencvがインストールされている場合は`captcha-solve.py`（CLIの隣に同梱）が使用されます — これがこのリポジトリのキーが発行されたソルバーです（スライダー6/6およびimage_clickのライブ検証）；pythonがない場合は、依存関係のない組み込みJSソルバーが引き継ぎます（スライダーは同等、image_clickはベストエフォート、再試行ごとに新しいチャレンジを1つ）。`--captcha-cmd <cmd>`はどちらかを置き換えます（チャレンジJSONをstdinに、回答JSONをstdoutに）；`--solve-file <challenge.json>`は保存された1つのチャレンジをオフラインで解決します。

### 🖱️ ランチャー

`npm start`でランチャーメニューが開き、項目**1) Mint keys**は1つの質問 — キーの数 — を尋ね、`--auto`で発行を実行します：キャプチャはプロセス内で解決され、CLIの隣の`proxies.txt`が自動的に取得されます（なければ直接接続）。キャプチャ、トークン、プロキシに関する質問はありません。他のメニュー項目は`--verify-only`、`--screen`、および9Router / OmniRouteコネクタをラップします。

## ✅ 動作検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`、`email_verify_enabled`、`registration_click_captcha_enabled: true`、198ドメインのホワイトリスト、OAuthなし |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token`（900秒、単回使用、解決した出口にバインド）；ライブ解決：スライダー**6/6**（相関 r = 0.998–0.9998）および`captcha-solve.py`によるimage_click**8/8**；同じ保存済みチャレンジをオフラインで再生すると、組み込みJSスライダーが同一のオフセットを示す |
| `POST /api/v1/auth/send-verify-code` | **200** — コード配信済み（再利用されたtemp.tfエイリアスは`409 EMAIL_EXISTS`を返し、ツールはメールボックスをローテーションする） |
| `POST /api/v1/auth/register` | **200** — `access_token`；コードは15分のウィンドウ内で使用する必要がある |
| `GET /api/v1/auth/me` | **200** — すべてのアカウントで`balance: 10` |
| `POST /api/v1/keys` | **200** — `sk-…`が一度だけ返される（グループ`12:default`；`13:vip`も提供） |
| 発行フロー — 1アカウントにつき1キー、チャット200の**後でのみ**書き込み | nodeレール経由で10アカウント + 同梱CLI自体経由で1アカウント（エンドツーエンド45秒、チャット200） |
| `POST /v1/chat/completions`（`minimax-m3`） | 保持される前のすべてのキーで実際のコンテンツ付き**200**、その後1つずつ再確認 |
| nodeレールキーの独立した再確認（シリアル、新しい出口） | **すべて合格**（2026-10-21；キーごとの証拠は`out/keys-verify.json`に） |
| パネル側の注記 | 画像パズルは時折`400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID`を返す（古いまたは見逃したチャレンジ） — ツールは単に新しいものを要求する；共有のtemp.tfエイリアスがパネルにすでに存在する場合があり（`EMAIL_EXISTS` → 新しいメールボックス）、outlook.comのボックスは配信されないことが確認されているため、CLIはデフォルトで`--mail-providers hotmail`を3回の試行で使用する |

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt`に書き込まれる前にライブの`chat-200`を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います：エントリは
> **モデルが`chat-200`を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加されずに削除されます。検証ステップはいつでも再実行できます；
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 注記 |
| --- | --- | --- |
| ゲート | `GET /api/v1/settings/public` | 登録 / メール / キャプチャのフラグ、メールホワイトリスト |
| キャプチャ | `POST /api/v1/auth/captcha/challenge` → 解決 → `POST /api/v1/auth/captcha/verify` | `captcha_token`、単回使用、それを消費する呼び出しと**同じ出口** |
| メールボックス | temp.tfエイリアス（またはEmailnator `@gmail.com`） | パネルのホワイトリストに登録されたドメインのみ |
| コード送信 | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| コード | メールボックスをポーリング | 6文字の英数字、15分のウィンドウ |
| 登録 | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| グループ | `GET /api/v1/groups/available` | ボーナスはそこで使用可能 |
| キー | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| 証明 | `POST <relay>/chat/completions` | コンテンツ（または`reasoning_content`）付き200 = キーが有効 |

## ⚙️ CLIオプション

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

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | 出口プール、1行につき1プロキシ |
| `THREEROUTER_MODEL` | `minimax-m3` | ライブ検証に使用するモデル |

## 🛰️ プロキシの背後で

**任意 — 大規模な場合は推奨（IPごとの制限、BAN）。** ツールはプロキシなしでも動作します。

- **プールあり：** `--pool <file>`を渡す（または`THREEROUTER_PROXIES`を設定する）と、すべてのリクエストがそのリストの出口を経由します。キャプチャトークンはパズルを解決した出口に対して発行されるため、アカウント全体（両方の解決と登録呼び出し）が**1つの固定された出口**で実行されます — その出口が死ぬと試行は失敗し、次の出口が使用され、直接フォールバックは決して行われません。
- **プールなし：** CLIは`running WITHOUT a proxy (direct)`と表示して直接接続します。登録、キー発行、検証について何も変わりません — パケットが出ていく場所だけが変わります。
- `--screen`は、実際の実行前に、手持ちの出口（または直接ルート）を`https://threerouter.com/api/v1/settings/public`に対してテストします。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1行につき1つのライブ検証済みキー — git無視 |
| `accounts.json` | アカウントごとのメール / グループ / 登録残高 / 出口 |
| `captcha-solve.py` | キャプチャソルバー（python + opencv）：スライダー相関と画像クリックのテンプレートIoU |
| `proxies.txt` | あなたの出口 — git無視 |
| `keys-dead.txt` | チャットゲートに失敗したキー — `--verify-only`により書き込み — git無視 |
| `src/solver.js` | キャプチャエンジン（スライダー + image_click、pythonヘルパー、`--auto`エントリ） |
| `out/` | 実行ログ — git無視 |

## 🔌 9Routerに接続

[9Router](https://9router.com)はセルフホスト型のOpenAI互換ルーターです：

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

デフォルト：`--9router-prefix threerouter`、`--9router-base-url https://api.threerouter.com/v1`、`--model minimax-m3`。モデルは`threerouter/<model id>`として提供されます。

## 🔌 OmniRouteに接続

[OmniRoute](https://omniroute.online)はセルフホスト型のOpenAI互換ルーターです：

```bash
node src/cli.js --connect-omniroute --omniroute-base http://localhost:20128 --omniroute-password 123456 \
  --api-key YOUR_KEY
```

デフォルト：`--omniroute-prefix threerouter`、`--omniroute-base-url https://api.threerouter.com/v1`、`--model minimax-m3`。モデルは`threerouter/<model id>`として提供されます。

## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 プロバイダーが提供するもの | 登録時に**$10の残高**（$0のモデルクラスなし — ボーナスが無料枠） |
| 🔑 1つのキーで得られるもの | 独自のアカウント上の1つのキー、`minimax-m3`でチャット検証済み |
| 🌐 APIの形式 | OpenAI互換：`POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 あなたのデータ | `threerouter.com` / `api.threerouter.com`とあなたの受信トレイバックエンドのみが接触されます |

## 🐞 問題報告

ThreeRouterが登録ゲート（キャプチャモード、ホワイトリスト、ボーナス）またはリレーホストを変更した場合、ツールはそこで停止し、その旨を報告します。コマンドと正確な出力を添えて**[issueを開いてください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE)を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>