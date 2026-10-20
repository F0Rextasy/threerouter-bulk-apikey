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

**Crie contas ThreeRouter em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://threerouter.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-5-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

O ThreeRouter roda **Sub2API v0.2.0** (um painel Go + Vue, *não* new-api: `/api/status` e `/api/pricing` respondem `404 page not found`, os portões reais ficam em `/api/v1`). Toda nova conta chega com **$10 de saldo utilizável** — a página de ajuda chama isso de *"Bônus padrão de 2 USD, bônus de 10 USD por entrar no grupo"*, e o saldo realmente paga pelas chamadas (medido: `10.00` → `9.99996524` após um chat). O cadastro é e-mail + código de 6 caracteres, mas **não** é livre de captcha: o painel serve sua própria "verificação humana" (um slider de quebra-cabeça ou um quebra-cabeça de clicar em imagem). Ambos os modos são resolvidos **dentro desta ferramenta** — sem navegador, sem serviço de resolução de terceiros, sem dependências — e toda a linha foi comprovada ao cunhar **10 contas → 10 chaves** (lotes 3 + 5/7 + 2/2: um e-mail perdido custa uma caixa de correio, nunca uma chave), cada chave mantida apenas após um chat ao vivo 200 e depois reverificada de forma independente em **10/10**.

## 🎁 Nível gratuito — quanto você recebe

| O quê | Valor |
| --- | --- |
| Bônus de cadastro | **$10 de saldo** (`GET /api/v1/auth/me` → `balance: 10`; utilizável — um chat o moveu para `9.99996524`) |
| Captcha | o widget **próprio** do painel: `mode: slider` (quebra-cabeça) ou `mode: image_click` (clique em N formas na ordem de cores) — resolvido offline por esta ferramenta |
| Portão de e-mail | código **alfanumérico de 6 caracteres** (ex.: `74AGMV`) + uma lista de permissões de 198 domínios (`gmail.com`, `hotmail.com`, `outlook.com`, `live.com`, `icloud.com`, `proton.me` …) |
| Outros portões | **sem** telefone, **sem** OAuth (GitHub/Google/WeChat/LinuxDo/OIDC todos `false`), **sem** código de convite |
| Catálogo | 5 ids de modelo na linha de chaves verificada (`minimax-m3`, `deepseek-v4-pro`, `glm-5.3`, `kimi-k3`, `qwen3.8-max`) |
| Preços | baseado em saldo (1 CNY = 1 USD na recarga, `rate_multiplier` do grupo); **não** existe classe de modelo a $0 e nem endpoint `/api/pricing` — o bônus de cadastro *é* o nível gratuito |
| A unidade que escala | **uma conta = uma chave** |

> 💡 O nível gratuito é definido pelo ThreeRouter e pode mudar. Confira os números ao vivo em [threerouter.com](https://threerouter.com) — e deixe o próprio portão da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 5

`GET /v1/models` com uma chave ativa lista **5 modelos**; a linha verificada é `minimax-m3` (modelo de raciocínio — ele responde `content` *e* `reasoning_content`, então o portão aceita qualquer um).

| ID do modelo | Verificado |
| --- | --- |
| `minimax-m3` | **10 chaves chat-200** durante a cunhagem em `providers/threerouter/keys.txt`; reverificação independente via a CLI fornecida (`--verify-only`) |
| `deepseek-v4-pro` · `glm-5.3` · `kimi-k3` · `qwen3.8-max` | listados por `/v1/models` nas mesmas chaves |

```bash
curl https://api.threerouter.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"model":"minimax-m3","messages":[{"role":"user","content":"hi"}],"max_tokens":32}'
```

## 🧪 Como usar a API

URL base **`https://api.threerouter.com/v1`** — compatível com OpenAI (o próprio console o anuncia como `api_base_url`).

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.threerouter.com/v1", api_key="YOUR_KEY")
print(c.chat.completions.create(model="minimax-m3",
      messages=[{"role":"user","content":"hi"}], max_tokens=32).choices[0].message.content)
```

Modelos de raciocínio neste painel frequentemente preenchem `reasoning_content` primeiro: dê ao `max_tokens` pelo menos ~32 ou o campo `content` volta vazio (a chave ainda está boa).

## 🛠 Início rápido

```bash
cd threerouter-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/cli.js --count 5        # mint (slider/image captcha solved in-process)
node src/cli.js --verify-only    # re-check every key in keys.txt
node src/cli.js --screen         # exit pool self-test
node src/cli.js --connect-9router
```

Uma chave é gravada em `keys.txt` **somente** após `/v1/chat/completions` responder 200 com conteúdo; `accounts.json` guarda o e-mail, o grupo, a concessão e a saída que cada conta usou. Captcha: `captcha-solve.py` (fornecido junto à CLI) é usado quando python + opencv estão instalados — esse é o solucionador com o qual as chaves deste repositório foram cunhadas (slider 6/6 e image_click 8/8 verificados ao vivo); sem python, o solucionador JS embutido e sem dependências assume (slider equivalente, image_click melhor esforço, um novo desafio por tentativa). `--captcha-cmd <cmd>` substitui qualquer um dos dois (JSON do desafio na entrada padrão, JSON da resposta na saída padrão); `--solve-file <challenge.json>` resolve um desafio salvo offline.

### 🖱️ O inicializador

O inicializador pede a lista de proxies e a contagem, lembra delas e executa a CLI — cunhar, verificar, testar saídas, configurações, ajuda, Conectar ao 9Router.

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `GET /api/v1/settings/public` | **200** — `registration_enabled`, `email_verify_enabled`, `registration_click_captcha_enabled: true`, lista de permissões de 198 domínios, sem OAuth |
| `POST /api/v1/auth/captcha/challenge` + `/verify` | **200** — `captcha_token` (900 s, uso único, vinculado à saída de resolução); resoluções ao vivo: slider **6/6** (correlação r = 0.998–0.9998) e image_click **8/8** com `captcha-solve.py`; os mesmos desafios salvos reproduzidos offline mostram o slider JS embutido em deslocamentos idênticos |
| `POST /api/v1/auth/send-verify-code` | **200** — código entregue (um alias temp.tf reutilizado responde `409 EMAIL_EXISTS` e a ferramenta rotaciona a caixa de correio) |
| `POST /api/v1/auth/register` | **200** — `access_token`; o código deve ser usado dentro de sua janela de 15 minutos |
| `GET /api/v1/auth/me` | **200** — `balance: 10` em toda conta |
| `POST /api/v1/keys` | **200** — `sk-…` retornado uma vez (grupo `12:default`; `13:vip` também oferecido) |
| fluxo de cunhagem — uma chave por conta, gravada **somente** após um chat 200 | 10 contas via o trilho node + 1 conta via a própria CLI fornecida (45 s de ponta a ponta, chat-200) |
| `POST /v1/chat/completions` (`minimax-m3`) | **200** com conteúdo real para toda chave antes de ser mantida, e reverificada uma a uma |
| reverificação independente das chaves do trilho node (serial, saída nova) | **10/10 PASS** (2026-10-21; evidência por chave em `out/keys-verify.json`) |
| notas do lado do painel | o quebra-cabeça de imagem ocasionalmente responde `400 REGISTRATION_CLICK_CAPTCHA_CHALLENGE_INVALID` / `..._INVALID` (um desafio obsoleto ou perdido) — a ferramenta simplesmente solicita um novo; um alias temp.tf compartilhado pode já existir no painel (`EMAIL_EXISTS` → nova caixa de correio) e caixas outlook.com já foram vistas nunca entregando, então a CLI usa por padrão `--mail-providers hotmail` com três tentativas |

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: ThreeRouter page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.threerouter.com/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Notas |
| --- | --- | --- |
| portões | `GET /api/v1/settings/public` | flags de registro / e-mail / captcha, lista de permissões de e-mail |
| captcha | `POST /api/v1/auth/captcha/challenge` → resolver → `POST /api/v1/auth/captcha/verify` | `captcha_token`, uso único, **mesma saída** que as chamadas que o consomem |
| caixa de correio | alias temp.tf (ou Emailnator `@gmail.com`) | apenas os domínios permitidos do painel |
| enviar código | `POST /api/v1/auth/send-verify-code` | `{email, click_captcha_token}` |
| código | consultar a caixa de correio | alfanumérico de 6 caracteres, janela de 15 minutos |
| registrar | `POST /api/v1/auth/register` | `{email, password, verify_code, click_captcha_token}` → `access_token` |
| grupos | `GET /api/v1/groups/available` | o bônus é utilizável ali |
| chave | `POST /api/v1/keys` | `{name, group_id}` → `sk-…` |
| prova | `POST <relay>/chat/completions` | 200 com conteúdo (ou `reasoning_content`) = a chave está ativa |

## ⚙️ Opções da CLI

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

| Env | Padrão | Significado |
| --- | --- | --- |
| `THREEROUTER_PROXIES` | `proxies.txt` | pool de saídas, uma linha por proxy |
| `THREEROUTER_MODEL` | `minimax-m3` | modelo para a verificação ao vivo |

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala (limites por IP, banimentos).** A ferramenta funciona sem proxy também.

- **Com um pool:** passe `--pool <file>` (ou defina `THREEROUTER_PROXIES`) e toda requisição passa por uma saída dessa lista. Um token de captcha é emitido para a saída que resolveu o quebra-cabeça, então a conta inteira (ambas as resoluções e a chamada de registro) roda em **uma saída fixada** — se essa saída morre, a tentativa falha e a próxima saída é usada, nunca um fallback direto.
- **Sem um pool:** a CLI imprime `running WITHOUT a proxy (direct)` e conecta diretamente. Nada sobre cadastro, cunhagem de chaves ou verificação muda — apenas de onde os pacotes saem.
- `--screen` testa as saídas que você tem (ou a rota direta) contra `https://threerouter.com/api/v1/settings/public` antes de uma execução real.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada ao vivo por linha — ignorado pelo git |
| `accounts.json` | e-mail / grupo / saldo de cadastro / saída por conta |
| `captcha-solve.py` | o solucionador de captcha (python + opencv): correlação de slider e IoU de template de image-click |
| `proxies.txt` | suas saídas — ignorado pelo git |
| `out/` | logs de execução — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/cli.js --connect-9router --9router-base http://localhost:20128 --9router-password 123456 \
  --api-key YOUR_KEY
```

Padrões: `--9router-prefix threerouter`, `--9router-base-url https://api.threerouter.com/v1`, `--model minimax-m3`. Os modelos são servidos como `threerouter/<model id>`.

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **ThreeRouter** — [threerouter.com](https://threerouter.com) |
| 🎁 O que o provedor dá | **$10 de saldo** no cadastro (sem classe de modelo a $0 — o bônus é o nível gratuito) |
| 🔑 O que uma chave te dá | uma chave em sua própria conta, verificada por chat em `minimax-m3` |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.threerouter.com/v1/chat/completions` |
| 🔒 Seus dados | apenas `threerouter.com` / `api.threerouter.com` e seu backend de caixa de correio são contatados |

## 🐞 Problemas

Se o ThreeRouter mudar seus portões de registro (modo de captcha, lista de permissões, bônus) ou seu host de relay, a ferramenta para ali e avisa. **[Abra uma issue](../../issues)** com o comando e a saída exata.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 threerouter-bulk-apikey contributors

</div>