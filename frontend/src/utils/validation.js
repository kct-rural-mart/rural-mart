export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined
}

export function isValidMobileNumber(value) {
  return /^[6-9]\d{9}$/.test(String(value).trim())
}
