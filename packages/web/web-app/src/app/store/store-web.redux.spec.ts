import { store } from './store-web.redux'

jest.mock('../data/rtk-query')

describe('store', () => {
  it('should exist', () => {
    expect(store).toBeDefined()
  })
})
