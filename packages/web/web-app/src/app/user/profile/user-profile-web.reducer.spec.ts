import { userProfileActions, userProfileInitialState, userProfileReducer } from './user-profile-web.reducer'

describe('userProfileReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = userProfileReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(userProfileInitialState)
  })

  it('should have correct initial state shape', () => {
    expect(userProfileInitialState.emails).toEqual([])
    expect(userProfileInitialState.phones).toEqual([])
    expect(userProfileInitialState.id).toBe('')
    expect(userProfileInitialState.a).toBe(false)
    expect(userProfileInitialState.sa).toBe(false)
  })

  describe('emailAddedToProfile', () => {
    it('should add an email to the profile', () => {
      const email = { default: false, id: 'e1', label: 'personal' } as never
      const state = userProfileReducer(
        userProfileInitialState,
        userProfileActions.emailAddedToProfile(email),
      )
      expect(state.emails).toHaveLength(1)
    })

    it('should clear default flag from other emails when new email is default', () => {
      const existingEmail = { default: true, id: 'e1' } as never
      const newDefault = { default: true, id: 'e2' } as never
      const withEmail = { ...userProfileInitialState, emails: [existingEmail] }
      const state = userProfileReducer(withEmail, userProfileActions.emailAddedToProfile(newDefault))
      expect(state.emails[0].default).toBe(false)
      expect(state.emails[1].default).toBe(true)
    })
  })

  describe('emailRemovedFromProfile', () => {
    it('should remove email by id', () => {
      const withEmails = {
        ...userProfileInitialState,
        emails: [{ id: 'e1' }, { id: 'e2' }] as never[],
      }
      const state = userProfileReducer(withEmails, userProfileActions.emailRemovedFromProfile('e1'))
      expect(state.emails).toHaveLength(1)
      expect(state.emails[0]).toEqual({ id: 'e2' })
    })
  })

  describe('phoneAddedToProfile', () => {
    it('should add a phone to the profile', () => {
      const phone = { default: false, id: 'p1', phone: '+1234567890' } as never
      const state = userProfileReducer(
        userProfileInitialState,
        userProfileActions.phoneAddedToProfile(phone),
      )
      expect(state.phones).toHaveLength(1)
    })
  })

  describe('phoneRemovedFromProfile', () => {
    it('should remove phone by id', () => {
      const withPhones = {
        ...userProfileInitialState,
        phones: [{ id: 'p1' }, { id: 'p2' }] as never[],
      }
      const state = userProfileReducer(withPhones, userProfileActions.phoneRemovedFromProfile('p1'))
      expect(state.phones).toHaveLength(1)
    })
  })

  describe('profileImageUpdate', () => {
    it('should set profileImage to a URL', () => {
      const state = userProfileReducer(
        userProfileInitialState,
        userProfileActions.profileImageUpdate('http://example.com/img.jpg'),
      )
      expect(state.profileImage).toBe('http://example.com/img.jpg')
    })

    it('should set profileImage to null', () => {
      const state = userProfileReducer(
        userProfileInitialState,
        userProfileActions.profileImageUpdate(null),
      )
      expect(state.profileImage).toBeNull()
    })
  })

  describe('profileInvalidated', () => {
    it('should reset user profile fields to initial values', () => {
      const loaded = {
        ...userProfileInitialState,
        emails: [{ id: 'e1' }] as never[],
        firstName: 'John',
        id: 'user-123',
        username: 'johndoe',
      }
      const state = userProfileReducer(loaded, userProfileActions.profileInvalidated())
      expect(state.id).toBe('')
      expect(state.firstName).toBe('')
      expect(state.emails).toEqual([])
    })
  })

  describe('profileUpdated', () => {
    it('should update all profile fields', () => {
      const profileData = {
        ...userProfileInitialState,
        firstName: 'Jane',
        id: 'user-456',
        lastName: 'Doe',
        username: 'janedoe',
      }
      const state = userProfileReducer(
        userProfileInitialState,
        userProfileActions.profileUpdated(profileData),
      )
      expect(state.firstName).toBe('Jane')
      expect(state.id).toBe('user-456')
      expect(state.username).toBe('janedoe')
    })
  })
})
