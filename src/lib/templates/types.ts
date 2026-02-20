import { Container, Graphics, Text } from 'pixi.js'

export type AnimationState = 'IDLE' | 'RECEIVE' | 'PREPARE' | 'PACKAGE' | 'READY'

export interface StateConfig {
  duration: number // ms
  label: string
}

export interface TemplateConfig {
  name: string
  states: Record<AnimationState, StateConfig>
  draw: (state: AnimationState, container: Container, elapsed: number, width: number, height: number) => void
}
