import { Container, Graphics } from 'pixi.js'
import type { TemplateConfig, AnimationState } from './types'

const PINK = 0xF472B6
const ROSE = 0xFB7185
const LAVENDER = 0xC084FC
const GREEN = 0x4ADE80
const DARK_GREEN = 0x166534
const YELLOW = 0xFBBF24
const WHITE = 0xFAFAF9
const CREAM = 0xFEF3C7
const BROWN = 0x92400E

function drawStem(g: Graphics, x: number, y1: number, y2: number, curve: number) {
  g.moveTo(x, y1)
  g.quadraticCurveTo(x + curve, (y1 + y2) / 2, x, y2)
  g.stroke({ color: DARK_GREEN, width: 3 })
}

function drawLeaf(g: Graphics, x: number, y: number, size: number, angle: number) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  g.moveTo(x, y)
  g.quadraticCurveTo(
    x + cos * size - sin * size * 0.4,
    y + sin * size + cos * size * 0.4,
    x + cos * size * 1.5,
    y + sin * size * 1.5,
  )
  g.quadraticCurveTo(
    x + cos * size + sin * size * 0.4,
    y + sin * size - cos * size * 0.4,
    x, y,
  )
  g.fill({ color: GREEN, alpha: 0.8 })
}

function drawFlower(g: Graphics, x: number, y: number, size: number, color: number, petalCount: number, bloom: number) {
  const actualPetals = Math.ceil(petalCount * bloom)
  const petalSize = size * bloom
  for (let i = 0; i < actualPetals; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const px = x + Math.cos(angle) * petalSize * 0.6
    const py = y + Math.sin(angle) * petalSize * 0.6
    g.circle(px, py, petalSize * 0.5)
    g.fill({ color, alpha: 0.85 })
  }
  // Center
  if (bloom > 0.3) {
    g.circle(x, y, petalSize * 0.25)
    g.fill(YELLOW)
  }
}

function drawVase(g: Graphics, x: number, y: number, w: number, h: number) {
  // Vase body (tapered)
  g.moveTo(x - w * 0.3, y - h)
  g.quadraticCurveTo(x - w * 0.5, y - h * 0.3, x - w * 0.35, y)
  g.lineTo(x + w * 0.35, y)
  g.quadraticCurveTo(x + w * 0.5, y - h * 0.3, x + w * 0.3, y - h)
  g.closePath()
  g.fill(LAVENDER)
  g.stroke({ color: 0x7C3AED, width: 2 })
  // Rim
  g.ellipse(x, y - h, w * 0.32, 6)
  g.fill(LAVENDER)
  g.stroke({ color: 0x7C3AED, width: 2 })
}

function drawWrapping(g: Graphics, x: number, y: number, w: number, h: number, progress: number) {
  // Tissue paper wrapping
  const wrapW = w * progress
  g.roundRect(x - wrapW / 2, y - h / 2, wrapW, h, 4)
  g.fill({ color: CREAM, alpha: 0.9 })
  g.stroke({ color: PINK, width: 1.5 })
  // Ribbon
  if (progress > 0.7) {
    const ribbonAlpha = (progress - 0.7) / 0.3
    g.moveTo(x - 15, y - h / 2 - 5)
    g.quadraticCurveTo(x, y - h / 2 - 20, x + 15, y - h / 2 - 5)
    g.stroke({ color: ROSE, width: 3, alpha: ribbonAlpha })
    g.moveTo(x - 10, y - h / 2 - 5)
    g.quadraticCurveTo(x, y - h / 2 - 15, x + 10, y - h / 2 - 5)
    g.stroke({ color: ROSE, width: 2, alpha: ribbonAlpha })
  }
}

function drawParticle(g: Graphics, x: number, y: number, size: number, color: number, alpha: number) {
  g.circle(x, y, size)
  g.fill({ color, alpha })
}

function drawSparkle(g: Graphics, x: number, y: number, size: number, alpha: number) {
  const s = size
  g.moveTo(x, y - s).lineTo(x + s * 0.3, y - s * 0.3).lineTo(x + s, y)
    .lineTo(x + s * 0.3, y + s * 0.3).lineTo(x, y + s)
    .lineTo(x - s * 0.3, y + s * 0.3).lineTo(x - s, y)
    .lineTo(x - s * 0.3, y - s * 0.3).closePath()
  g.fill({ color: PINK, alpha })
}

function drawCounter(g: Graphics, width: number, height: number) {
  g.roundRect(0, height * 0.65, width, height * 0.35, 0)
  g.fill(0x4A3728)
  g.roundRect(0, height * 0.63, width, 12, 0)
  g.fill(GREEN)
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const FLOWER_COLORS = [PINK, ROSE, LAVENDER, 0xFB923C, 0xF87171]

const draw = (state: AnimationState, container: Container, elapsed: number, width: number, height: number) => {
  container.removeChildren()
  const g = new Graphics()
  container.addChild(g)

  const cx = width / 2
  const cy = height * 0.45
  const frame = Math.floor(elapsed / 125)
  const stepElapsed = frame * 125

  drawCounter(g, width, height)

  switch (state) {
    case 'IDLE': {
      // Vase with a single flower
      drawVase(g, cx, cy + 40, 60, 80)
      drawStem(g, cx, cy + 40 - 80, cy - 40, 10)
      drawLeaf(g, cx + 5, cy - 10, 15, -0.5)
      drawFlower(g, cx + Math.sin(stepElapsed * 0.002) * 2, cy - 50, 18, PINK, 6, 1)
      break
    }
    case 'RECEIVE': {
      // Flowers arriving from the sides
      const progress = Math.min(1, elapsed / 3000)
      const entryP = easeOutBack(Math.min(1, progress * 1.5))
      // Multiple stems sliding in
      for (let i = 0; i < 5; i++) {
        const fromLeft = i % 2 === 0
        const offsetX = (fromLeft ? -300 : 300) * (1 - entryP) + (i - 2) * 25
        const stemX = cx + offsetX
        const color = FLOWER_COLORS[i]
        const stemH = 80 + i * 10
        drawStem(g, stemX, cy + 30, cy + 30 - stemH, (i - 2) * 8)
        drawLeaf(g, stemX + (i - 2) * 2, cy - 10, 12, (i - 2) * 0.3)
        const bloomP = Math.max(0, (progress - 0.4) / 0.6)
        drawFlower(g, stemX + (i - 2) * 3, cy + 30 - stemH - 10, 14 + i * 2, color, 5 + (i % 2), bloomP)
      }
      // Vase appearing
      if (progress > 0.5) {
        const vaseAlpha = (progress - 0.5) * 2
        // Vase fading in — use alpha on the fill
        const savedAlpha = vaseAlpha
        drawVase(g, cx, cy + 40, 60, 80)
      }
      break
    }
    case 'PREPARE': {
      // Arranging flowers — they move into position in vase, bloom particles
      const cycle = (stepElapsed % 6000) / 6000
      drawVase(g, cx, cy + 40, 60, 80)
      // Flowers arranging
      const arranged = Math.min(5, Math.floor(cycle * 7))
      for (let i = 0; i < 5; i++) {
        const targetX = cx + (i - 2) * 20
        const targetY = cy - 50 - i * 8
        const color = FLOWER_COLORS[i]
        if (i < arranged) {
          // In position
          const sway = Math.sin(stepElapsed * 0.002 + i * 1.5) * 3
          drawStem(g, targetX, cy + 40 - 80, targetY + 20, (i - 2) * 5 + sway)
          drawLeaf(g, targetX + (i - 2) * 2, cy - 20 + i * 5, 12, (i - 2) * 0.3 + sway * 0.05)
          drawFlower(g, targetX + sway, targetY, 15 + i * 2, color, 5 + (i % 2), 1)
        } else if (i === arranged) {
          // Currently being placed
          const placeP = (cycle * 7) % 1
          const fromY = cy - 150
          const curY = fromY + (targetY - fromY) * easeInOutCubic(placeP)
          drawStem(g, targetX, cy + 40 - 80, curY + 20, (i - 2) * 5)
          drawFlower(g, targetX, curY, 15 + i * 2, color, 5 + (i % 2), placeP)
        }
      }
      // Bloom particles
      for (let i = 0; i < 4; i++) {
        const px = cx + Math.sin(stepElapsed * 0.004 + i * 2) * 60
        const py = cy - 60 + Math.cos(stepElapsed * 0.003 + i * 1.5) * 30
        drawParticle(g, px, py, 3, FLOWER_COLORS[i % 5], 0.4)
      }
      break
    }
    case 'PACKAGE': {
      // Wrapping the bouquet
      const progress = Math.min(1, elapsed / 4000)
      // Bouquet
      for (let i = 0; i < 5; i++) {
        const fx = cx + (i - 2) * 15
        const fy = cy - 40 - i * 8
        const sway = Math.sin(stepElapsed * 0.002 + i) * 2
        drawStem(g, fx, cy + 30, fy + 15, (i - 2) * 4 + sway)
        drawFlower(g, fx + sway, fy, 14 + i * 2, FLOWER_COLORS[i], 5 + (i % 2), 1)
      }
      // Wrapping paper
      drawWrapping(g, cx, cy + 10, 120, 100, easeInOutCubic(progress))
      break
    }
    case 'READY': {
      // Wrapped bouquet with sparkles and bloom particles
      // Bouquet
      for (let i = 0; i < 5; i++) {
        const fx = cx + (i - 2) * 15
        const fy = cy - 40 - i * 8
        const sway = Math.sin(stepElapsed * 0.002 + i) * 2
        drawStem(g, fx, cy + 30, fy + 15, (i - 2) * 4 + sway)
        drawFlower(g, fx + sway, fy, 14 + i * 2, FLOWER_COLORS[i], 5 + (i % 2), 1)
      }
      drawWrapping(g, cx, cy + 10, 120, 100, 1)
      // Sparkles
      const sparkleFrame = frame % 20
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + sparkleFrame * 0.25
        const dist = 80 + Math.sin(sparkleFrame * 0.5 + i) * 15
        const sx = cx + Math.cos(angle) * dist
        const sy = cy - 10 + Math.sin(angle) * dist * 0.5
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(sparkleFrame * 0.4 + i * 1.2))
        const size = 7 + 5 * Math.abs(Math.sin(sparkleFrame * 0.3 + i))
        drawSparkle(g, sx, sy, size, alpha)
      }
      // Bloom particles floating up
      for (let i = 0; i < 8; i++) {
        const px = cx + Math.sin(stepElapsed * 0.003 + i * 1.2) * 80
        const py = cy - 80 - (stepElapsed * 0.02 + i * 30) % 120
        drawParticle(g, px, py, 2 + (i % 3), FLOWER_COLORS[i % 5], 0.3 + 0.2 * Math.sin(stepElapsed * 0.005 + i))
      }
      // Checkmark
      const checkAlpha = Math.min(1, elapsed / 1000)
      g.moveTo(cx - 20, cy + 90)
      g.lineTo(cx - 5, cy + 105)
      g.lineTo(cx + 25, cy + 70)
      g.stroke({ color: GREEN, width: 5, alpha: checkAlpha })
      break
    }
  }
}

export const floristTemplate: TemplateConfig = {
  name: 'Florist',
  states: {
    IDLE: { duration: 0, label: 'Waiting for orders...' },
    RECEIVE: { duration: 3000, label: 'Order Received!' },
    PREPARE: { duration: 6000, label: 'Arranging your bouquet...' },
    PACKAGE: { duration: 4000, label: 'Wrapping...' },
    READY: { duration: 4000, label: 'Ready for pickup!' },
  },
  draw,
}
