import { Application, Sprite, Assets, Container } from 'pixi.js'

export type VendorType = 'coffee' | 'pizza' | 'florist'

export type OrderStage = 'received' | 'preparing' | 'packaging' | 'ready'

export interface DekoAnimation {
  app: Application
  setStage: (stage: OrderStage) => void
  setOrder: (orderName: string, items: string[]) => void
  destroy: () => void
}

export async function createDekoAnimation(
  container: HTMLElement,
  vendor: VendorType
): Promise<DekoAnimation> {
  const app = new Application()

  await app.init({
    resizeTo: container,
    background: '#FAFAF9',
    antialias: true,
  })

  container.appendChild(app.canvas as HTMLCanvasElement)

  const stage = new Container()
  app.stage.addChild(stage)

  // TODO: Load vendor-specific sprite sheets
  // const spriteSheet = await Assets.load(`/sprites/${vendor}.json`)

  let currentStage: OrderStage = 'received'

  return {
    app,
    setStage(newStage: OrderStage) {
      currentStage = newStage
      // TODO: Transition animation based on stage
      console.log(`[Deko] Stage: ${newStage}`)
    },
    setOrder(orderName: string, items: string[]) {
      // TODO: Display order info overlay
      console.log(`[Deko] Order: ${orderName}`, items)
    },
    destroy() {
      app.destroy(true)
    },
  }
}
