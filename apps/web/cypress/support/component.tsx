import { mount } from 'cypress/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { MountWithProvidersOptions } from '../../src/cypress.d'
import '../../src/index.css'

// The Cypress.Chainable['mount'] type augmentation lives in src/cypress.d.ts,
// not here — spec files live under src/ (a separate TS project from cypress/),
// so the global augmentation has to be visible from there.

Cypress.Commands.add(
  'mount',
  (component: ReactNode, options: MountWithProvidersOptions = {}) => {
    const { route = '/' } = options
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    return mount(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{component}</MemoryRouter>
      </QueryClientProvider>,
    )
  },
)
