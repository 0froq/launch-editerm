import type { BackendKind, TargetKind } from '../types.js'

const CAPS: Record<Exclude<BackendKind, 'auto' | 'direct'>, TargetKind[]> = {
  'tmux': ['window', 'tab', 'split-right', 'split-down', 'float'],
  'zellij': ['window', 'tab', 'split-right', 'split-down', 'float'],
  'kitty': ['window', 'tab', 'split-right', 'split-down', 'float'],
  'wezterm': ['window', 'tab', 'split-right', 'split-down'],
  'ghostty': ['window'],
  'iterm2': ['window', 'tab', 'split-right', 'split-down'],
  'terminal-app': ['window'],
  'linux-terminal': ['window'],
  'custom': ['window', 'tab', 'split-right', 'split-down', 'float'],
}

const DEGRADE_ORDER: TargetKind[] = ['float', 'split-down', 'split-right', 'tab', 'window']

export function supportedTargets(backend: BackendKind): TargetKind[] {
  if (backend === 'auto' || backend === 'direct')
    return DEGRADE_ORDER
  return CAPS[backend] ?? ['window']
}

export function degradeTarget(
  backend: BackendKind,
  requested: TargetKind,
  onDegrade?: (from: TargetKind, to: TargetKind) => void,
): TargetKind {
  const supported = new Set(supportedTargets(backend))
  if (supported.has(requested))
    return requested
  for (const t of DEGRADE_ORDER) {
    if (supported.has(t)) {
      onDegrade?.(requested, t)
      return t
    }
  }
  return 'window'
}
