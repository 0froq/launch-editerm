import type { EditorKind, FilePosition } from '../types.js'

export interface EditorCommand {
  argv: string[]
  /** Joined shell command for backends that need a single string */
  shellCommand: string
}

function defaultBin(kind: EditorKind, override?: string): string {
  if (override)
    return override
  switch (kind) {
    case 'nvim':
      return 'nvim'
    case 'vim':
      return 'vim'
    case 'helix':
      return 'hx'
    case 'emacs':
      return 'emacsclient'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function shellQuote(arg: string): string {
  if (/^[\w./:@+-]+$/.test(arg))
    return arg
  return `'${arg.replace(/'/g, `'\\''`)}'`
}

export function buildEditorCommand(
  kind: EditorKind,
  pos: FilePosition,
  opts: { editorPath?: string, remoteNvim?: { server: string }, remoteVim?: { servername: string } },
): EditorCommand {
  const bin = defaultBin(kind, opts.editorPath)
  const { file, line, column } = pos

  switch (kind) {
    case 'nvim': {
      if (opts.remoteNvim) {
        const argv = [bin, '--server', opts.remoteNvim.server, '--remote', file]
        if (line > 0)
          argv.push(`+${line}`)
        return { argv, shellCommand: argv.map(shellQuote).join(' ') }
      }
      const argv = [bin]
      if (line > 0)
        argv.push(`+${line}`)
      argv.push(file)
      if (column > 0 && line > 0)
        argv[argv.length - 1] = file // nvim uses +line only in CLI typically
      return { argv, shellCommand: argv.map(shellQuote).join(' ') }
    }
    case 'vim': {
      if (opts.remoteVim) {
        const argv = [bin, '--servername', opts.remoteVim.servername, '--remote', `+${line} ${file}`]
        return { argv, shellCommand: argv.map(shellQuote).join(' ') }
      }
      const argv = [bin]
      if (line > 0)
        argv.push(`+${line}`)
      argv.push(file)
      return { argv, shellCommand: argv.map(shellQuote).join(' ') }
    }
    case 'helix': {
      const argv = [bin, `${file}:${line}:${column}`]
      return { argv, shellCommand: argv.map(shellQuote).join(' ') }
    }
    case 'emacs': {
      const argv = [bin, '-n', `+${line}:${column}`, file]
      return { argv, shellCommand: argv.map(shellQuote).join(' ') }
    }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}
