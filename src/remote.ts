import type { EditorKind } from './types.js'

export interface RemoteContext {
  nvim?: { server: string }
  vim?: { servername: string }
}

export interface RemoteDetectEnv {
  NVIM?: string
  nvimSocketPath?: string
  /** Test hook: pretend sockets exist */
  discoveredNvimSockets?: string[]
}

export function discoverNvimSockets(): string[] {
  // Prototype: common paths; real Mac/Linux discovery is best-effort
  const fromEnv = process.env.NVIM
  if (fromEnv)
    return [fromEnv]
  return []
}

export function resolveRemote(
  editor: EditorKind,
  env: RemoteDetectEnv = {},
): RemoteContext | undefined {
  if (editor === 'nvim') {
    const server = env.NVIM ?? process.env.NVIM ?? env.nvimSocketPath
    if (server)
      return { nvim: { server } }
    const discovered = env.discoveredNvimSockets ?? discoverNvimSockets()
    if (discovered.length > 0)
      return { nvim: { server: discovered[0] } }
    return undefined
  }
  if (editor === 'vim') {
    const sn = process.env.VIM_SERVERNAME
    if (sn)
      return { vim: { servername: sn } }
    return undefined
  }
  return undefined
}

export function shouldUseDirectLaunch(
  editor: EditorKind,
  remote: RemoteContext | undefined,
  backend: string,
): boolean {
  if (!remote)
    return false
  if (editor === 'nvim' && remote.nvim)
    return true
  if (editor === 'vim' && remote.vim)
    return true
  // Still may focus pane via backend when not in remote-only mode
  if (backend === 'direct')
    return true
  return false
}
