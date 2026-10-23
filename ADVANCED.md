# Advanced — threerouter-bulk-apikey

Everything here is optional. The one-command path (`npm start` → **1) Mint keys**, or
`node src/cli.js --count N`) already solves the panel's own slider / image-click captcha
in-process with `src/solver.js`. These are the escape hatches.

## 1. Which solver runs

`src/solver.js` is the single captcha entry. For every challenge it tries, in order:

1. `--captcha-cmd "<cmd>"` — your own solver: the challenge JSON goes to its stdin and the
   answer JSON comes back on stdout.
2. the bundled `captcha-solve.py` (python + opencv) for **both** modes — `slider` and
   `image_click` — when it can run;
3. the built-in dependency-free JS solver (`slider` correlation, `image_click` template IoU).

```bash
node src/cli.js --count 5 --captcha-cmd "node my-solver.js"
node src/cli.js --solve-file challenge.json      # offline: solve one saved challenge
node src/cli.js --solve-file -                   # …or read the challenge JSON on stdin
```

`PYTHON=<path>` picks the interpreter for the bundled helper.

## 2. Turning the embedded solver off

`--no-auto` disables the embedded path; without `--captcha-cmd` the run stops at the first
challenge with a clear message instead of pretending.

## 3. The exit a token belongs to

A `captcha_token` is single use (900 s) and bound to the exit that solved the puzzle, so the
whole account — both solves and the register call — runs on **one pinned exit**. `--pool
<file>` (or `THREEROUTER_PROXIES`) supplies the list; a `proxies.txt` next to the CLI is used
automatically, and without a usable list the tool connects directly.

## 4. Files the tool writes

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line |
| `keys-dead.txt` | keys `--verify-only` found dead |
| `accounts.json` | e-mail / group / signup balance / exit per account |
| `out/` | run logs |

`--dry` prints the resolved plan — count, pool size, model, solver and python-helper
availability — and writes nothing and sends nothing, so it is safe to run anywhere.
