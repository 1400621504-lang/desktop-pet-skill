---
name: prime
description: Show Mini Prime, the floating Claude Code companion, for this session
---

# Prime

Start Mini Prime for this Claude Code session only.

Run:

```bash
CLAUDE_SESSION_ID="${CLAUDE_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-default}}" node /Users/apple/Documents/Codex/claude-mini-prime-pet/hook.js start
```

Then tell the user briefly:

Mini Prime is online for this session. It will follow this session's Claude Code state and close when this session exits.
