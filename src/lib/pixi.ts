import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { AnimationState, TemplateConfig } from './templates'

export type { AnimationState }

export interface OrderInfo {
  orderNumber: string
  items: string[]
}

export interface DekoEngineConfig {
  container: HTMLElement
  template: TemplateConfig
  width?: number
  height?: number
  onStateChange?: (state: AnimationState, label: string) => void
}

export interface DekoEngine {
  app: Application
  runOrder: (order: OrderInfo) => void
  destroy: () => void
  getState: () => AnimationState
}

const STATE_SEQUENCE: AnimationState[] = ['RECEIVE', 'PREPARE', 'PACKAGE', 'READY']

export async function createDekoEngine(config: DekoEngineConfig): Promise<DekoEngine> {
  const { container, template, width = 1200, height = 800, onStateChange } = config

  const app = new Application()
  await app.init({
    width,
    height,
    background: '#FAFAF9',
    antialias: false, // Retro pixel feel
    resolution: 1,
  })

  container.appendChild(app.canvas as HTMLCanvasElement)

  // Scale canvas to fit container via CSS
  const canvas = app.canvas as HTMLCanvasElement
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.objectFit = 'contain'

  const sceneContainer = new Container()
  app.stage.addChild(sceneContainer)

  // Overlay text
  const labelStyle = new TextStyle({
    fontFamily: 'Inter, sans-serif',
    fontSize: 28,
    fontWeight: 'bold',
    fill: '#7C3AED',
  })
  const orderStyle = new TextStyle({
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 20,
    fill: '#666666',
  })

  const labelText = new Text({ text: '', style: labelStyle })
  labelText.anchor.set(0.5, 0)
  labelText.x = width / 2
  labelText.y = 20

  const orderText = new Text({ text: '', style: orderStyle })
  orderText.anchor.set(0.5, 0)
  orderText.x = width / 2
  orderText.y = 55

  app.stage.addChild(labelText)
  app.stage.addChild(orderText)

  let currentState: AnimationState = 'IDLE'
  let stateStartTime = 0
  let animating = false
  let currentOrder: OrderInfo | null = null
  const orderQueue: OrderInfo[] = []

  function setState(state: AnimationState) {
    currentState = state
    stateStartTime = performance.now()
    const stateConfig = template.states[state]
    labelText.text = stateConfig.label
    if (currentOrder && state !== 'IDLE') {
      orderText.text = `#${currentOrder.orderNumber} — ${currentOrder.items.join(', ')}`
    } else {
      orderText.text = ''
    }
    onStateChange?.(state, stateConfig.label)
  }

  // Animation ticker
  app.ticker.add(() => {
    const now = performance.now()
    const elapsed = now - stateStartTime

    template.draw(currentState, sceneContainer, elapsed, width, height)

    if (animating && currentState !== 'IDLE') {
      const stateConfig = template.states[currentState]
      if (elapsed >= stateConfig.duration) {
        const idx = STATE_SEQUENCE.indexOf(currentState)
        if (idx < STATE_SEQUENCE.length - 1) {
          setState(STATE_SEQUENCE[idx + 1])
        } else {
          // Done - back to idle, process next in queue
          setState('IDLE')
          animating = false
          currentOrder = null
          processQueue()
        }
      }
    }
  })

  function processQueue() {
    if (orderQueue.length > 0 && !animating) {
      const order = orderQueue.shift()!
      currentOrder = order
      animating = true
      setState('RECEIVE')
    }
  }

  // Start in idle
  setState('IDLE')

  return {
    app,
    runOrder(order: OrderInfo) {
      if (orderQueue.length >= 5) return // Max queue
      orderQueue.push(order)
      processQueue()
    },
    destroy() {
      app.destroy(true)
    },
    getState() {
      return currentState
    },
  }
}
