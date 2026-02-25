/**
 * Blog editor Redux: split into body, settings, and list for performance.
 * Re-exports combined actions for convenience.
 */

export {
  type BlogEditorBodyStateType,
  blogEditorBodyActions,
  blogEditorBodyReducer,
} from './blog-admin-web-body.reducer'
export {
  type BlogEditorListStateType,
  blogEditorListActions,
  blogEditorListReducer,
} from './blog-admin-web-list.reducer'
export {
  type BlogEditorSettingsStateType,
  blogEditorSettingsActions,
  blogEditorSettingsReducer,
} from './blog-admin-web-settings.reducer'
