
export function notNull<T>(value: T | null): value is T {
  return value !== null
}

export function formatLength(meters: number) {
  if (meters < 1) {
    return `${Math.floor(meters * 100)} cm`
  } else {
    return `${Math.floor(meters * 100) / 100} m`
  }
}
