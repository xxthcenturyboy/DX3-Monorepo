import { uiActions, uiInitialState, uiReducer } from './ui-web.reducer'

describe('uiReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = uiReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(uiInitialState)
  })

  it('should have correct initial state shape', () => {
    expect(uiInitialState.apiDialogError).toBeNull()
    expect(uiInitialState.apiDialogOpen).toBe(false)
    expect(uiInitialState.bootstrapped).toBe(false)
    expect(uiInitialState.menuOpen).toBe(false)
    expect(uiInitialState.menus).toBeNull()
    expect(uiInitialState.theme).toBe('light')
  })

  describe('apiDialogSet', () => {
    it('should open dialog and set error message', () => {
      const state = uiReducer(uiInitialState, uiActions.apiDialogSet('Something went wrong'))
      expect(state.apiDialogOpen).toBe(true)
      expect(state.apiDialogError).toBe('Something went wrong')
    })

    it('should close dialog when empty string', () => {
      const withDialog = { ...uiInitialState, apiDialogError: 'error', apiDialogOpen: true }
      const state = uiReducer(withDialog, uiActions.apiDialogSet(''))
      expect(state.apiDialogOpen).toBe(false)
    })
  })

  describe('awaitDialogMessageSet', () => {
    it('should set await dialog message', () => {
      const state = uiReducer(uiInitialState, uiActions.awaitDialogMessageSet('Loading...'))
      expect(state.awaitDialogMessage).toBe('Loading...')
    })
  })

  describe('awaitDialogOpenSet', () => {
    it('should set awaitDialogOpen to true', () => {
      const state = uiReducer(uiInitialState, uiActions.awaitDialogOpenSet(true))
      expect(state.awaitDialogOpen).toBe(true)
    })

    it('should set awaitDialogOpen to false', () => {
      const state = uiReducer(uiInitialState, uiActions.awaitDialogOpenSet(false))
      expect(state.awaitDialogOpen).toBe(false)
    })
  })

  describe('bootstrapSet', () => {
    it('should set bootstrapped to true', () => {
      const state = uiReducer(uiInitialState, uiActions.bootstrapSet(true))
      expect(state.bootstrapped).toBe(true)
    })
  })

  describe('menusSet', () => {
    it('should set menus array', () => {
      const menus = [{ id: 'menu-1', items: [] }] as never[]
      const state = uiReducer(uiInitialState, uiActions.menusSet({ menus }))
      expect(state.menus).toEqual(menus)
    })

    it('should set menus to null', () => {
      const state = uiReducer(uiInitialState, uiActions.menusSet({ menus: null }))
      expect(state.menus).toBeNull()
    })
  })

  describe('setIsShowingUnauthorizedAlert', () => {
    it('should set isShowingUnauthorizedAlert to true', () => {
      const state = uiReducer(uiInitialState, uiActions.setIsShowingUnauthorizedAlert(true))
      expect(state.isShowingUnauthorizedAlert).toBe(true)
    })
  })

  describe('themeModeSet', () => {
    it('should set theme to dark', () => {
      const state = uiReducer(uiInitialState, uiActions.themeModeSet('dark'))
      expect(state.theme).toBe('dark')
    })

    it('should set theme to light', () => {
      const state = uiReducer(uiInitialState, uiActions.themeModeSet('light'))
      expect(state.theme).toBe('light')
    })
  })

  describe('toggleMenuSet', () => {
    it('should open menu', () => {
      const state = uiReducer(uiInitialState, uiActions.toggleMenuSet(true))
      expect(state.menuOpen).toBe(true)
    })

    it('should close menu', () => {
      const open = { ...uiInitialState, menuOpen: true }
      const state = uiReducer(open, uiActions.toggleMenuSet(false))
      expect(state.menuOpen).toBe(false)
    })
  })

  describe('toggleMobileNotificationsOpenSet', () => {
    it('should set mobileNotiicationsOpen to true', () => {
      const state = uiReducer(uiInitialState, uiActions.toggleMobileNotificationsOpenSet(true))
      expect(state.mobileNotiicationsOpen).toBe(true)
    })
  })

  describe('togglePublicMenuSet', () => {
    it('should set publicMenuOpen to true', () => {
      const state = uiReducer(uiInitialState, uiActions.togglePublicMenuSet(true))
      expect(state.publicMenuOpen).toBe(true)
    })
  })

  describe('windowSizeSet', () => {
    it('should update windowWidth and windowHeight from window object', () => {
      const state = uiReducer(uiInitialState, uiActions.windowSizeSet())
      expect(typeof state.windowWidth).toBe('number')
      expect(typeof state.windowHeight).toBe('number')
    })
  })
})
