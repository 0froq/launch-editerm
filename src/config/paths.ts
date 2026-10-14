import { homedir } from 'node:os'
import { join } from 'node:path'

export function configFilePath(): string {
  const xdg = process.env.XDG_CONFIG_HOME
  if (xdg)
    return join(xdg, 'launch-editor-term', 'config.toml')
  return join(homedir(), '.config', 'launch-editor-term', 'config.toml')
}
