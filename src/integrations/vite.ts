import type { Plugin } from 'vite'
import type { LaunchEditorTermOptions } from '../types.js'
import { resolveBinPath } from '../bin-path.js'
import { mergeConfig } from '../config/merge.js'

export interface LaunchEditorTermViteOptions extends LaunchEditorTermOptions {}

export function launchEditorTerm(options: LaunchEditorTermViteOptions = {}): Plugin {
  let previousLaunchEditor: string | undefined
  return {
    name: 'launch-editor-term',
    apply: 'serve',
    config() {
      return {}
    },
    configureServer() {
      previousLaunchEditor = process.env.LAUNCH_EDITOR
      const bin = resolveBinPath()
      process.env.LAUNCH_EDITOR = bin
      const merged = mergeConfig({}, options, process.env)
      if (merged.editor)
        process.env.LAUNCH_EDITOR_TERM_EDITOR = merged.editor
      if (merged.target)
        process.env.LAUNCH_EDITOR_TERM_TARGET = merged.target
      if (merged.backend)
        process.env.LAUNCH_EDITOR_TERM_BACKEND = merged.backend
      return () => {
        if (previousLaunchEditor !== undefined)
          process.env.LAUNCH_EDITOR = previousLaunchEditor
        else
          delete process.env.LAUNCH_EDITOR
      }
    },
  }
}

export default launchEditorTerm
