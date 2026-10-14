import type { Plugin } from 'vite'
import type { LaunchEditermOptions } from '../types.js'
import { resolveBinPath } from '../bin-path.js'
import { mergeConfig } from '../config/merge.js'

export interface LaunchEditermViteOptions extends LaunchEditermOptions {}

export function launchEditerm(options: LaunchEditermViteOptions = {}): Plugin {
  let previousLaunchEditor: string | undefined
  return {
    name: 'launch-editerm',
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
        process.env.EDITERM_EDITOR = merged.editor
      if (merged.target)
        process.env.EDITERM_TARGET = merged.target
      if (merged.backend)
        process.env.EDITERM_BACKEND = merged.backend
      return () => {
        if (previousLaunchEditor !== undefined)
          process.env.LAUNCH_EDITOR = previousLaunchEditor
        else
          delete process.env.LAUNCH_EDITOR
      }
    },
  }
}

export default launchEditerm
