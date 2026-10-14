import type { FilePosition, LaunchEditorTermOptions } from './types.js'
import { loadResolvedConfig } from './config/load.js'
import { runLaunchPlan } from './execute.js'
import { createLaunchPlan } from './plan.js'

export interface LaunchArgs {
  file: string
  line?: number
  column?: number
  options?: LaunchEditorTermOptions
  dryRun?: boolean
}

export async function launch(args: LaunchArgs): Promise<{ plan: ReturnType<typeof createLaunchPlan>, dryRun: boolean }> {
  const position: FilePosition = {
    file: args.file,
    line: args.line ?? 0,
    column: args.column ?? 0,
  }
  const base = await loadResolvedConfig(args.options)
  const config = { ...base, dryRun: args.dryRun ?? false }
  const plan = createLaunchPlan({ config, position })
  if (config.dryRun) {
    console.log(plan.description)
    console.log(plan.argv.join(' '))
    return { plan, dryRun: true }
  }
  runLaunchPlan(plan)
  return { plan, dryRun: false }
}
