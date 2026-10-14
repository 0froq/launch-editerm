import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function resolveBinPath(): string {
  const here = dirname(fileURLToPath(import.meta.url))
  return join(here, 'cli.js')
}
