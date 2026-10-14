import { describe, expect, it } from 'vitest'
import { mergeConfig } from '../src/config/merge.js'

describe('config precedence', () => {
  it('defaults to nvim/window/auto', () => {
    const r = mergeConfig({}, undefined, {})
    expect(r.editor).toBe('nvim')
    expect(r.target).toBe('window')
    expect(r.backend).toBe('auto')
  })

  it('toml < inline < env', () => {
    const r = mergeConfig(
      { editor: 'vim', target: 'tab', backend: 'tmux' },
      { editor: 'helix', target: 'float' },
      { LAUNCH_EDITOR_TERM_EDITOR: 'emacs', LAUNCH_EDITOR_TERM_TARGET: 'split-right', LAUNCH_EDITOR_TERM_BACKEND: 'kitty' },
    )
    expect(r.editor).toBe('emacs')
    expect(r.target).toBe('split-right')
    expect(r.backend).toBe('kitty')
  })

  it('parses custom backend args from env', () => {
    const r = mergeConfig({}, undefined, { LAUNCH_EDITOR_TERM_CUSTOM_BACKEND_ARGS: 'tmux display-popup -E {cmd}' })
    expect(r.customBackendArgs).toEqual(['tmux', 'display-popup', '-E', '{cmd}'])
  })
})
