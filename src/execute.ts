import type { LaunchPlan, OnCloseHook } from './types.js'
import { spawn } from 'node:child_process'

/** Documented hook point — not wired yet */
export let onClose: OnCloseHook | undefined

export function runLaunchPlan(plan: LaunchPlan): void {
  const opts = {
    detached: true,
    stdio: 'ignore' as const,
    shell: plan.shell ?? false,
  }
  const child = spawn(plan.argv[0], plan.argv.slice(1), opts)
  child.unref()
}
