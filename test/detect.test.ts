import { describe, expect, it } from 'vitest'
import { detectBackend, resolveBackend } from '../src/detect.js'

describe('backend detection', () => {
  it('prefers tmux when TMUX is set', () => {
    expect(detectBackend({ TMUX: '/tmp/tmux-0' })).toBe('tmux')
  })

  it('prefers zellij when ZELLIJ is set', () => {
    expect(detectBackend({ ZELLIJ: '0' })).toBe('zellij')
  })

  it('maps TERM_PROGRAM', () => {
    expect(detectBackend({ TERM_PROGRAM: 'kitty' })).toBe('kitty')
    expect(detectBackend({ TERM_PROGRAM: 'WezTerm' })).toBe('wezterm')
    expect(detectBackend({ TERM_PROGRAM: 'ghostty' })).toBe('ghostty')
    expect(detectBackend({ TERM_PROGRAM: 'iTerm.app' })).toBe('iterm2')
  })

  it('macOS fallback', () => {
    expect(detectBackend({ platform: 'darwin' })).toBe('terminal-app')
  })

  it('linux fallback', () => {
    expect(detectBackend({ platform: 'linux' })).toBe('linux-terminal')
  })

  it('resolveBackend honors explicit backend', () => {
    expect(resolveBackend('zellij', { TMUX: 'x' })).toBe('zellij')
  })
})
