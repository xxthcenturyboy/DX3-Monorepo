import {
  blogEditorBodyActions,
  blogEditorBodyReducer,
  blogEditorListActions,
  blogEditorListReducer,
  blogEditorSettingsActions,
  blogEditorSettingsReducer,
} from './blog-admin-web.reducer'

describe('blog-admin-web.reducer', () => {
  it('should export body reducer and actions', () => {
    expect(blogEditorBodyReducer).toBeDefined()
    expect(blogEditorBodyActions.bodyFormLoad).toBeDefined()
    expect(blogEditorBodyActions.contentSet).toBeDefined()
    expect(blogEditorBodyActions.titleSet).toBeDefined()
  })

  it('should export list reducer and actions', () => {
    expect(blogEditorListReducer).toBeDefined()
    expect(blogEditorListActions.filterValueSet).toBeDefined()
    expect(blogEditorListActions.limitSet).toBeDefined()
    expect(blogEditorListActions.offsetSet).toBeDefined()
  })

  it('should export settings reducer and actions', () => {
    expect(blogEditorSettingsReducer).toBeDefined()
    expect(blogEditorSettingsActions.settingsFormLoad).toBeDefined()
    expect(blogEditorSettingsActions.settingsSet).toBeDefined()
  })
})
