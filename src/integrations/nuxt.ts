import type { LaunchEditorTermOptions } from '../types.js'
import { defineNuxtModule } from '@nuxt/kit'
import { resolveBinPath } from '../bin-path.js'
import { mergeConfig } from '../config/merge.js'

export interface LaunchEditorTermNuxtOptions extends LaunchEditorTermOptions {}

export default defineNuxtModule<LaunchEditorTermNuxtOptions>({
  meta: {
    name: 'launch-editor-term',
    configKey: 'launchEditorTerm',
  },
  defaults: {},
  setup(options: LaunchEditorTermNuxtOptions, nuxt: { options: { dev: boolean }, hook: (name: string, fn: () => void) => void }) {
    if (!nuxt.options.dev)
      return

    const bin = resolveBinPath()
    nuxt.hook('ready', () => {
      process.env.LAUNCH_EDITOR = bin
      const merged = mergeConfig({}, options, process.env)
      if (merged.editor)
        process.env.LAUNCH_EDITOR_TERM_EDITOR = merged.editor
      if (merged.target)
        process.env.LAUNCH_EDITOR_TERM_TARGET = merged.target
      if (merged.backend)
        process.env.LAUNCH_EDITOR_TERM_BACKEND = merged.backend
    })
  },
})
