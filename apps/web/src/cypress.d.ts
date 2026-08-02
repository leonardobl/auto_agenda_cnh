import type { ReactNode } from 'react'
import type { MountReturn } from 'cypress/react'

export interface MountWithProvidersOptions {
  route?: string
}

declare global {
  namespace Cypress {
    interface Chainable {
      mount: (component: ReactNode, options?: MountWithProvidersOptions) => Chainable<MountReturn>
    }
  }
}
