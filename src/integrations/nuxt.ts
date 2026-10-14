import type { LaunchEditermOptions } from '../types.js'
import { defineNuxtModule } from '@nuxt/kit'
import { resolveBinPath } from '../bin-path.js'
import { mergeConfig } from '../config/merge.js'

export interface LaunchEditermNuxtOptions extends LaunchEditermOptions {}

export default defineNuxtModule<LaunchEditermNuxtOptions>({
  meta: {
    name: 'launch-editerm',
    configKey: 'launchEditerm',
  },
  defaults: {},
  setup(options: LaunchEditermNuxtOptions, nuxt: { options: { dev: boolean }, hook: (name: string, fn: () => void) => void }) {
    if (!nuxt.options.dev)
      return

    const bin = resolveBinPath()
    nuxt.hook('ready', () => {
      process.env.LAUNCH_EDITOR = bin
      const merged = mergeConfig({}, options, process.env)
      if (merged.editor)
        process.env.EDITERM_EDITOR = merged.editor
      if (merged.target)
        process.env.EDITERM_TARGET = merged.target
      if (merged.backend)
        process.env.EDITERM_BACKEND = merged.backend
    })
  },
})
