import { Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { TemplateConfig, AnimationState } from './types'

const PURPLE = 0x7C3AED
const WHITE = 0xFAFAF9
const GREEN = 0x4ADE80
const ORANGE = 0xFB923C
const BROWN = 0x8B4513
const CREAM = 0xF5DEB3

function drawCup(g: Graphics, x: number, y: number, scale: number = 1) {
  // Cup body
  g.roundRect(x - 30 * scale, y - 50 * scale, 60 * scale, 70 * scale, 6 * scale)
  g.fill(WHITE)
  g.stroke({ color: PURPLE, width: 3 * scale })
  // Handle
  g.arc(x + 30 * scale, y - 15 * scale, 15 * scale, -Math.PI / 2, Math.PI / 2)
  g.stroke({ color: PURPLE, width: 3 * scale })
  // Deko logo on cup
  g.roundRect(x - 15 * scale, y - 30 * scale, 30 * scale, 15 * scale, 3 * scale)
  g.fill(PURPLE)
}

function drawSteam(g: Graphics, x: number, y: number, elapsed: number) {
  const t = elapsed * 0.003
  for (let i = 0; i < 3; i++) {
    const offset = Math.sin(t + i * 2) * 8
    const steamY = y - 60 - i * 15
    g.moveTo(x - 10 + i * 10 + offset, steamY + 15)
    g.quadraticCurveTo(x - 10 + i * 10 + offset + 5, steamY + 7, x - 10 + i * 10 - offset, steamY)
    g.stroke({ color: 0xCCCCCC, width: 2, alpha: 0.5 - i * 0.1 })
  }
}

function drawCounter(g: Graphics, width: number, height: number) {
  g.roundRect(0, height * 0.65, width, height * 0.35, 0)
  g.fill(0x3B2414)
  // Counter top edge
  g.roundRect(0, height * 0.63, width, 12, 0)
  g.fill(ORANGE)
}

function drawSparkle(g: Graphics, x: number, y: number, size: number, alpha: number) {
  const s = size
  g.moveTo(x, y - s).lineTo(x + s * 0.3, y - s * 0.3).lineTo(x + s, y)
    .lineTo(x + s * 0.3, y + s * 0.3).lineTo(x, y + s)
    .lineTo(x - s * 0.3, y + s * 0.3).lineTo(x - s, y)
    .lineTo(x - s * 0.3, y - s * 0.3).closePath()
  g.fill({ color: GREEN, alpha })
}

function drawHand(g: Graphics, x: number, y: number, progress: number) {
  // Simple hand shape coming from right
  const handX = x + 200 * (1 - progress)
  g.roundRect(handX, y - 15, 60, 30, 10)
  g.fill(0xDEB887)
  // Fingers
  for (let i = 0; i < 4; i++) {
    g.roundRect(handX + 50 + i * 2, y - 12 + i * 7, 20, 8, 4)
    g.fill(0xDEB887)
  }
}

function drawPourStream(g: Graphics, x: number, y1: number, y2: number, elapsed: number) {
  const wobble = Math.sin(elapsed * 0.01) * 3
  g.moveTo(x + wobble, y1)
  g.lineTo(x + 4 + wobble, y1)
  g.lineTo(x + 8 - wobble, y2)
  g.lineTo(x - 4 - wobble, y2)
  g.closePath()
  g.fill({ color: BROWN, alpha: 0.8 })
}

const draw = (state: AnimationState, container: Container, elapsed: number, width: number, height: number) => {
  // Remove old graphics
  container.removeChildren()
  const g = new Graphics()
  container.addChild(g)

  const cx = width / 2
  const cy = height * 0.5

  // Always draw counter
  drawCounter(g, width, height)

  // Frame-step for retro feel (8 FPS = every 125ms)
  const frame = Math.floor(elapsed / 125)
  const stepElapsed = frame * 125

  switch (state) {
    case 'IDLE': {
      // Just the cup sitting on counter with gentle steam
      drawCup(g, cx, cy + 20)
      drawSteam(g, cx, cy - 30, stepElapsed)
      break
    }
    case 'RECEIVE': {
      // Hand bringing cup in from right side
      const progress = Math.min(1, (elapsed % 3000) / 2000)
      const cupX = cx + 250 * (1 - easeOutBack(progress))
      drawHand(g, cupX - 40, cy - 10, easeOutBack(progress))
      drawCup(g, cupX, cy + 20)
      // Order ticket appearing
      const ticketAlpha = Math.min(1, Math.max(0, (progress - 0.5) * 2))
      if (ticketAlpha > 0) {
        g.roundRect(cx - 80, height * 0.15, 160, 60, 8)
        g.fill({ color: WHITE, alpha: ticketAlpha })
        g.stroke({ color: PURPLE, width: 2, alpha: ticketAlpha })
      }
      break
    }
    case 'PREPARE': {
      // Coffee pouring into cup - looping animation
      const pourCycle = (stepElapsed % 2500) / 2500
      drawCup(g, cx, cy + 20)
      // Coffee machine nozzle
      g.roundRect(cx - 20, cy - 120, 40, 30, 4)
      g.fill(0x444444)
      g.roundRect(cx - 5, cy - 92, 10, 8, 2)
      g.fill(0x333333)
      // Pour stream
      if (pourCycle < 0.7) {
        const pourProgress = pourCycle / 0.7
        const streamEnd = cy - 84 + (cy - 30 - (cy - 84)) * Math.min(1, pourProgress * 1.5)
        drawPourStream(g, cx, cy - 84, streamEnd, stepElapsed)
      }
      // Fill level in cup
      const fillLevel = Math.min(0.8, pourCycle)
      if (fillLevel > 0) {
        const fillHeight = 55 * fillLevel
        g.roundRect(cx - 26, cy + 20 - fillHeight + 2, 52, fillHeight, 3)
        g.fill({ color: BROWN, alpha: 0.9 })
      }
      // Steam if partially filled
      if (pourCycle > 0.3) {
        drawSteam(g, cx, cy - 30, stepElapsed)
      }
      break
    }
    case 'PACKAGE': {
      // Cup sliding to the left with a sleeve being put on
      const slideCycle = (stepElapsed % 3000) / 3000
      const slideX = cx + 100 - 200 * easeInOutCubic(Math.min(1, slideCycle * 1.5))
      drawCup(g, slideX, cy + 20)
      // Fill
      g.roundRect(slideX - 26, cy + 20 - 42, 52, 44, 3)
      g.fill({ color: BROWN, alpha: 0.9 })
      drawSteam(g, slideX, cy - 30, stepElapsed)
      // Sleeve appearing
      if (slideCycle > 0.4) {
        const sleeveAlpha = Math.min(1, (slideCycle - 0.4) / 0.3)
        g.roundRect(slideX - 32, cy - 10, 64, 25, 4)
        g.fill({ color: ORANGE, alpha: sleeveAlpha })
      }
      // Lid
      if (slideCycle > 0.6) {
        const lidDrop = Math.min(1, (slideCycle - 0.6) / 0.3)
        const lidY = cy - 50 - 30 * (1 - easeOutBounce(lidDrop))
        g.roundRect(slideX - 34, lidY, 68, 10, 4)
        g.fill({ color: WHITE })
        g.stroke({ color: PURPLE, width: 2 })
      }
      break
    }
    case 'READY': {
      // Cup on counter with sparkles
      drawCup(g, cx, cy + 20)
      g.roundRect(cx - 26, cy + 20 - 42, 52, 44, 3)
      g.fill({ color: BROWN, alpha: 0.9 })
      // Sleeve
      g.roundRect(cx - 32, cy - 10, 64, 25, 4)
      g.fill(ORANGE)
      // Lid
      g.roundRect(cx - 34, cy - 50, 68, 10, 4)
      g.fill(WHITE)
      g.stroke({ color: PURPLE, width: 2 })
      // Sparkles
      const sparkleFrame = frame % 20
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + sparkleFrame * 0.3
        const dist = 80 + Math.sin(sparkleFrame * 0.5 + i) * 20
        const sx = cx + Math.cos(angle) * dist
        const sy = cy - 20 + Math.sin(angle) * dist * 0.5
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(sparkleFrame * 0.4 + i * 1.2))
        const size = 8 + 6 * Math.abs(Math.sin(sparkleFrame * 0.3 + i))
        drawSparkle(g, sx, sy, size, alpha)
      }
      // Checkmark
      const checkAlpha = Math.min(1, elapsed / 1000)
      g.moveTo(cx - 20, cy + 80)
      g.lineTo(cx - 5, cy + 95)
      g.lineTo(cx + 25, cy + 60)
      g.stroke({ color: GREEN, width: 5, alpha: checkAlpha })
      break
    }
  }
}

// Easing functions
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) return 7.5625 * t * t
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
}

export const coffeeTemplate: TemplateConfig = {
  name: 'Coffee Shop',
  states: {
    IDLE: { duration: 0, label: 'Waiting for orders...' },
    RECEIVE: { duration: 3000, label: 'Order Received!' },
    PREPARE: { duration: 5000, label: 'Brewing your coffee...' },
    PACKAGE: { duration: 3000, label: 'Packaging...' },
    READY: { duration: 4000, label: 'Ready for pickup!' },
  },
  draw,
}
