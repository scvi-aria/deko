import type { TemplateConfig } from './types'
import { Container } from 'pixi.js'

// Stub - Sprint 2
export const floristTemplate: TemplateConfig = {
  name: 'Florist',
  states: {
    IDLE: { duration: 0, label: 'Waiting for orders...' },
    RECEIVE: { duration: 3000, label: 'Order Received!' },
    PREPARE: { duration: 6000, label: 'Arranging your bouquet...' },
    PACKAGE: { duration: 4000, label: 'Wrapping...' },
    READY: { duration: 4000, label: 'Ready for pickup!' },
  },
  draw: (_state, _container, _elapsed, _w, _h) => {
    // TODO: Implement florist animations
  },
}
