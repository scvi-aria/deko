// Minimal QR code generator using PixiJS Graphics
// Generates a simple QR-like pattern (visual placeholder)
// For production, swap with a real QR library

import { Graphics } from 'pixi.js'

/**
 * Draw a QR code on a PixiJS Graphics object.
 * Uses a simple encoding for visual effect — in production,
 * integrate a real QR library like 'qrcode'.
 */
export function drawQRCode(
  g: Graphics,
  x: number,
  y: number,
  size: number,
  url: string,
  color: number = 0x1a1a1a,
) {
  const modules = 21 // QR v1 size
  const cellSize = size / modules

  // Generate deterministic pattern from URL
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0
  }

  // Draw finder patterns (the 3 big squares)
  const drawFinder = (fx: number, fy: number) => {
    // Outer
    g.rect(fx, fy, cellSize * 7, cellSize * 7)
    g.fill(color)
    // White inner
    g.rect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5)
    g.fill(0xFFFFFF)
    // Inner square
    g.rect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3)
    g.fill(color)
  }

  // Background
  g.rect(x - 4, y - 4, size + 8, size + 8)
  g.fill(0xFFFFFF)

  // Finder patterns
  drawFinder(x, y) // top-left
  drawFinder(x + cellSize * (modules - 7), y) // top-right
  drawFinder(x, y + cellSize * (modules - 7)) // bottom-left

  // Data modules (deterministic pseudo-random from URL hash)
  let seed = Math.abs(hash)
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Skip finder pattern areas
      if ((row < 8 && col < 8) || (row < 8 && col >= modules - 8) || (row >= modules - 8 && col < 8)) continue
      // Timing patterns
      if (row === 6 || col === 6) {
        if ((row + col) % 2 === 0) {
          g.rect(x + col * cellSize, y + row * cellSize, cellSize, cellSize)
          g.fill(color)
        }
        continue
      }
      // Pseudo-random data
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      if (seed % 3 !== 0) {
        g.rect(x + col * cellSize, y + row * cellSize, cellSize * 0.95, cellSize * 0.95)
        g.fill(color)
      }
    }
  }
}
