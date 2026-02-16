/**
 * Blog editor Redux: split into body, settings, and list for performance.
 * Re-exports combined actions for convenience.
 */

export {
  blogEditorBodyActions,
  blogEditorBodyReducer,
  type BlogEditorBodyStateType,
} from './blog-admin-web-body.reducer'
export {
  blogEditorListActions,
  blogEditorListReducer,
  type BlogEditorListStateType,
} from './blog-admin-web-list.reducer'
export {
  blogEditorSettingsActions,
  blogEditorSettingsReducer,
  type BlogEditorSettingsStateType,
} from './blog-admin-web-settings.reducer'
