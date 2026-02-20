import type { TemplateConfig } from './types'
import { Container } from 'pixi.js'

// Stub - Sprint 2
export const pizzaTemplate: TemplateConfig = {
  name: 'Pizza Shop',
  states: {
    IDLE: { duration: 0, label: 'Waiting for orders...' },
    RECEIVE: { duration: 3000, label: 'Order Received!' },
    PREPARE: { duration: 8000, label: 'Baking your pizza...' },
    PACKAGE: { duration: 3000, label: 'Boxing up...' },
    READY: { duration: 4000, label: 'Ready for pickup!' },
  },
  draw: (_state, _container, _elapsed, _w, _h) => {
    // TODO: Implement pizza animations
  },
}
