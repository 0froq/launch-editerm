import { describe, expect, it } from 'vitest'
import { degradeTarget, supportedTargets } from '../src/backends/capabilities.js'

describe('target degradation', () => {
  it('ghostty only supports window', () => {
    expect(supportedTargets('ghostty')).toEqual(['window'])
    expect(degradeTarget('ghostty', 'float')).toBe('window')
  })

  it('wezterm has no float', () => {
    expect(degradeTarget('wezterm', 'float')).toBe('split-down')
  })

  it('tmux supports float', () => {
    expect(degradeTarget('tmux', 'float')).toBe('float')
  })
})
