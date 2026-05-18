#!/usr/bin/env node
const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const port = Number(process.env.MINI_PRIME_PORT || 43187);
const root = __dirname;

function safeId(value) {
  return String(value || "default").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function readStdin() {
  return new Promise((resolve) => {
    let body = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (body += chunk));
    process.stdin.on("end", () => resolve(body));
  });
}

function classify(event) {
  const hookEvent = event.hook_event_name || event.hookEventName || event.event || "";
  const tool = event.tool_name || event.toolName || event.tool?.name || "";
  const lower = JSON.stringify(event).toLowerCase();

  if (hookEvent === "SessionStart") {
    return { state: "waving", label: "Hello", detail: "Claude Code session started." };
  }
  if (hookEvent === "UserPromptSubmit") {
    return { state: "running", label: "Thinking", statusText: "正在思考", detail: "Claude is working on your request." };
  }
  if (hookEvent === "PreToolUse") {
    const name = tool || "tool";
    return { state: "running", label: `Using ${name}`, statusText: "正在执行", detail: "A tool call is in progress." };
  }
  if (hookEvent === "PostToolUse") {
    return { state: "review", label: "Checking", statusText: "完成检查", detail: "Tool call finished." };
  }
  if (hookEvent === "PostToolUseFailure" || hookEvent === "StopFailure") {
    return { state: "failed", label: "Needs attention", statusText: "遇到问题", detail: "Claude hit an error or blocked step." };
  }
  if (hookEvent === "PermissionRequest" || hookEvent === "Notification" || lower.includes("permission")) {
    return { state: "waiting", label: "Waiting", statusText: "等待确认", detail: "Claude Code is waiting for your input." };
  }
  if (hookEvent === "Stop" || hookEvent === "SessionEnd" || hookEvent === "TaskCompleted") {
    return { state: "review", label: "Done", detail: "Claude finished the current turn." };
  }

  return { state: "running", label: hookEvent || "Claude", detail: tool ? `Event from ${tool}.` : "Claude Code event received." };
}

function extractUserText(event) {
  const candidates = [
    event.prompt,
    event.message,
    event.user_prompt,
    event.userPrompt,
    event.input,
    event.text,
    event.transcript,
    event.tool_input?.prompt,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 80);
  }
  return "";
}

function getSessionId(event) {
  return safeId(
    process.env.CLAUDE_SESSION_ID ||
      process.env.CLAUDE_CODE_SESSION_ID ||
      event.session_id ||
      event.sessionId ||
      event.conversation_id ||
      event.cwd ||
      "default"
  );
}

function sessionsRoot() {
  return path.join(root, "sessions");
}

function sessionDir(sessionId) {
  return path.join(sessionsRoot(), sessionId);
}

function isEnabled(sessionId) {
  return fs.existsSync(path.join(sessionDir(sessionId), "enabled"));
}

function findFallbackSession(sessionId) {
  if (isEnabled(sessionId)) return sessionId;

  const rootDir = sessionsRoot();
  if (!fs.existsSync(rootDir)) return sessionId;

  const candidates = fs
    .readdirSync(rootDir)
    .map((name) => {
      const enabledPath = path.join(rootDir, name, "enabled");
      let mtime = 0;
      try {
        mtime = fs.statSync(enabledPath).mtimeMs;
      } catch {}
      return { name, mtime };
    })
    .filter((item) => item.mtime > 0)
    .sort((a, b) => b.mtime - a.mtime);

  if (candidates.length === 1) return candidates[0].name;
  return sessionId;
}

function ensurePet(sessionId) {
  const dir = sessionDir(sessionId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "enabled"), String(Date.now()));

  const pidPath = path.join(dir, "pid");
  const oldPid = fs.existsSync(pidPath) ? Number(fs.readFileSync(pidPath, "utf8")) : 0;
  if (oldPid) {
    try {
      process.kill(oldPid, 0);
      return;
    } catch {}
  }

  const child = spawn("/usr/bin/swift", [path.join(root, "MiniPrimeFloating.swift"), sessionId], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  fs.writeFileSync(pidPath, String(child.pid));
}

function stopPet(sessionId) {
  const dir = sessionDir(sessionId);
  const pidPath = path.join(dir, "pid");
  if (fs.existsSync(pidPath)) {
    const pid = Number(fs.readFileSync(pidPath, "utf8"));
    if (pid) {
      try {
        process.kill(pid);
      } catch {}
    }
  }
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function stopAllPets() {
  const sessionsRoot = path.join(root, "sessions");
  if (fs.existsSync(sessionsRoot)) {
    for (const name of fs.readdirSync(sessionsRoot)) {
      stopPet(name);
    }
  }
  for (const pattern of ["MiniPrimeFloating.swift", "swift.*MiniPrimeFloating.swift", "MiniPrimeFloating"]) {
    spawn("/usr/bin/pkill", ["-f", pattern], { stdio: "ignore" }).unref();
  }
}

function postState(payload) {
  const sessionId = payload.sessionId || "default";
  const statePath = path.join(sessionDir(sessionId), "state.json");
  try {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    const current = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : {};
    fs.writeFileSync(statePath, JSON.stringify({ ...current, ...payload }, null, 2));
  } catch {}

  const data = JSON.stringify(payload);
  const req = http.request(
    {
      hostname: "127.0.0.1",
      port,
      path: "/api/state",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(data),
      },
      timeout: 400,
    },
    (res) => res.resume()
  );
  req.on("error", () => {});
  req.end(data);
}

(async () => {
  const raw = await readStdin();
  let event = {};
  try {
    event = raw ? JSON.parse(raw) : {};
  } catch {
    event = { raw };
  }

  const sessionId = getSessionId(event);
  const mode = process.argv[2] || "";

  if (mode === "stop-all") {
    stopAllPets();
    return;
  }

  if (mode === "start") {
    ensurePet(sessionId);
  }

  const activeSessionId = findFallbackSession(sessionId);

  if (!isEnabled(activeSessionId)) {
    return;
  }

  if (mode === "stop" || event.hook_event_name === "SessionEnd" || event.hookEventName === "SessionEnd") {
    stopPet(activeSessionId);
    return;
  }

  const patch = {
    ...classify(event),
    sessionId: activeSessionId,
    message: extractUserText(event),
    event: event.hook_event_name || event.hookEventName || event.event || "unknown",
    tool: event.tool_name || event.toolName || event.tool?.name || "",
    updatedAt: new Date().toISOString(),
  };

  const logPath = process.env.MINI_PRIME_HOOK_LOG;
  if (logPath) {
    fs.appendFileSync(logPath, JSON.stringify({ event, patch }) + "\n");
  }

  postState(patch);
})();
