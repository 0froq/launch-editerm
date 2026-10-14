import type { LaunchEditorTermOptions, ResolvedConfig } from '../types.js'
import type { TomlConfigShape } from './merge.js'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { parse } from 'smol-toml'
import { mergeConfig } from './merge.js'
import { configFilePath } from './paths.js'

export async function loadResolvedConfig(
  inline?: LaunchEditorTermOptions,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Omit<ResolvedConfig, 'dryRun'>> {
  let toml: TomlConfigShape = {}
  const path = configFilePath()
  try {
    const raw = await readFile(path, 'utf8')
    toml = parse(raw) as TomlConfigShape
  }
  catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT')
      console.warn(`[launch-editor-term] Could not read ${path}:`, err)
  }
  return mergeConfig(toml, inline, env)
}

export function loadResolvedConfigSync(
  inline?: LaunchEditorTermOptions,
  env: NodeJS.ProcessEnv = process.env,
): Omit<ResolvedConfig, 'dryRun'> {
  // Used in tests and vite/nuxt setup without async
  let toml: TomlConfigShape = {}
  const path = configFilePath()
  try {
    const raw = readFileSync(path, 'utf8')
    toml = parse(raw) as TomlConfigShape
  }
  catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT')
      console.warn(`[launch-editor-term] Could not read ${path}:`, err)
  }
  return mergeConfig(toml, inline, env)
}
