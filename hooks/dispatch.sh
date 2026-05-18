#!/usr/bin/env bash
set -euo pipefail

EVENT="${1:-event}"
ROOT="/Users/apple/Documents/Codex/claude-mini-prime-pet"

if [[ "$EVENT" == "SessionEnd" ]]; then
  exec /usr/bin/env node "$ROOT/hook.js" stop
fi

exec /usr/bin/env node "$ROOT/hook.js"
