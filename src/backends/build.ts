import type { EditorCommand } from '../editors/index.js'
import type { BackendKind, TargetKind } from '../types.js'
import { degradeTarget } from './capabilities.js'

export interface BackendBuildOptions {
  backend: BackendKind
  target: TargetKind
  editor: EditorCommand
  customBackendArgs?: string[]
  terminalProgram?: string
  onDegrade?: (from: TargetKind, to: TargetKind) => void
}

function applyTemplate(args: string[], editor: EditorCommand, file: string, line: number, col: number): string[] {
  return args.map(part =>
    part
      .replaceAll('{cmd}', editor.shellCommand)
      .replaceAll('{file}', file)
      .replaceAll('{line}', String(line))
      .replaceAll('{col}', String(col)),
  )
}

export function buildBackendCommand(
  opts: BackendBuildOptions & { file: string, line: number, column: number },
): { argv: string[], shell?: boolean, description: string, degradedFrom?: TargetKind } {
  const target = degradeTarget(opts.backend, opts.target, opts.onDegrade)
  const degradedFrom = target !== opts.target ? opts.target : undefined
  const cmd = opts.editor.shellCommand
  const { file, line, column } = opts

  switch (opts.backend) {
    case 'direct':
      return {
        argv: opts.editor.argv,
        description: `direct: ${opts.editor.argv.join(' ')}`,
        degradedFrom,
      }
    case 'tmux':
      return buildTmux(target, cmd, degradedFrom)
    case 'zellij':
      return buildZellij(target, cmd, degradedFrom)
    case 'kitty':
      return buildKitty(target, cmd, degradedFrom)
    case 'wezterm':
      return buildWezterm(target, cmd, degradedFrom)
    case 'ghostty':
      return buildGhostty(cmd, degradedFrom, opts.target)
    case 'iterm2':
      return buildITerm2(target, cmd, degradedFrom)
    case 'terminal-app':
      return buildTerminalApp(cmd, degradedFrom)
    case 'linux-terminal':
      return buildLinuxTerminal(cmd, opts.terminalProgram, degradedFrom)
    case 'custom': {
      const args = applyTemplate(
        opts.customBackendArgs ?? ['tmux', 'new-window', '-n', 'edit', '{cmd}'],
        opts.editor,
        file,
        line,
        column,
      )
      return { argv: args, description: `custom: ${args.join(' ')}`, degradedFrom }
    }
    default:
      return buildTmux('window', cmd, degradedFrom)
  }
}

function buildTmux(target: TargetKind, cmd: string, degradedFrom?: TargetKind) {
  switch (target) {
    case 'float':
      return {
        argv: ['tmux', 'display-popup', '-E', cmd],
        description: `tmux float: ${cmd}`,
        degradedFrom,
      }
    case 'split-right':
      return {
        argv: ['tmux', 'split-window', '-h', cmd],
        description: `tmux split-right: ${cmd}`,
        degradedFrom,
      }
    case 'split-down':
      return {
        argv: ['tmux', 'split-window', '-v', cmd],
        description: `tmux split-down: ${cmd}`,
        degradedFrom,
      }
    case 'tab':
    case 'window':
    default:
      return {
        argv: ['tmux', 'new-window', '-n', 'edit', cmd],
        description: `tmux window: ${cmd}`,
        degradedFrom,
      }
  }
}

function buildZellij(target: TargetKind, cmd: string, degradedFrom?: TargetKind) {
  const base = ['zellij', 'run']
  if (target === 'float')
    base.push('--floating')
  if (target === 'split-right')
    base.push('--direction', 'right')
  if (target === 'split-down')
    base.push('--direction', 'down')
  base.push('--', 'sh', '-lc', cmd)
  return { argv: base, description: `zellij ${target}: ${cmd}`, degradedFrom }
}

function buildKitty(target: TargetKind, cmd: string, degradedFrom?: TargetKind) {
  switch (target) {
    case 'tab':
      return {
        argv: ['kitty', '@', 'launch', '--type=tab', '--', 'sh', '-lc', cmd],
        description: `kitty tab: ${cmd}`,
        degradedFrom,
      }
    case 'split-right':
      return {
        argv: ['kitty', '@', 'launch', '--location=hsplit', '--', 'sh', '-lc', cmd],
        description: `kitty split-right: ${cmd}`,
        degradedFrom,
      }
    case 'split-down':
      return {
        argv: ['kitty', '@', 'launch', '--location=vsplit', '--', 'sh', '-lc', cmd],
        description: `kitty split-down: ${cmd}`,
        degradedFrom,
      }
    case 'float':
      return {
        argv: ['kitty', '@', 'launch', '--type=overlay', '--', 'sh', '-lc', cmd],
        description: `kitty float: ${cmd}`,
        degradedFrom,
      }
    case 'window':
    default:
      return {
        argv: ['kitty', '@', 'launch', '--type=os-window', '--', 'sh', '-lc', cmd],
        description: `kitty window: ${cmd}`,
        degradedFrom,
      }
  }
}

function buildWezterm(target: TargetKind, cmd: string, degradedFrom?: TargetKind) {
  switch (target) {
    case 'tab':
      return {
        argv: ['wezterm', 'cli', 'spawn', '--new-tab', '--', 'sh', '-lc', cmd],
        description: `wezterm tab: ${cmd}`,
        degradedFrom,
      }
    case 'split-right':
      return {
        argv: ['wezterm', 'cli', 'spawn', '--pane-direction', 'Right', '--', 'sh', '-lc', cmd],
        description: `wezterm split-right: ${cmd}`,
        degradedFrom,
      }
    case 'split-down':
      return {
        argv: ['wezterm', 'cli', 'spawn', '--pane-direction', 'Bottom', '--', 'sh', '-lc', cmd],
        description: `wezterm split-down: ${cmd}`,
        degradedFrom,
      }
    case 'window':
    default:
      return {
        argv: ['wezterm', 'cli', 'spawn', '--new-window', '--', 'sh', '-lc', cmd],
        description: `wezterm window: ${cmd}`,
        degradedFrom,
      }
  }
}

function buildGhostty(cmd: string, degradedFrom?: TargetKind, requested?: TargetKind) {
  if (process.platform === 'darwin') {
    return {
      argv: ['open', '-na', 'Ghostty.app', '--args', '-e', 'sh', '-lc', cmd],
      shell: false,
      description: `ghostty macOS window: ${cmd}`,
      degradedFrom: degradedFrom ?? (requested !== 'window' ? requested : undefined),
    }
  }
  return {
    argv: ['ghostty', '+new-window', '--command', cmd],
    description: `ghostty +new-window: ${cmd}`,
    degradedFrom,
  }
}

function buildITerm2(target: TargetKind, cmd: string, degradedFrom?: TargetKind) {
  const script = target === 'split-right' || target === 'split-down'
    ? `tell application "iTerm2" to tell current window to create tab with default profile command "${cmd.replace(/"/g, '\\"')}"`
    : `tell application "iTerm2" to create window with default profile command "${cmd.replace(/"/g, '\\"')}"`
  return {
    argv: ['osascript', '-e', script],
    description: `iterm2 ${target}: ${cmd}`,
    degradedFrom,
  }
}

function buildTerminalApp(cmd: string, degradedFrom?: TargetKind) {
  const escaped = cmd.replace(/"/g, '\\"')
  return {
    argv: ['osascript', '-e', `tell application "Terminal" to do script "${escaped}"`],
    description: `Terminal.app: ${cmd}`,
    degradedFrom,
  }
}

function buildLinuxTerminal(cmd: string, terminalProgram?: string, degradedFrom?: TargetKind) {
  const term = terminalProgram ?? process.env.TERMINAL ?? 'x-terminal-emulator'
  return {
    argv: [term, '-e', 'sh', '-lc', cmd],
    description: `${term}: ${cmd}`,
    degradedFrom,
  }
}
