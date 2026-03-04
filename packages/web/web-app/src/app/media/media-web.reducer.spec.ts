import { mediaActions, mediaInitialState, mediaReducer } from './media-web.reducer'

describe('mediaReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = mediaReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(mediaInitialState)
  })

  it('should have correct initial state', () => {
    expect(mediaInitialState).toEqual({ media: [] })
  })

  describe('addMediaItem', () => {
    it('should add a media item to the array', () => {
      const item = { id: 'abc', url: 'http://example.com/img.jpg' } as never
      const state = mediaReducer(mediaInitialState, mediaActions.addMediaItem(item))
      expect(state.media).toHaveLength(1)
      expect(state.media[0]).toEqual(item)
    })

    it('should append items without replacing', () => {
      const item1 = { id: '1' } as never
      const item2 = { id: '2' } as never
      let state = mediaReducer(mediaInitialState, mediaActions.addMediaItem(item1))
      state = mediaReducer(state, mediaActions.addMediaItem(item2))
      expect(state.media).toHaveLength(2)
    })
  })

  describe('removeMediaItem', () => {
    it('should remove item by id', () => {
      const withItems = {
        ...mediaInitialState,
        media: [{ id: 'keep' }, { id: 'remove' }] as never[],
      }
      const state = mediaReducer(withItems, mediaActions.removeMediaItem('remove'))
      expect(state.media).toHaveLength(1)
      expect(state.media[0]).toEqual({ id: 'keep' })
    })

    it('should not change state if id not found', () => {
      const withItem = { ...mediaInitialState, media: [{ id: 'existing' }] as never[] }
      const state = mediaReducer(withItem, mediaActions.removeMediaItem('nonexistent'))
      expect(state.media).toHaveLength(1)
    })
  })

  describe('setMediaAll', () => {
    it('should replace all media items', () => {
      const withItems = { ...mediaInitialState, media: [{ id: '1' }] as never[] }
      const newItems = [{ id: '2' }, { id: '3' }] as never[]
      const state = mediaReducer(withItems, mediaActions.setMediaAll(newItems))
      expect(state.media).toHaveLength(2)
      expect(state.media[0]).toEqual({ id: '2' })
    })

    it('should clear all media when given empty array', () => {
      const withItems = { ...mediaInitialState, media: [{ id: '1' }] as never[] }
      const state = mediaReducer(withItems, mediaActions.setMediaAll([]))
      expect(state.media).toHaveLength(0)
    })
  })
})
