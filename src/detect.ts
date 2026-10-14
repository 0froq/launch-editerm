import type { BackendKind } from './types.js'

export interface DetectEnv {
  TMUX?: string
  ZELLIJ?: string
  TERM_PROGRAM?: string
  platform?: NodeJS.Platform
}

export function detectBackend(env: DetectEnv = {}): BackendKind {
  const tmux = env.TMUX ?? process.env.TMUX
  const zellij = env.ZELLIJ ?? process.env.ZELLIJ
  const termProgram = env.TERM_PROGRAM ?? process.env.TERM_PROGRAM
  const platform = env.platform ?? process.platform

  if (tmux)
    return 'tmux'
  if (zellij)
    return 'zellij'

  switch (termProgram) {
    case 'kitty':
      return 'kitty'
    case 'WezTerm':
      return 'wezterm'
    case 'ghostty':
      return 'ghostty'
    case 'iTerm.app':
      return 'iterm2'
    case 'Apple_Terminal':
      return 'terminal-app'
    default:
      break
  }

  if (platform === 'darwin')
    return 'terminal-app'

  return 'linux-terminal'
}

export function resolveBackend(requested: BackendKind, env?: DetectEnv): BackendKind {
  if (requested === 'auto')
    return detectBackend(env)
  if (requested === 'direct')
    return 'direct'
  return requested
}
