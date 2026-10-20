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

**批量创建 ThreeRouter 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-5-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

ThreeRouter 运行的是 **Sub2API v0.2.0**（一个 Go + Vue 面板，*并非* new-api：`/api/status` 和 `/api/pricing` 返回 `404 page not found`，真正的入口位于 `/api/v1` 之下）。每个新账户都会获得 **$10 可用余额** —— 帮助页面称之为 *"默认 2 美元奖励，加入群组赠送 10 美元"*，而且余额确实可以支付调用（实测：一次对话后从 `10.00` → `9.99996524`）。注册方式是邮箱 + 6 位字符验证码，但**并非**无验证码：面板会提供自己的"人机验证"（拼图滑块或图片点击谜题）。两种模式都**在本工具内部**解决 —— 无需浏览器、无需第三方打码服务、无依赖 —— 整条流程已通过铸造 **10 个账户 → 10 个密钥** 得到验证（批次 3 + 5/7 + 2/2：丢失一封邮件只损失一个邮箱，绝不损失密钥），每个密钥只有在实时对话返回 200 后才被保留，随后又独立复检达到 **10/10**。

## 🎁 免费额度 —— 你能获得多少

| 项目 | 值 |
| --- | --- |
| 注册奖励 | **$10 余额**（`GET /api/v1/auth/me` → `balance: 10`；可消费 —— 一次对话后变为 `9.99996524`） |
| 验证码 | 面板**自有的**组件：`mode: slider`（拼图滑块）或 `mode: image_click`（按颜色顺序点击 N 个图形）—— 由本工具离线解决 |
| 邮箱门槛 | **6 位字母数字**验证码（例如 `74AGMV`）+ 198 个域名白名单（`gmail.com`、`hotmail.com`、`outlook.com`、`live.com`、`icloud.com`、`proton.me` …） |
| 其他门槛 | **无**手机号、**无** OAuth（GitHub/Google/WeChat/LinuxDo/OIDC 全部为 `false`）、**无**邀请码 |
| 模型目录 | 已验证密钥线上有 5 个模型 id（`minimax-m3`、`deepseek-v4-pro`、`glm-5.3`、`kimi-k3`、`qwen3.8-max`） |
| 定价 | 基于余额（充值时 1 CNY = 1 USD，群组 `rate_multiplier`）；**没有 $0 模型档位**，也没有 `/api/pricing` 端点 —— 注册奖励*就是*免费额度 |
| 可扩展的单元 | **一个账户 = 一个密钥** |

> 💡 免费额度由 ThreeRouter 设定，可能发生变化。请在 [threerouter.com](https://threerouter.com) 查看实时数字 —— 并让工具自身的门槛来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 —— 全部 5 个

使用有效密钥请求 `GET /v1/models` 会列出 **5 个模型**；已验证的线路是 `minimax-m3`（推理模型 —— 它同时返回 `content` *和* `reasoning_content`，因此门槛接受任一者）。

| 模型 ID | 已验证 |
| --- | --- |
| `minimax-m3` | 铸造期间 **10 个密钥对话返回 200**，位于 `providers/threerouter/keys.txt`；通过随附的 CLI（`--verify-only`）独立复检 |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | 由同一批密钥的 `/v1/models` 列出 |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 如何使用 API

基础 URL **`https://api.threerouter.com/v1`** —— 兼容 OpenAI（控制台本身将其标注为 `api_base_url`）。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

此面板上的推理模型通常会先填充 `reasoning_content`：请将 `max_tokens` 至少设为约 32，否则 `content` 字段会返回空（密钥本身仍然有效）。

## 🛠 快速开始

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

只有当 `/v1/chat/completions` 返回 200 且带有内容时，密钥才会被写入 `keys.txt`；`accounts.json` 会保留每个账户使用的邮箱、群组、授予额度以及出口。验证码：当安装了 python + opencv 时，会使用 `captcha-solve.py`（随 CLI 一同提供）—— 这正是本仓库密钥铸造时所用的求解器（滑块 6/6，image_click 8/8 实时验证）；没有 python 时，则由内置的无依赖 JS 求解器接管（滑块等效，image_click 尽力而为，每次重试生成一个新挑战）。`--captcha-cmd <cmd>` 可替换其中任一者（挑战 JSON 从 stdin 输入，答案 JSON 从 stdout 输出）；`--solve-file <challenge.json>` 可离线求解一个已保存的挑战。

### 🖱️ 启动器

启动器会询问代理列表和数量，记住它们，并运行 CLI —— 铸造、验证、筛选出口、设置、帮助、连接到 9Router。

## ✅ 已验证可用 —— 每个密钥都经过测试

| 检查项 | 结果 |
| --- | --- |
| `GET /api/v1/settings/public` | **200** —— `registration_enabled`、`email_verify_enabled`、`registration_click_captcha_enabled: true`、198 域名白名单、无 OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** —— `captcha_token`（900 秒，单次使用，绑定到求解出口）；实时求解：滑块 **6/6**（相关性 r = 0.998–0.9998），使用 `captcha-solve.py` 的 image_click **8/8**；相同的已保存挑战离线重放时，内置 JS 滑块显示相同的偏移量 |
| `POST /api/v1/auth/send-verify-code` | **200** —— 验证码已送达（重复使用的 temp.tf 别名会返回 `409 EMAIL_EXISTS`，工具会轮换邮箱） |
| `POST /api/v1/auth/register` | **200** —— `access_token`；验证码必须在其 15 分钟窗口内使用 |
| `GET /api/v1/auth/me` | **200** —— 每个账户 `balance: 10` |
| `POST /api/v1/keys` | **200** —— 返回一次 `sk-…`（群组 `12:default`；也提供 `13:vip`） |
| 铸造流程 —— 每个账户一个密钥，**仅**在对话返回 200 后写入 | 通过 node 线路铸造 10 个账户 + 通过随附的 CLI 本身铸造 1 个账户（端到端 45 秒，对话返回 200） |
| `POST /v1/chat/completions`（`minimax-m3`） | 每个密钥在被保留前都返回 **200** 且带有真实内容，并逐一复检 |
| node 线路密钥的独立复检（串行，全新出口） | **10/10 通过**（2026-10-21；每个密钥的证据见 `out/keys-verify.json`） |
| 面板侧备注 | 图片谜题偶尔会返回 `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID`（挑战过期或未命中）—— 工具会直接请求一个新的；共享的 temp.tf 别名可能已存在于面板上（`EMAIL_EXISTS` → 新邮箱），并且曾观察到 outlook.com 邮箱从不投递，因此 CLI 默认使用 `--mail-providers hotmail` 并尝试三次 |

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 备注 |
| --- | --- | --- |
| 门槛 | `GET /api/v1/settings/public` | 注册 / 邮箱 / 验证码标志、邮箱白名单 |
| 验证码 | `POST /api/v1/auth/captcha/challenge` → 求解 → `POST /api/v1/auth/captcha/verify` | `captcha_token`，单次使用，与消费它的调用使用**同一出口** |
| 邮箱 | temp.tf 别名（或 Emailnator `@gmail.com`） | 仅限面板白名单中的域名 |
| 发送验证码 | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| 验证码 | 轮询邮箱 | 6 位字母数字，15 分钟窗口 |
| 注册 | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| 群组 | `GET /api/v1/groups/available` | 奖励额度可在其中消费 |
| 密钥 | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| 证明 | `POST <relay>/chat/completions` | 200 且带有内容（或 `reasoning_content`）= 密钥有效 |

## ⚙️ CLI 选项

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

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | 出口池，每行一个代理 |
| `THREEROUTER_MODEL` | `minimax-m3` | 用于实时验证的模型 |

## 🛰️ 在代理之后

**可选 —— 大规模使用时推荐（按 IP 限制、封禁）。** 该工具在没有代理的情况下也能工作。

- **有代理池时：** 传入 `--pool <file>`（或设置 `THREEROUTER_PROXIES`），每个请求都会经过该列表中的一个出口。验证码令牌会颁发给求解谜题的那个出口，因此整个账户（两次求解和注册调用）都运行在**一个固定出口**上 —— 如果该出口失效，本次尝试失败并改用下一个出口，绝不回退到直连。
- **没有代理池时：** CLI 会打印 `running WITHOUT a proxy (direct)` 并直接连接。注册、密钥铸造或验证没有任何变化 —— 只是数据包的发出位置不同。
- `--screen` 会在真实运行前，用你拥有的出口（或直连路由）测试 `https://threerouter.com/api/v1/settings/public`。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个经过实时验证的密钥 —— 已被 git 忽略 |
| `accounts.json` | 每个账户的邮箱 / 群组 / 注册余额 / 出口 |
| `captcha-solve.py` | 验证码求解器（python + opencv）：滑块相关性和图片点击模板 IoU |
| `proxies.txt` | 你的出口 —— 已被 git 忽略 |
| `out/` | 运行日志 —— 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

默认值：`--9router-prefix threerouter`、`--9router-base-url https://api.threerouter.com/v1`、`--model minimax-m3`。模型以 `threerouter/<model id>` 的形式提供。

## 🔑 一个密钥能给你带来什么

| | |
| --- | --- |
| 🏢 提供商 | **ThreeRouter** —— [threerouter.com](https://threerouter.com) |
| 🎁 提供商提供的内容 | 注册时 **$10 余额**（没有 $0 模型档位 —— 奖励就是免费额度） |
| 🔑 一个密钥能给你带来什么 | 在其自有账户上的一个密钥，已在 `minimax-m3` 上通过对话验证 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 你的数据 | 仅会联系 `threerouter.com` / `api.threerouter.com` 以及你的邮箱后端 |

## 🐞 问题反馈

如果 ThreeRouter 更改了其注册门槛（验证码模式、白名单、奖励）或其中继主机，工具会在此处停止并说明原因。请**[提交 issue](../../issues)**，附上命令和确切的输出。

## 📄 许可证

MIT © 2026 —— 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey 贡献者

</div>