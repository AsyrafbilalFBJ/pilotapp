const NAVY = '#0E2138'
const WHITE = '#FFFFFF'

function relativeLuminance(hex: string): number | undefined {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) return undefined
  const value = Number.parseInt(match[1], 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const [r = 0, g = 0, b = 0] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Text colour for a day filled with the API's `base_color`: navy or white,
 * whichever has the higher WCAG contrast. Display-only; the colour itself comes from the API.
 */
export function readableTextOn(background: string): string {
  const bg = relativeLuminance(background)
  if (bg === undefined) return WHITE
  const navy = relativeLuminance(NAVY) ?? 0
  const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  return contrast(bg, navy) >= contrast(bg, 1) ? NAVY : WHITE
}
