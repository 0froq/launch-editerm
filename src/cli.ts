#!/usr/bin/env node
import { launch } from './launch.js'

function parseArgs(argv: string[]) {
  let dryRun = false
  const rest: string[] = []
  for (const a of argv) {
    if (a === '--dry-run')
      dryRun = true
    else
      rest.push(a)
  }
  const [file, line, column] = rest
  if (!file) {
    console.error('Usage: launch-editerm [--dry-run] <file> [line] [column]')
    process.exit(1)
  }
  return {
    file,
    line: line ? Number.parseInt(line, 10) : 0,
    column: column ? Number.parseInt(column, 10) : 0,
    dryRun,
  }
}

const parsed = parseArgs(process.argv.slice(2))
launch({
  file: parsed.file,
  line: parsed.line,
  column: parsed.column,
  dryRun: parsed.dryRun,
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
