import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const BLOG_EDITOR_BODY_ENTITY_NAME = 'blogEditorBody'

export type BlogEditorBodyStateType = {
  content: string
  initialContent: string
  initialTitle: string
  title: string
}

export const blogEditorBodyInitialState: BlogEditorBodyStateType = {
  content: '',
  initialContent: '',
  initialTitle: '',
  title: '',
}

const blogEditorBodySlice = createSlice({
  initialState: blogEditorBodyInitialState,
  name: BLOG_EDITOR_BODY_ENTITY_NAME,
  reducers: {
    bodyFormLoad(state, action: PayloadAction<{ content: string; title: string }>) {
      const { content, title } = action.payload
      state.content = content
      state.initialContent = content
      state.initialTitle = title
      state.title = title
    },
    contentSet(state, action: PayloadAction<string>) {
      state.content = action.payload
    },
    titleSet(state, action: PayloadAction<string>) {
      state.title = action.payload
    },
  },
})

export const blogEditorBodyActions = blogEditorBodySlice.actions
export const blogEditorBodyReducer = blogEditorBodySlice.reducer
