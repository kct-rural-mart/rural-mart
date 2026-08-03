export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined
}
