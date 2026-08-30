export function toSafeNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

export function formatBytes(value: string | number): string {
  const bytes = toSafeNumber(value)
  if (bytes === 0) {
    return '0 B'
  }
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1,
  )
  const size = bytes / 1024 ** exponent
  const formatted = exponent === 0 ? size.toString() : size.toFixed(1)
  return `${formatted} ${SIZE_UNITS[exponent]}`
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
