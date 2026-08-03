export function generateUsername(sequenceNumber) {
  return `RM${String(sequenceNumber).padStart(4, '0')}`
}

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'

export function generateTempPassword(length = 12) {
  let password = ''
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * PASSWORD_CHARS.length)
    password += PASSWORD_CHARS[index]
  }
  return password
}
