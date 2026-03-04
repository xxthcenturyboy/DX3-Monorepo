import {
  notificationActions,
  notificationInitialState,
  notificationReducer,
} from './notification-web.reducer'

describe('notificationReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = notificationReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(notificationInitialState)
  })

  it('should have correct initial state', () => {
    expect(notificationInitialState).toEqual({ system: [], user: [] })
  })

  describe('addSystemNotification', () => {
    it('should append a system notification', () => {
      const notif = { id: 'sys-1', message: 'System update' } as never
      const state = notificationReducer(
        notificationInitialState,
        notificationActions.addSystemNotification(notif),
      )
      expect(state.system).toHaveLength(1)
      expect(state.system[0]).toEqual(notif)
    })

    it('should not affect user notifications', () => {
      const notif = { id: 'sys-1' } as never
      const state = notificationReducer(
        notificationInitialState,
        notificationActions.addSystemNotification(notif),
      )
      expect(state.user).toHaveLength(0)
    })
  })

  describe('addUserNotification', () => {
    it('should append a user notification', () => {
      const notif = { id: 'usr-1', message: 'New message' } as never
      const state = notificationReducer(
        notificationInitialState,
        notificationActions.addUserNotification(notif),
      )
      expect(state.user).toHaveLength(1)
      expect(state.user[0]).toEqual(notif)
    })
  })

  describe('removeNotification', () => {
    it('should remove from system notifications by id', () => {
      const withNotifs = {
        system: [{ id: 'keep' }, { id: 'remove' }] as never[],
        user: [],
      }
      const state = notificationReducer(
        withNotifs,
        notificationActions.removeNotification('remove'),
      )
      expect(state.system).toHaveLength(1)
      expect(state.system[0]).toEqual({ id: 'keep' })
    })

    it('should remove from user notifications by id', () => {
      const withNotifs = {
        system: [],
        user: [{ id: 'keep' }, { id: 'remove' }] as never[],
      }
      const state = notificationReducer(
        withNotifs,
        notificationActions.removeNotification('remove'),
      )
      expect(state.user).toHaveLength(1)
    })
  })

  describe('setSystemNotifications', () => {
    it('should replace system notifications', () => {
      const notifs = [{ id: '1' }, { id: '2' }] as never[]
      const state = notificationReducer(
        notificationInitialState,
        notificationActions.setSystemNotifications(notifs),
      )
      expect(state.system).toHaveLength(2)
    })
  })

  describe('setUserNotifications', () => {
    it('should replace user notifications', () => {
      const notifs = [{ id: 'u1' }] as never[]
      const state = notificationReducer(
        notificationInitialState,
        notificationActions.setUserNotifications(notifs),
      )
      expect(state.user).toHaveLength(1)
    })
  })
})
