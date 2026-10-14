export type EditorKind = 'nvim' | 'vim' | 'helix' | 'emacs'

export type TargetKind = 'window' | 'tab' | 'split-right' | 'split-down' | 'float'

export type BackendKind
  = | 'auto'
    | 'tmux'
    | 'zellij'
    | 'kitty'
    | 'wezterm'
    | 'ghostty'
    | 'iterm2'
    | 'terminal-app'
    | 'linux-terminal'
    | 'custom'
    | 'direct'

export interface FilePosition {
  file: string
  line: number
  column: number
}

export interface ResolvedConfig {
  editor: EditorKind
  target: TargetKind
  backend: BackendKind
  /** When backend is custom: argv template with {cmd},{file},{line},{col} */
  customBackendArgs?: string[]
  nvimSocketPath?: string
  editorPath?: string
  terminalProgram?: string
  dryRun: boolean
}

export interface LaunchPlan {
  /** argv for spawn (no shell) or single shell string when shell is true */
  argv: string[]
  shell?: boolean
  /** Skip backend wrapper; editor runs detached */
  direct: boolean
  /** Human-readable description for dry-run */
  description: string
  degradedFrom?: TargetKind
}

/**
 * Future hook: called when the editor session ends (not implemented).
 * @see README — "onClose hook"
 */
export type OnCloseHook = (ctx: { file: string, line: number, column: number }) => void | Promise<void>

export interface LaunchEditermOptions {
  editor?: EditorKind
  target?: TargetKind
  backend?: BackendKind
  customBackendArgs?: string[]
  nvimSocketPath?: string
  editorPath?: string
  terminalProgram?: string
}
