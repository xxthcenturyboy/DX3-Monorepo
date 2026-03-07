import { jest } from '@jest/globals'
import { useDispatch, useSelector, useStore } from 'react-redux'

import { setupStore } from '../testing/testing.store'

const store = typeof setupStore === 'function' ? setupStore({}) : jest.fn()

const persistor = jest.fn()

// Re-export the base react-redux hooks as typed app hooks.
// Tests that render components relying on useAppSelector/useAppDispatch/useAppStore
// will resolve these via the Redux Provider supplied by renderWithProviders.
const useAppDispatch = useDispatch
const useAppSelector = useSelector
const useAppStore = useStore

function getPersistor() {
  return persistor
}

export { getPersistor, persistor, store, useAppDispatch, useAppSelector, useAppStore }
