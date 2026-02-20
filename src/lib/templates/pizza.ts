import { Container, Graphics } from 'pixi.js'
import type { TemplateConfig, AnimationState } from './types'

const RED = 0xDC2626
const ORANGE = 0xFB923C
const YELLOW = 0xFBBF24
const BROWN = 0x92400E
const CREAM = 0xFDE68A
const GREEN_OLIVE = 0x65A30D
const WHITE = 0xFAFAF9
const PURPLE = 0x7C3AED

function drawOven(g: Graphics, x: number, y: number, w: number, h: number) {
  // Oven body
  g.roundRect(x - w / 2, y - h / 2, w, h, 8)
  g.fill(0x44403C)
  // Oven window
  g.roundRect(x - w / 2 + 15, y - h / 2 + 15, w - 30, h * 0.5, 6)
  g.fill(0x1C1917)
  // Glow inside
  g.roundRect(x - w / 2 + 18, y - h / 2 + 18, w - 36, h * 0.5 - 6, 4)
  g.fill({ color: ORANGE, alpha: 0.3 })
  // Handle
  g.roundRect(x - 30, y + h * 0.1, 60, 8, 4)
  g.fill(0x78716C)
}

function drawDough(g: Graphics, x: number, y: number, radius: number, wobble: number) {
  // Imperfect circle for dough
  g.circle(x + Math.sin(wobble) * 2, y + Math.cos(wobble) * 2, radius)
  g.fill(CREAM)
  g.stroke({ color: BROWN, width: 2 })
}

function drawPizza(g: Graphics, x: number, y: number, radius: number, toppingsProgress: number) {
  // Base
  g.circle(x, y, radius)
  g.fill(CREAM)
  g.stroke({ color: BROWN, width: 3 })
  // Sauce
  g.circle(x, y, radius - 8)
  g.fill({ color: RED, alpha: 0.8 })
  // Cheese
  if (toppingsProgress > 0.2) {
    g.circle(x, y, radius - 10)
    g.fill({ color: YELLOW, alpha: 0.7 * Math.min(1, (toppingsProgress - 0.2) / 0.3) })
  }
  // Pepperoni
  if (toppingsProgress > 0.5) {
    const alpha = Math.min(1, (toppingsProgress - 0.5) / 0.3)
    const spots = [[-15, -10], [10, -18], [0, 12], [-12, 15], [18, 8]]
    for (const [ox, oy] of spots) {
      g.circle(x + ox, y + oy, 6)
      g.fill({ color: 0xB91C1C, alpha })
    }
  }
  // Olives
  if (toppingsProgress > 0.7) {
    const alpha = Math.min(1, (toppingsProgress - 0.7) / 0.3)
    const olives = [[-8, -20], [15, -5], [-18, 5], [5, 18]]
    for (const [ox, oy] of olives) {
      g.circle(x + ox, y + oy, 4)
      g.fill({ color: GREEN_OLIVE, alpha })
    }
  }
}

function drawBox(g: Graphics, x: number, y: number, size: number, openProgress: number) {
  // Box bottom
  g.rect(x - size / 2, y - size / 2 + 5, size, size - 5)
  g.fill(0xFEF3C7)
  g.stroke({ color: BROWN, width: 2 })
  // Box lid (rotating open)
  const lidH = size * 0.3
  const lidAngle = openProgress * 0.5 // partial open
  g.rect(x - size / 2, y - size / 2 - lidH * (1 - lidAngle), size, lidH)
  g.fill(0xFEF3C7)
  g.stroke({ color: BROWN, width: 2 })
  // Logo on box
  g.circle(x, y - size / 2 - lidH * (1 - lidAngle) + lidH / 2, 10)
  g.fill({ color: RED, alpha: 0.6 })
}

function drawFlame(g: Graphics, x: number, y: number, size: number, elapsed: number) {
  const flicker = Math.sin(elapsed * 0.01) * size * 0.2
  g.moveTo(x, y - size - flicker)
  g.quadraticCurveTo(x + size * 0.6, y - size * 0.5, x + size * 0.3, y)
  g.quadraticCurveTo(x, y - size * 0.2, x - size * 0.3, y)
  g.quadraticCurveTo(x - size * 0.6, y - size * 0.5, x, y - size - flicker)
  g.fill({ color: ORANGE, alpha: 0.7 })
  // Inner flame
  g.moveTo(x, y - size * 0.7 - flicker * 0.5)
  g.quadraticCurveTo(x + size * 0.3, y - size * 0.3, x + size * 0.15, y)
  g.quadraticCurveTo(x, y - size * 0.1, x - size * 0.15, y)
  g.quadraticCurveTo(x - size * 0.3, y - size * 0.3, x, y - size * 0.7 - flicker * 0.5)
  g.fill({ color: YELLOW, alpha: 0.8 })
}

function drawSteam(g: Graphics, x: number, y: number, elapsed: number) {
  const t = elapsed * 0.003
  for (let i = 0; i < 3; i++) {
    const offset = Math.sin(t + i * 2) * 6
    const steamY = y - 20 - i * 12
    g.moveTo(x - 8 + i * 8 + offset, steamY + 12)
    g.quadraticCurveTo(x - 8 + i * 8 + offset + 4, steamY + 6, x - 8 + i * 8 - offset, steamY)
    g.stroke({ color: 0xCCCCCC, width: 2, alpha: 0.4 - i * 0.1 })
  }
}

function drawSparkle(g: Graphics, x: number, y: number, size: number, alpha: number) {
  const s = size
  g.moveTo(x, y - s).lineTo(x + s * 0.3, y - s * 0.3).lineTo(x + s, y)
    .lineTo(x + s * 0.3, y + s * 0.3).lineTo(x, y + s)
    .lineTo(x - s * 0.3, y + s * 0.3).lineTo(x - s, y)
    .lineTo(x - s * 0.3, y - s * 0.3).closePath()
  g.fill({ color: YELLOW, alpha })
}

function drawCounter(g: Graphics, width: number, height: number) {
  g.roundRect(0, height * 0.65, width, height * 0.35, 0)
  g.fill(0x44403C)
  g.roundRect(0, height * 0.63, width, 12, 0)
  g.fill(RED)
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

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
      // Pizza box on counter
      drawBox(g, cx, cy + 30, 100, 0)
      drawSteam(g, cx, cy - 30, stepElapsed)
      break
    }
    case 'RECEIVE': {
      // Dough ball appearing, being tossed
      const progress = Math.min(1, elapsed / 3000)
      const tossY = cy + 20 - Math.sin(progress * Math.PI) * 80
      const spin = progress * Math.PI * 4
      const radius = 30 + progress * 15
      drawDough(g, cx, tossY, radius, spin)
      // Flour particles
      if (progress > 0.3) {
        for (let i = 0; i < 5; i++) {
          const px = cx + Math.cos(spin + i) * (50 + progress * 30)
          const py = tossY + Math.sin(spin + i * 1.5) * 20
          g.circle(px, py, 2)
          g.fill({ color: WHITE, alpha: 0.5 * (1 - progress) })
        }
      }
      break
    }
    case 'PREPARE': {
      // Pizza in oven, flames
      const cycle = (stepElapsed % 8000) / 8000
      const toppingsProgress = Math.min(1, cycle * 2)
      // Draw oven in background
      drawOven(g, cx, cy - 50, 200, 140)
      // Pizza inside oven
      const pizzaScale = 0.8 + cycle * 0.2
      drawPizza(g, cx, cy - 50, 40 * pizzaScale, toppingsProgress)
      // Flames at bottom of oven
      for (let i = 0; i < 4; i++) {
        const fx = cx - 60 + i * 40
        drawFlame(g, fx, cy + 15, 15 + Math.sin(stepElapsed * 0.005 + i) * 5, stepElapsed + i * 500)
      }
      // Heat shimmer
      for (let i = 0; i < 3; i++) {
        const shimmerY = cy - 100 - i * 15
        const shimmerX = cx + Math.sin(stepElapsed * 0.003 + i * 2) * 20
        g.moveTo(shimmerX - 15, shimmerY)
        g.quadraticCurveTo(shimmerX, shimmerY - 5, shimmerX + 15, shimmerY)
        g.stroke({ color: ORANGE, width: 1, alpha: 0.2 })
      }
      break
    }
    case 'PACKAGE': {
      // Pizza sliding into box
      const progress = Math.min(1, elapsed / 3000)
      const slidePhase = easeInOutCubic(Math.min(1, progress * 2))
      const boxPhase = Math.max(0, (progress - 0.5) * 2)
      // Box
      drawBox(g, cx, cy + 30, 100, 1 - easeInOutCubic(boxPhase))
      // Pizza sliding in
      const pizzaY = cy - 80 + slidePhase * 110
      if (boxPhase < 0.8) {
        drawPizza(g, cx, pizzaY, 40, 1)
      }
      drawSteam(g, cx, cy - 40, stepElapsed)
      break
    }
    case 'READY': {
      // Closed box with sparkles
      drawBox(g, cx, cy + 30, 100, 0)
      drawSteam(g, cx, cy - 30, stepElapsed)
      // Sparkles
      const sparkleFrame = frame % 20
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + sparkleFrame * 0.25
        const dist = 70 + Math.sin(sparkleFrame * 0.5 + i) * 15
        const sx = cx + Math.cos(angle) * dist
        const sy = cy + 30 + Math.sin(angle) * dist * 0.4
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(sparkleFrame * 0.4 + i * 1.2))
        const size = 7 + 5 * Math.abs(Math.sin(sparkleFrame * 0.3 + i))
        drawSparkle(g, sx, sy, size, alpha)
      }
      // Checkmark
      const checkAlpha = Math.min(1, elapsed / 1000)
      g.moveTo(cx - 20, cy + 90)
      g.lineTo(cx - 5, cy + 105)
      g.lineTo(cx + 25, cy + 70)
      g.stroke({ color: 0x4ADE80, width: 5, alpha: checkAlpha })
      break
    }
  }
}

export const pizzaTemplate: TemplateConfig = {
  name: 'Pizza Shop',
  states: {
    IDLE: { duration: 0, label: 'Waiting for orders...' },
    RECEIVE: { duration: 3000, label: 'Order Received!' },
    PREPARE: { duration: 8000, label: 'Baking your pizza...' },
    PACKAGE: { duration: 3000, label: 'Boxing up...' },
    READY: { duration: 4000, label: 'Ready for pickup!' },
  },
  draw,
}
