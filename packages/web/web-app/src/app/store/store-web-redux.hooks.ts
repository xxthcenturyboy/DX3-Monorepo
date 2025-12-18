/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useDispatch, useSelector, useStore } from 'react-redux'

import type { AppDispatch, AppStore, RootState } from './store-web.redux'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
