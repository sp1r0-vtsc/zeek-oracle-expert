Here’s a high‑level tour of the Codex CLI codebase, what you can tweak, and how to turn on all the logging/visibility you can 
    get.

        1. Project structure
           •  bin/codex → shell‑wrapper that loads dist/cli.js
           •  dist/cli.js → compiled CLI entry‑point (built from src/cli.tsx)
           •  src/cli.tsx → parses flags (meow), dispatches subcommands
           •  src/app.tsx → orchestrates the “agentic” run loop (prompt → patch → shell → commit)
           •  src/cli-singlepass.tsx → experimental “full‑context” batch mode
           •  src/utils/agent/… → core agent loop, approvals, logging, patch parsing, telemetry hooks
           •  src/utils/config.ts → loads & bootstraps your global `~/.codex` config and instructions file
           •  src/utils/auto‑approval‑mode.ts → implements “suggest” / “auto‑edit” / “full‑auto” policies
           •  src/utils/model‑utils.ts → model‑availability checks, preloading
           •  src/utils/parsers.ts → patch and tool‑call parsing
           •  src/utils/input‑utils.ts → wraps your prompt + context into LLM inputs
           •  src/utils/terminal.ts → Ink renderer, desktop notifications, cleanup
        2. CLI flags (see `codex --help`)
           •  -m, --model <model>          – which OpenAI model to use (default: o4‑mini)
           •  -i, --image <path>           – attach image(s) as input
           •  -v, --view <rollout>         – inspect a past session rollout
           •  -q, --quiet                  – non‑interactive: only final answer
           •  -c, --config                 – open `~/.codex/instructions.md` in your $EDITOR
           •  -a, --approval‑mode <mode>   – one of `suggest` / `auto-edit` / `full-auto`
           •  --auto-edit                  – alias for `--approval-mode=auto-edit`
           •  --full-auto                  – alias for `--approval-mode=full-auto`
           •  --dangerously-auto-approve-everything
                                      – skip ALL confirmations (no sandboxing!)
           •  -w, --writable-root <path>   – extra writable dirs for full‑auto runs
           •  --no-project-doc             – don’t auto‑include your repo’s `codex.md`
           •  --project-doc <file>         – explicitly include that markdown as context
           •  --full-stdout (alias --no-truncate)
                                      – don’t truncate command stdout/stderr
           •  -f, --full-context           – experimental mode: batch edit whole tree
        3. Global config (~/.codex/*.json/.yaml)
           •  `~/.codex/config.json` (or config.yaml/.yml) lets you persist defaults:
              – `model`
              – `approvalMode`
              – `fullAutoErrorMode`
              – `memory` (on/off)
              – `notify` (desktop notifications)
              – `history` settings (maxSize, saveHistory, sensitivePatterns)
           •  `~/.codex/instructions.md` is your default system prompt; `codex --config` edits it
           •  On first run these files/dirs are auto‑created (you can edit them freely)
        4. Environment variables
           •  OPENAI_API_KEY            – your OpenAI key
           •  OPENAI_BASE_URL           – custom endpoint (e.g. for Azure)
           •  OPENAI_TIMEOUT_MS         – request timeout
           •  PRETTY_PRINT=1            – (quiet mode only) enable pretty printing
           •  CODEX_DISABLE_PROJECT_DOC=1
                                   – turn off loading of `codex.md`
           •  DEBUG=1                   – **turn on file‑logging** (see below)
           •  DOTENV_/DOTENV_KEY…       – same as in motdotla/dotenv for encrypted .env.vault
        5. Turning on logging & maximum visibility


            1. ALWAYS set your API key:
                    export OPENAI_API_KEY=sk‑…

            2. Enable the built‑in logger:
                    DEBUG=1 codex <your prompt>
                  This will create a timestamped log in:
                  – Mac/Windows:   $TMPDIR/oai‑codex/codex‑cli‑latest.log
                  – Linux:         ~/.local/oai‑codex/codex‑cli‑latest.log
                  and symlink `codex‑cli‑latest.log` → the most recent session.
                  You can then `tail -F …/codex‑cli‑latest.log` to watch every debug message.

            3. Show un‑truncated stdout/stderr from every command the AI runs:
                    codex --full-stdout <your prompt>

            4. (Optional) if you want NO sandboxing and never to be prompted, add:
                    --dangerously-auto-approve-everything
                     —but be EXTREMELY careful.

    With those settings you’ll see everything the CLI is doing (the entire agent loop, config bootstrap logs, project‑doc
    decisions, memory, history, tool calls, patches, shell commands, stdout/stderr, etc.) in your log file, and you’ll get full   
    untruncated outputs on your terminal.