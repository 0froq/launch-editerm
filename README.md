# launch-editor-term

> **Repo:** [github.com/0froq/launch-editor-term](https://github.com/0froq/launch-editor-term) — if the URL 404s, rename `launch-editerm` → `launch-editor-term` in GitHub **Settings → General** (GitHub redirects the old name after rename).

Open files from frontend devtools ([`launch-editor`](https://github.com/vitejs/launch-editor), used by Vite, Nuxt DevTools, Vue DevTools) in a **terminal editor** without stealing the dev server's TTY.

`launch-editor` runs `LAUNCH_EDITOR` as:

```text
<cmd> <file> <line> <column>
```

By default that often means `vim` with `stdio: 'inherit'` inside the dev server process — which breaks terminal state ([vitejs/launch-editor#39](https://github.com/vitejs/launch-editor/issues/39), [#49](https://github.com/vitejs/launch-editor/issues/49)). **launch-editor-term** spawns the editor in a separate terminal surface (tmux pane, new Kitty tab, macOS Terminal window, etc.) or forwards to an existing Neovim/Vim server.

> **Prototype notice:** Logic is covered by unit tests on Linux CI. This has **not** been exercised on a real macOS machine yet (iTerm2 / Terminal.app / Ghostty paths are best-effort).

## Quick start (global)

```bash
pnpm add -g launch-editor-term   # or npm i -g (not published yet — install from git)
export LAUNCH_EDITOR=launch-editor-term
pnpm dev
```

Optional config file: `~/.config/launch-editor-term/config.toml` (or `$XDG_CONFIG_HOME/launch-editor-term/config.toml`):

```toml
editor = "nvim"
target = "split-right"
backend = "auto"
```

Environment overrides (highest precedence): `LAUNCH_EDITOR_TERM_EDITOR`, `LAUNCH_EDITOR_TERM_TARGET`, `LAUNCH_EDITOR_TERM_BACKEND`, `LAUNCH_EDITOR_TERM_NVIM_SOCKET`, `LAUNCH_EDITOR_TERM_EDITOR_PATH`, `LAUNCH_EDITOR_TERM_TERMINAL`, `LAUNCH_EDITOR_TERM_CUSTOM_BACKEND_ARGS`.

## nvim + tmux (recommended on macOS/Linux)

Inside tmux, `backend = "auto"` picks tmux automatically.

```toml
editor = "nvim"
target = "window"        # tmux new-window
backend = "auto"
```

Or a right split:

```toml
target = "split-right"
```

If `$NVIM` points at a running Neovim, the tool **forwards remotely** and skips opening a new tmux pane.

```bash
launch-editor-term --dry-run /path/to/file.ts 42 3
```

## nvim + Zellij (floating pane)

```toml
editor = "nvim"
target = "float"
backend = "zellij"
```

Custom popup via template:

```toml
backend = "custom"
custom_backend_args = ["zellij", "run", "--floating", "--", "sh", "-lc", "{cmd}"]
```

## Ghostty

On Linux (GTK), uses `ghostty +new-window --command …` when available ([Ghostty 1.2+](https://ghostty.org/docs/install/release-notes/1-2-0)). Only `window` target is supported; other targets degrade to `window`.

On macOS, degrades to:

```text
open -na Ghostty.app --args -e sh -lc '<editor cmd>'
```

(`+new-window` IPC is not relied on for macOS in this prototype.)

## Kitty

```toml
backend = "kitty"
target = "tab"   # kitten @ launch --type=tab
```

Requires Kitty's remote control (`kitty @`).

## Terminal.app (macOS fallback)

When not inside tmux/Zellij and `TERM_PROGRAM` is unknown on macOS, `backend = "auto"` selects Terminal.app via AppleScript `do script`.

## Vite plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import launchEditorTerm from 'launch-editor-term/vite'

export default defineConfig({
  plugins: [
    launchEditorTerm({
      editor: 'nvim',
      target: 'split-right',
      backend: 'auto',
    }),
  ],
})
```

Sets `process.env.LAUNCH_EDITOR` to this package's CLI **only during `vite dev`**.

## Nuxt module

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['launch-editor-term/nuxt'],
  launchEditorTerm: {
    editor: 'nvim',
    target: 'window',
  },
})
```

Dev-only; does nothing in production build.

## Design

Three layers:

1. **Editor** — builds `nvim` / `vim` / `helix` / `emacsclient` argv (remote Neovim/Vim when reachable).
2. **Target** — `window` | `tab` | `split-right` | `split-down` | `float`.
3. **Backend** — who runs the editor command: `tmux`, `zellij`, `kitty`, `wezterm`, `ghostty`, `iterm2`, `terminal-app`, `linux-terminal`, or `custom` template with `{cmd}`, `{file}`, `{line}`, `{col}`.

**Detection order** (`backend = "auto"`): `$TMUX` → `$ZELLIJ` → `$TERM_PROGRAM` (kitty, WezTerm, ghostty, iTerm.app, Apple_Terminal) → macOS Terminal.app → Linux `$TERMINAL` / `x-terminal-emulator`.

Unsupported target/backend pairs **degrade** once (logged to stderr).

Execution always uses `spawn({ detached: true, stdio: 'ignore' })` — never the dev server TTY.

### Future: `onClose`

`src/execute.ts` exports a documented `onClose` hook (not wired). Intended for a future “focus browser” flow.

## Development

```bash
pnpm install
pnpm test
pnpm run build
```

## License

MIT © froQ
