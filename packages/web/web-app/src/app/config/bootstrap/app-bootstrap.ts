import { store } from '../../store/store-web.redux'
import { uiActions } from '../../ui/store/ui-web.reducer'
import { STRINGS } from '../en.strings'

export function appBootstrap() {
  if (STRINGS) {
    // TODO: Get JSON from Server
    store.dispatch(uiActions.setStrings(STRINGS))
  }
}
