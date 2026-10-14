import type { BackendKind, TargetKind } from '../src/types.js'
import { describe, expect, it } from 'vitest'
import { buildBackendCommand } from '../src/backends/build.js'
import { buildEditorCommand } from '../src/editors/index.js'

const pos = { file: '/x.ts', line: 5, column: 1 }
const editor = buildEditorCommand('nvim', pos, {})

const backends: BackendKind[] = [
  'tmux',
  'zellij',
  'kitty',
  'wezterm',
  'ghostty',
  'iterm2',
  'terminal-app',
  'linux-terminal',
  'custom',
]

const targets: TargetKind[] = ['window', 'tab', 'split-right', 'split-down', 'float']

describe('backend command shapes', () => {
  for (const backend of backends) {
    for (const target of targets) {
      it(`${backend} × ${target}`, () => {
        const built = buildBackendCommand({
          backend,
          target,
          editor,
          file: pos.file,
          line: pos.line,
          column: pos.column,
          customBackendArgs: ['tmux', 'new-window', '{cmd}'],
        })
        expect(built.argv.length).toBeGreaterThan(0)
        expect(built.description.length).toBeGreaterThan(0)
      })
    }
  }

  it('tmux float uses display-popup', () => {
    const b = buildBackendCommand({
      backend: 'tmux',
      target: 'float',
      editor,
      file: pos.file,
      line: pos.line,
      column: pos.column,
    })
    expect(b.argv).toEqual(['tmux', 'display-popup', '-E', editor.shellCommand])
  })

  it('zellij float uses --floating', () => {
    const b = buildBackendCommand({
      backend: 'zellij',
      target: 'float',
      editor,
      file: pos.file,
      line: pos.line,
      column: pos.column,
    })
    expect(b.argv).toContain('--floating')
  })

  it('custom template substitutes placeholders', () => {
    const b = buildBackendCommand({
      backend: 'custom',
      target: 'window',
      editor,
      file: pos.file,
      line: pos.line,
      column: pos.column,
      customBackendArgs: ['echo', '{file}', '{line}', '{col}'],
    })
    expect(b.argv).toEqual(['echo', '/x.ts', '5', '1'])
  })
})
