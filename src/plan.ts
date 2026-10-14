import type { FilePosition, LaunchPlan, ResolvedConfig } from './types.js'
import { buildBackendCommand } from './backends/build.js'
import { resolveBackend } from './detect.js'
import { buildEditorCommand } from './editors/index.js'
import { logOnce } from './log.js'
import { resolveRemote, shouldUseDirectLaunch } from './remote.js'

export interface PlanContext {
  config: ResolvedConfig
  position: FilePosition
  env?: NodeJS.ProcessEnv
}

export function createLaunchPlan(ctx: PlanContext): LaunchPlan {
  const { config, position } = ctx
  const env = ctx.env ?? process.env
  const backend = resolveBackend(config.backend, {
    TMUX: env.TMUX,
    ZELLIJ: env.ZELLIJ,
    TERM_PROGRAM: env.TERM_PROGRAM,
  })

  const remote = resolveRemote(config.editor, {
    NVIM: env.NVIM,
    nvimSocketPath: config.nvimSocketPath,
  })

  const editorCmd = buildEditorCommand(config.editor, position, {
    editorPath: config.editorPath,
    remoteNvim: remote?.nvim,
    remoteVim: remote?.vim,
  })

  const useDirect = shouldUseDirectLaunch(config.editor, remote, backend)

  if (useDirect && remote) {
    return {
      argv: editorCmd.argv,
      direct: true,
      description: `remote ${config.editor}: ${editorCmd.argv.join(' ')}`,
    }
  }

  const effectiveBackend = useDirect ? 'direct' : backend

  const built = buildBackendCommand({
    backend: effectiveBackend,
    target: config.target,
    editor: editorCmd,
    customBackendArgs: config.customBackendArgs,
    terminalProgram: config.terminalProgram,
    file: position.file,
    line: position.line,
    column: position.column,
    onDegrade: (from, to) => {
      logOnce(`degrade-${effectiveBackend}-${from}-${to}`, `Target "${from}" not supported by ${effectiveBackend}; using "${to}".`)
    },
  })

  return {
    argv: built.argv,
    shell: built.shell,
    direct: effectiveBackend === 'direct',
    description: built.description,
    degradedFrom: built.degradedFrom,
  }
}
