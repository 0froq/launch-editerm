import type { BackendKind, EditorKind, LaunchEditorTermOptions, ResolvedConfig, TargetKind } from '../types.js'

const EDITORS: EditorKind[] = ['nvim', 'vim', 'helix', 'emacs']
const TARGETS: TargetKind[] = ['window', 'tab', 'split-right', 'split-down', 'float']
const BACKENDS: BackendKind[] = [
  'auto',
  'tmux',
  'zellij',
  'kitty',
  'wezterm',
  'ghostty',
  'iterm2',
  'terminal-app',
  'linux-terminal',
  'custom',
  'direct',
]

function parseEditor(v: unknown): EditorKind | undefined {
  if (typeof v !== 'string')
    return undefined
  return EDITORS.includes(v as EditorKind) ? v as EditorKind : undefined
}

function parseTarget(v: unknown): TargetKind | undefined {
  if (typeof v !== 'string')
    return undefined
  return TARGETS.includes(v as TargetKind) ? v as TargetKind : undefined
}

function parseBackend(v: unknown): BackendKind | undefined {
  if (typeof v !== 'string')
    return undefined
  return BACKENDS.includes(v as BackendKind) ? v as BackendKind : undefined
}

export interface TomlConfigShape {
  editor?: string
  target?: string
  backend?: string
  nvim_socket_path?: string
  editor_path?: string
  terminal_program?: string
  custom_backend_args?: string[]
}

export function mergeConfig(
  toml: TomlConfigShape,
  inline: LaunchEditorTermOptions | undefined,
  env: NodeJS.ProcessEnv,
): Omit<ResolvedConfig, 'dryRun'> {
  let editor = parseEditor(toml.editor) ?? 'nvim'
  let target = parseTarget(toml.target) ?? 'window'
  let backend = parseBackend(toml.backend) ?? 'auto'
  let nvimSocketPath = toml.nvim_socket_path
  let editorPath = toml.editor_path
  let terminalProgram = toml.terminal_program
  let customBackendArgs = toml.custom_backend_args

  if (inline?.editor)
    editor = inline.editor
  if (inline?.target)
    target = inline.target
  if (inline?.backend)
    backend = inline.backend
  if (inline?.nvimSocketPath)
    nvimSocketPath = inline.nvimSocketPath
  if (inline?.editorPath)
    editorPath = inline.editorPath
  if (inline?.terminalProgram)
    terminalProgram = inline.terminalProgram
  if (inline?.customBackendArgs)
    customBackendArgs = inline.customBackendArgs

  if (env.LAUNCH_EDITOR_TERM_EDITOR) {
    const e = parseEditor(env.LAUNCH_EDITOR_TERM_EDITOR)
    if (e)
      editor = e
  }
  if (env.LAUNCH_EDITOR_TERM_TARGET) {
    const t = parseTarget(env.LAUNCH_EDITOR_TERM_TARGET)
    if (t)
      target = t
  }
  if (env.LAUNCH_EDITOR_TERM_BACKEND) {
    const b = parseBackend(env.LAUNCH_EDITOR_TERM_BACKEND)
    if (b)
      backend = b
  }
  if (env.LAUNCH_EDITOR_TERM_NVIM_SOCKET)
    nvimSocketPath = env.LAUNCH_EDITOR_TERM_NVIM_SOCKET
  if (env.LAUNCH_EDITOR_TERM_EDITOR_PATH)
    editorPath = env.LAUNCH_EDITOR_TERM_EDITOR_PATH
  if (env.LAUNCH_EDITOR_TERM_TERMINAL)
    terminalProgram = env.LAUNCH_EDITOR_TERM_TERMINAL
  if (env.LAUNCH_EDITOR_TERM_CUSTOM_BACKEND_ARGS)
    customBackendArgs = env.LAUNCH_EDITOR_TERM_CUSTOM_BACKEND_ARGS.split(/\s+/).filter(Boolean)

  return {
    editor,
    target,
    backend,
    nvimSocketPath,
    editorPath,
    terminalProgram,
    customBackendArgs,
  }
}
