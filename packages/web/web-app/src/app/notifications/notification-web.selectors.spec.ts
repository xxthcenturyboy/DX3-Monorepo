import { notificationInitialState } from './notification-web.reducer'
import {
  selectNotificationCount,
  selectSystemNotificationCount,
  selectUserNotificationCount,
} from './notification-web.selectors'
import type { NotificationStateType } from './notification-web.types'

type MockRootState = {
  notification: NotificationStateType
}

const createMockState = (overrides: Partial<NotificationStateType> = {}): MockRootState => ({
  notification: { ...notificationInitialState, ...overrides },
})

describe('notification selectors', () => {
  describe('selectSystemNotificationCount', () => {
    it('should return 0 when no system notifications', () => {
      const state = createMockState()
      expect(selectSystemNotificationCount(state as never)).toBe(0)
    })

    it('should return count of system notifications', () => {
      const state = createMockState({
        system: [{ id: '1' }, { id: '2' }] as never[],
      })
      expect(selectSystemNotificationCount(state as never)).toBe(2)
    })
  })

  describe('selectUserNotificationCount', () => {
    it('should return 0 when no user notifications', () => {
      const state = createMockState()
      expect(selectUserNotificationCount(state as never)).toBe(0)
    })

    it('should return count of user notifications', () => {
      const state = createMockState({ user: [{ id: 'u1' }] as never[] })
      expect(selectUserNotificationCount(state as never)).toBe(1)
    })
  })

  describe('selectNotificationCount', () => {
    it('should return 0 when no notifications', () => {
      const state = createMockState()
      expect(selectNotificationCount(state as never)).toBe(0)
    })

    it('should return sum of system and user notification counts', () => {
      const state = createMockState({
        system: [{ id: 's1' }, { id: 's2' }] as never[],
        user: [{ id: 'u1' }] as never[],
      })
      expect(selectNotificationCount(state as never)).toBe(3)
    })
  })
})
