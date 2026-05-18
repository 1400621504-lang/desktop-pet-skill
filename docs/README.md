# Prime Claude Code 宠物材料

这是 Mini Prime 接入 Claude Code 的归档包。

## 内容

- `prime-command/prime.md`
  - `/prime` slash command 的内容
- `hooks/dispatch.sh`
  - 会话事件分发脚本
- `source/`
  - 源码、资源、说明文档
- `source/assets/pet.json`
  - 宠物配置
- `source/assets/spritesheet.webp`
  - 宠物图集
- `source/MiniPrimeFloating.swift`
  - macOS 悬浮窗实现
- `source/hook.js`
  - Claude Code 事件到宠物状态的映射
- `source/README.md`
  - 项目说明
- `source/mini-prime-cinematic-mech-refresh.md`
  - 更细腻机甲轮廓的再生成规格

## 工作方式

1. 在 Claude Code 中输入 `/prime`。
2. 命令会登记当前会话，启动本会话对应的 Mini Prime。
3. hooks 会监听会话状态，把 idle、running、waiting、failed、review 等状态映射到宠物动作。
4. 当前会话结束时，相关窗口会自动退出。

## 最新补充

- 拖动悬浮窗时，窗口代码会根据鼠标移动方向写入 `running-right` 或 `running-left` 状态，松手后回到 `idle`。
- Claude Code hooks 已扩展到 `UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`Notification`、`PermissionRequest`、`Stop`、`SessionEnd`。
- 这让 Claude 思考、调用工具、等待确认、失败和完成时都有更明显的宠物状态变化。
- `claude-mini-prime stop` 现在会清理所有 Mini Prime 会话窗口和会话目录，用来处理 `exit` 没触发 `SessionEnd` 时留下的旧窗口。
- hook 现在会在 session id 不一致时自动回退到最近启用的 `/prime` 会话，避免 Claude 思考事件没有打到宠物窗口。
- 非 idle 状态自动回 idle 的时间从 15 秒延长到 45 秒，思考/工作反馈更明显。
- 悬浮窗新增了类似 Codex 的黑色状态气泡，会显示最近的用户输入和“正在思考 / 正在执行 / 等待确认 / 遇到问题 / 完成检查”等状态。

## 设计要点

- 不是全局自动启动。
- 不是所有终端共享一个宠物。
- 一个 Claude 会话对应一个 Mini Prime 实例。
- 退出 Claude 时清理对应宠物。

## 注意

- 归档包里不包含你的 Claude token。
- 你原来的 `claude` 启动方式已恢复，不会自动拉起宠物。
