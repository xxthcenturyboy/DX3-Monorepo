import { jest } from '@jest/globals'

import { setupStore } from '../testing/testing.store'

const store = typeof setupStore === 'function' ? setupStore({}) : jest.fn()

const persistor = jest.fn()

export { persistor, store }
