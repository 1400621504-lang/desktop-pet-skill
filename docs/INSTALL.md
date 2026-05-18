# 安装说明

## 1. 放置 slash command

```bash
mkdir -p ~/.claude/commands
cp prime-command/prime.md ~/.claude/commands/prime.md
```

## 2. 放置 hook

```bash
mkdir -p ~/.claude/hooks/mini-prime
cp hooks/dispatch.sh ~/.claude/hooks/mini-prime/dispatch.sh
chmod +x ~/.claude/hooks/mini-prime/dispatch.sh
```

## 3. 放置源码

默认源码路径是：

```text
/Users/apple/Documents/Codex/claude-mini-prime-pet
```

如果移动到其他路径，需要同步修改：

- `prime-command/prime.md`
- `hooks/dispatch.sh`
- `source/hook.js`
- `source/MiniPrimeFloating.swift`

## 4. 合并 hooks 配置

把 `docs/settings-hooks-snippet.json` 中的 `hooks` 合并到：

```text
~/.claude/settings.json
```

不要覆盖原有 `env`、`enabledPlugins`、`theme` 等配置。

## 5. 使用

进入 Claude Code 后输入：

```text
/prime
```

该会话会出现 Mini Prime。退出当前 Claude 会话时，对应宠物会自动退出。
