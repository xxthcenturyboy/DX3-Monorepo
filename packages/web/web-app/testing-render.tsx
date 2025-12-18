import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import type React from 'react'
import type { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'

import type { AppStore, RootState } from './src/app/store/testing/testing.store'
import { setupStore } from './src/app/store/testing/testing.store'

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  const Wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}
