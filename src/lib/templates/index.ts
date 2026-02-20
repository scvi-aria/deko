export type { TemplateConfig, AnimationState, StateConfig } from './types'
export { coffeeTemplate } from './coffee'
export { pizzaTemplate } from './pizza'
export { floristTemplate } from './florist'

import { coffeeTemplate } from './coffee'
import { pizzaTemplate } from './pizza'
import { floristTemplate } from './florist'
import type { TemplateConfig } from './types'

export const templates: Record<string, TemplateConfig> = {
  coffee: coffeeTemplate,
  pizza: pizzaTemplate,
  florist: floristTemplate,
}
