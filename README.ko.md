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

**자동 생성된 API 키로 ThreeRouter 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-5-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 왜 이 도구가 존재하는가

ThreeRouter는 **Sub2API v0.2.0**을 운영합니다 (Go + Vue 패널이며, new-api가 *아닙니다*: `/api/status`와 `/api/pricing`은 `404 page not found`를 반환하고, 실제 게이트는 `/api/v1` 아래에 있습니다). 모든 신규 계정에는 **$10의 사용 가능한 잔액**이 지급됩니다 — 도움말 페이지에서는 이를 *"기본 2 USD 보너스, 그룹 가입 시 10 USD 보너스"*라고 부르며, 이 잔액은 실제로 호출 결제에 사용됩니다 (측정: 채팅 한 번 후 `10.00` → `9.99996524`). 가입은 이메일 + 6자리 코드 방식이지만, 캡차가 없는 것은 **아닙니다**: 패널이 자체적인 "인간 검증"(직소 슬라이더 또는 이미지 클릭 퍼즐)을 제공합니다. 두 모드 모두 **이 도구 내부에서** 해결됩니다 — 브라우저도, 제3자 해결 서비스도, 의존성도 필요 없습니다 — 그리고 전체 라인은 **10개 계정 → 10개 키**를 발급하여 입증되었습니다 (배치 3 + 5/7 + 2/2: 잃어버린 이메일은 메일박스를 잃을 뿐, 키는 잃지 않습니다). 각 키는 실시간 채팅 200 응답을 받은 후에만 보관되었고, 이후 독립적으로 **10/10** 재검증되었습니다.

## 🎁 무료 티어 — 얼마나 받을 수 있는가

| 항목 | 값 |
| --- | --- |
| 가입 보너스 | **$10 잔액** (`GET /api/v1/auth/me` → `balance: 10`; 사용 가능 — 채팅 한 번에 `9.99996524`로 감소) |
| 캡차 | 패널 **자체** 위젯: `mode: slider` (직소) 또는 `mode: image_click` (색상 순서대로 N개 도형 클릭) — 이 도구가 오프라인으로 해결 |
| 이메일 게이트 | **6자리 영숫자** 코드 (예: `74AGMV`) + 198개 도메인 화이트리스트 (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| 기타 게이트 | 전화번호 **없음**, OAuth **없음** (GitHub/Google/WeChat/LinuxDo/OIDC 모두 `false`), 초대 코드 **없음** |
| 카탈로그 | 검증된 키 라인에서 5개 모델 id (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| 가격 | 잔액 기반 (충전 시 1 CNY = 1 USD, 그룹 `rate_multiplier`); **$0 모델 등급**은 없고 `/api/pricing` 엔드포인트도 없습니다 — 가입 보너스가 곧 무료 티어입니다 |
| 확장되는 단위 | **계정 하나 = 키 하나** |

> 💡 무료 티어는 ThreeRouter가 설정하며 변경될 수 있습니다. 실시간 수치는 [threerouter.com](https://threerouter.com)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 5개 전부

실시간 키로 `GET /v1/models`를 호출하면 **5개 모델**이 나열됩니다; 검증된 라인은 `minimax-m3`입니다 (추론 모델 — `content` *와* `reasoning_content`를 모두 응답하므로 게이트는 둘 중 하나를 허용합니다).

| 모델 ID | 검증됨 |
| --- | --- |
| `minimax-m3` | 발급 중 `providers/threerouter/keys.txt`에서 **10개 키 채팅-200**; 제공된 CLI(`--verify-only`)를 통한 독립적 재검증 |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | 동일한 키로 `/v1/models`에 나열됨 |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 API 사용 방법

Base URL **`https://api.threerouter.com/v1`** — OpenAI 호환 (콘솔 자체에서 `api_base_url`로 광고합니다).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

이 패널의 추론 모델은 종종 `reasoning_content`를 먼저 채웁니다: `max_tokens`를 최소 ~32로 설정하지 않으면 `content` 필드가 빈 채로 돌아옵니다 (키는 여전히 정상입니다).

## 🛠 빠른 시작

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

키는 `/v1/chat/completions`가 콘텐츠와 함께 200을 응답한 **후에만** `keys.txt`에 기록됩니다; `accounts.json`은 각 계정이 사용한 이메일, 그룹, 지급액, 출구를 보관합니다. 캡차: `captcha-solve.py` (CLI 옆에 제공됨)는 python + opencv가 설치되어 있을 때 사용됩니다 — 이 저장소의 키가 발급된 해결기입니다 (슬라이더 6/6 및 image_click 8/8 실시간 검증); python이 없으면 내장된 의존성 없는 JS 해결기가 대신합니다 (슬라이더 동등, image_click 최선 노력, 재시도마다 새 챌린지 하나). `--captcha-cmd <cmd>`는 둘 중 하나를 대체합니다 (챌린지 JSON은 stdin으로, 답변 JSON은 stdout으로); `--solve-file <challenge.json>`은 저장된 챌린지 하나를 오프라인으로 해결합니다.

### 🖱️ 런처

런처는 프록시 목록과 개수를 물어보고, 이를 기억한 뒤 CLI를 실행합니다 — 발급, 검증, 출구 스크리닝, 설정, 도움말, 9Router 연결.

## ✅ 검증됨 — 모든 키가 테스트됨

| 확인 | 결과 |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, 198개 도메인 화이트리스트, OAuth 없음 |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900초, 일회용, 해결한 출구에 바인딩됨); 실시간 해결: 슬라이더 **6/6** (상관계수 r = 0.998–0.9998) 및 `captcha-solve.py`로 image_click **8/8**; 동일한 저장 챌린지를 오프라인으로 재생하면 내장 JS 슬라이더가 동일한 오프셋을 보여줌 |
| `POST /api/v1/auth/send-verify-code` | **200** — 코드 전달됨 (재사용된 temp.tf 별칭은 `409 EMAIL_EXISTS`를 응답하고 도구는 메일박스를 교체함) |
| `POST /api/v1/auth/register` | **200** — `access_token`; 코드는 15분 이내에 사용해야 함 |
| `GET /api/v1/auth/me` | **200** — 모든 계정에서 `balance: 10` |
| `POST /api/v1/keys` | **200** — `sk-…`가 한 번 반환됨 (그룹 `12:default`; `13:vip`도 제공됨) |
| 발급 흐름 — 계정당 키 하나, 채팅 200 이후에**만** 기록 | node 레일로 10개 계정 + 제공된 CLI 자체로 1개 계정 (종단 간 45초, 채팅-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | 보관 전 모든 키에 대해 실제 콘텐츠와 함께 **200**, 이후 하나씩 재검증됨 |
| node 레일 키의 독립적 재검증 (직렬, 새 출구) | **10/10 PASS** (2026-10-21; 키별 증거는 `out/keys-verify.json`에 있음) |
| 패널 측 참고 사항 | 이미지 퍼즐이 때때로 `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID`를 응답함 (오래되었거나 놓친 챌린지) — 도구는 단순히 새 챌린지를 요청함; 공유 temp.tf 별칭이 패널에 이미 존재할 수 있고 (`EMAIL_EXISTS` → 새 메일박스) outlook.com 메일박스는 전달이 안 되는 것이 관찰되었으므로, CLI는 기본적으로 `--mail-providers hotmail`을 세 번 시도함 |

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 게이트 | `GET /api/v1/settings/public` | 가입 / 이메일 / 캡차 플래그, 이메일 화이트리스트 |
| 캡차 | `POST /api/v1/auth/captcha/challenge` → 해결 → `POST /api/v1/auth/captcha/verify` | `captcha_token`, 일회용, 이를 소비하는 호출과 **동일한 출구** |
| 메일박스 | temp.tf 별칭 (또는 Emailnator `@gmail.com`) | 패널의 화이트리스트 도메인만 |
| 코드 전송 | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| 코드 | 메일박스 폴링 | 6자리 영숫자, 15분 유효 |
| 가입 | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| 그룹 | `GET /api/v1/groups/available` | 보너스를 사용할 수 있는 곳 |
| 키 | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| 증명 | `POST <relay>/chat/completions` | 콘텐츠(또는 `reasoning_content`)와 함께 200 = 키가 살아 있음 |

## ⚙️ CLI 옵션

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

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | 출구 풀, 프록시당 한 줄 |
| `THREEROUTER_MODEL` | `minimax-m3` | 실시간 검증에 사용할 모델 |

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장됨 (IP별 제한, 차단).** 이 도구는 프록시 없이도 작동합니다.

- **풀이 있는 경우:** `--pool <file>`을 전달하거나 (또는 `THREEROUTER_PROXIES` 설정) 모든 요청이 해당 목록의 출구를 통해 나갑니다. 캡차 토큰은 퍼즐을 해결한 출구에 발급되므로, 전체 계정 (두 번의 해결과 가입 호출 모두)이 **하나의 고정된 출구**에서 실행됩니다 — 해당 출구가 죽으면 시도가 실패하고 다음 출구가 사용되며, 직접 폴백은 절대 없습니다.
- **풀이 없는 경우:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다. 가입, 키 발급, 검증에 관해서는 아무것도 바뀌지 않습니다 — 패킷이 나가는 위치만 다를 뿐입니다.
- `--screen`은 실제 실행 전에 보유한 출구 (또는 직접 경로)를 `https://threerouter.com/api/v1/settings/public`에 대해 테스트합니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 실시간 검증된 키 — git 무시됨 |
| `accounts.json` | 계정별 이메일 / 그룹 / 가입 잔액 / 출구 |
| `captcha-solve.py` | 캡차 해결기 (python + opencv): 슬라이더 상관관계 및 이미지 클릭 템플릿 IoU |
| `proxies.txt` | 사용자의 출구 — git 무시됨 |
| `out/` | 실행 로그 — git 무시됨 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

기본값: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. 모델은 `threerouter/<model id>`로 제공됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 제공자가 주는 것 | 가입 시 **$10 잔액** ($0 모델 등급 없음 — 보너스가 무료 티어) |
| 🔑 키 하나로 얻는 것 | 자체 계정의 키 하나, `minimax-m3`에서 채팅 검증됨 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 데이터 | `threerouter.com` / `api.threerouter.com` 및 사용자의 메일박스 백엔드만 접속됨 |

## 🐞 이슈

ThreeRouter가 가입 게이트 (캡차 모드, 화이트리스트, 보너스) 또는 릴레이 호스트를 변경하면, 도구는 그 지점에서 멈추고 그렇게 알립니다. 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>