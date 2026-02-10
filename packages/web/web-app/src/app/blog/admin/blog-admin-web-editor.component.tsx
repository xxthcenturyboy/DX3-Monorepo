import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  InsertThematicBreak,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  type MDXEditorMethods,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { Button, TextField, useTheme } from '@mui/material'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { BeatLoader } from 'react-spinners'
import { useLocation, useNavigate, useParams } from 'react-router'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { selectIsMobileWidth } from '../../ui/store/ui-web.selector'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import {
  useCreateBlogPostMutation,
  useGetBlogAdminPostByIdQuery,
  useUpdateBlogPostMutation,
} from '../blog-web.api'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'
import { blogEditorActions } from './blog-admin-web.reducer'
import {
  selectBlogEditorContent,
  selectBlogEditorIsDirty,
  selectBlogEditorTitle,
} from './blog-admin-web.selectors'

export const BlogAdminEditorComponent: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const editorRef = React.useRef<MDXEditorMethods>(null)
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false)

  const title = useAppSelector(selectBlogEditorTitle)
  const content = useAppSelector(selectBlogEditorContent)
  const isDirty = useAppSelector(selectBlogEditorIsDirty)
  const isMobileWidth = useAppSelector(selectIsMobileWidth)
  const theme = useTheme()

  const strings = useStrings([
    'BLOG',
    'BLOG_DISCARD_CHANGES_CONFIRM',
    'BLOG_EDITOR_TITLE',
    'BLOG_EDIT_POST_TITLE',
    'BLOG_NEW_POST_TITLE',
    'CANCEL',
    'CANCELING',
    'CLOSE',
    'CREATE',
    'DISCARD',
    'PREVIEW',
    'SAVE',
    'TITLE',
  ])
  const isNew = pathname.endsWith('/new') || !id

  const { data: post, isLoading: isLoadingPost } = useGetBlogAdminPostByIdQuery(id ?? '', {
    refetchOnMountOrArgChange: true,
    skip: isNew || !id,
  })
  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation()

  const isSaving = isCreating || isUpdating

  React.useLayoutEffect(() => {
    if (post) {
      dispatch(
        blogEditorActions.editorFormLoad({
          content: post.content,
          title: post.title,
        }),
      )
    } else if (isNew) {
      dispatch(blogEditorActions.editorFormLoad({ content: '', title: '' }))
    }
  }, [dispatch, isNew, post])

  React.useEffect(() => {
    setDocumentTitle(
      isNew
        ? `${strings.BLOG_NEW_POST_TITLE} | ${strings.BLOG_EDITOR_TITLE}`
        : `${strings.BLOG_EDIT_POST_TITLE} | ${strings.BLOG_EDITOR_TITLE}`,
    )
  }, [isNew, strings.BLOG_EDITOR_TITLE, strings.BLOG_NEW_POST_TITLE, strings.BLOG_EDIT_POST_TITLE])

  const handleCancel = () => {
    if (isDirty) {
      setCancelConfirmOpen(true)
      return
    }
    dispatch(blogEditorActions.editorFormLoad({ content: '', title: '' }))
    navigate(BLOG_EDITOR_ROUTES.LIST)
  }

  const handleCancelConfirm = (confirmed: boolean) => {
    setCancelConfirmOpen(false)
    if (confirmed) {
      dispatch(blogEditorActions.editorFormLoad({ content: '', title: '' }))
      navigate(BLOG_EDITOR_ROUTES.LIST)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) return

    try {
      if (isNew) {
        const result = await createPost({ content: content || '', title: title.trim() }).unwrap()
        navigate(`${BLOG_EDITOR_ROUTES.EDIT}/${result.id}`)
      } else if (id) {
        await updatePost({
          id,
          payload: { content: content || '', title: title.trim() },
        }).unwrap()
        dispatch(
          blogEditorActions.editorFormLoad({
            content: content || '',
            title: title.trim(),
          }),
        )
      }
    } catch {
      // Error handled by RTK Query / toast
    }
  }

  if (!isNew && id && isLoadingPost) {
    return (
      <ContentWrapper
        contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
        contentTopOffset={isAuthenticated ? '82px' : undefined}
        spacerDiv={isAuthenticated}
      >
        <ContentHeader
          headerTitle={strings.BLOG_EDIT_POST_TITLE}
          navigation={() => navigate(BLOG_EDITOR_ROUTES.LIST)}
        />
        <div
          style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: 48 }}
        >
          <BeatLoader
            color={theme.palette.secondary.main}
            margin="2px"
            size={24}
          />
        </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
      spacerDiv={isAuthenticated}
    >
      <ContentHeader
        headerColumnRightJustification="flex-end"
        headerContent={
          !isNew && id ? (
            <Button
              disabled={isDirty}
              onClick={() => !isDirty && navigate(`${BLOG_EDITOR_ROUTES.PREVIEW}/${id}`)}
              variant="outlined"
            >
              {strings.PREVIEW}
            </Button>
          ) : undefined
        }
        headerTitle={isNew ? strings.BLOG_NEW_POST_TITLE : strings.BLOG_EDIT_POST_TITLE}
        navigation={handleCancel}
      />

      <div style={{ padding: 24 }}>
        <TextField
          fullWidth
          label={strings.TITLE}
          margin="normal"
          onChange={(e) => dispatch(blogEditorActions.titleSet(e.target.value))}
          required
          value={title}
          variant="outlined"
        />

        <div
          data-testid="blog-editor-content"
          style={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 8,
            minHeight: 400,
            overflow: 'hidden',
          }}
        >
          <MDXEditor
            key={isNew ? 'new' : id}
            markdown={
              !isNew && post && !isDirty ? post.content : content
            }
            onChange={(markdown) => dispatch(blogEditorActions.contentSet(markdown))}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <ListsToggle />
                    <CreateLink />
                    <InsertThematicBreak />
                  </>
                ),
              }),
            ]}
            ref={editorRef}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'flex-end',
            marginTop: 24,
          }}
        >
          <Button
            disabled={isSaving || !title.trim()}
            onClick={handleSave}
            variant="contained"
          >
            {isSaving ? (
              <BeatLoader
                color={theme.palette.secondary.main}
                margin="2px"
                size={12}
              />
            ) : (
              isNew ? strings.CREATE : strings.SAVE
            )}
          </Button>
          <Button
            disabled={isSaving}
            onClick={handleCancel}
            variant="outlined"
          >
            {isDirty ? strings.CANCEL : strings.CLOSE}
          </Button>
        </div>
      </div>

      {cancelConfirmOpen &&
        createPortal(
          <CustomDialog
            body={
              <ConfirmationDialog
                bodyMessage={strings.BLOG_DISCARD_CHANGES_CONFIRM}
                cancellingText={strings.CANCELING}
                cancelText={strings.CANCEL}
                okText={strings.DISCARD}
                onComplete={handleCancelConfirm}
              />
            }
            closeDialog={() => setCancelConfirmOpen(false)}
            isMobileWidth={isMobileWidth}
            open={cancelConfirmOpen}
          />,
          document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
        )}
    </ContentWrapper>
  )
}
