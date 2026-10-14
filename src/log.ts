const onceKeys = new Set<string>()

export function logOnce(key: string, message: string): void {
  if (onceKeys.has(key))
    return
  onceKeys.add(key)
  console.warn(`[launch-editerm] ${message}`)
}

export function resetLogOnce(): void {
  onceKeys.clear()
}
