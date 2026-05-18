# Mini Prime for Claude Code

这是一个接近 Codex 当前宠物形态的 Mini Prime 桌面悬浮宠物，用 Claude Code hooks 驱动宠物动作。窗口透明、无边框、置顶，不显示面板式 UI。

## 使用

```bash
/Users/apple/Documents/Codex/claude-mini-prime-pet/bin/claude-mini-prime
```

停止悬浮宠物：

```bash
/Users/apple/Documents/Codex/claude-mini-prime-pet/bin/claude-mini-prime stop
```

也可以把参数继续传给 Claude Code：

```bash
/Users/apple/Documents/Codex/claude-mini-prime-pet/bin/claude-mini-prime --continue
```

## 行为映射

- `SessionStart` -> `waving`
- `UserPromptSubmit` -> `running`
- `PreToolUse` -> `running`
- `PostToolUse` -> `review`
- `Notification` / `PermissionRequest` -> `waiting`
- `PostToolUseFailure` / `StopFailure` -> `failed`
- `Stop` -> `review`
- 长时间没有事件 -> `idle`

## 操作

- 按住窗口可拖动。
- `Esc` 或 `Cmd+W` 可关闭悬浮窗。
- 每次用启动脚本打开时，会先清掉旧的 Mini Prime 悬浮窗，避免关不掉或重复打开。

## 文件

- `floating.html`：透明悬浮宠物界面。
- `MiniPrimeFloating.swift`：macOS 原生透明置顶窗口。
- `hook.js`：Claude Code hook 事件转状态。
- `claude-settings.json`：只给本入口使用的 Claude Code hook 配置。
- `assets/pet.json`、`assets/spritesheet.webp`：Mini Prime 资源。
- 悬浮窗已经收紧成更像 Codex 的紧凑气泡布局，而不是大输入框。

这个方案不会修改你的全局 `~/.claude/settings.json`。
