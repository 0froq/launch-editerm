import type { ResolvedConfig } from '../src/types.js'
import { describe, expect, it } from 'vitest'
import { createLaunchPlan } from '../src/plan.js'

const baseConfig: ResolvedConfig = {
  editor: 'nvim',
  target: 'window',
  backend: 'tmux',
  dryRun: false,
}

describe('launch plan', () => {
  it('uses remote nvim without tmux when NVIM set', () => {
    const plan = createLaunchPlan({
      config: { ...baseConfig, backend: 'auto' },
      position: { file: '/a.ts', line: 1, column: 0 },
      env: { ...process.env, NVIM: '/tmp/nvim.sock', TMUX: '/tmp/tmux' },
    })
    expect(plan.direct).toBe(true)
    expect(plan.argv).toContain('--server')
  })

  it('uses tmux when no remote', () => {
    const plan = createLaunchPlan({
      config: baseConfig,
      position: { file: '/a.ts', line: 2, column: 0 },
      env: { TMUX: '/tmp/tmux' },
    })
    expect(plan.argv[0]).toBe('tmux')
  })
})
