export function generateSecurePassword(length = 16): string {
  const lowers = 'abcdefghijkmnopqrstuvwxyz'
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  const symbols = '!@#$%^&*()-_=+[]{};:,.?'
  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)]
  const required = [pick(lowers), pick(uppers), pick(digits), pick(symbols)]
  const all = lowers + uppers + digits + symbols
  const rest: string[] = []
  for (let i = 0; i < length - required.length; i++) {
    rest.push(pick(all))
  }
  const combined = [...required, ...rest]
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }
  return combined.join('')
}


