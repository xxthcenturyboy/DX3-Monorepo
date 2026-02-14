import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  InsertThematicBreak,
  imagePlugin,
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
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined'
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined'
import { Box, Button, IconButton, TextField, Tooltip, useTheme } from '@mui/material'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router'
import { BeatLoader } from 'react-spinners'

import {
  MEDIA_SUB_TYPES,
  MEDIA_VARIANTS,
  type MediaUploadResponseType,
  MIME_TYPE_BY_SUB_TYPE,
  MIME_TYPES,
} from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
import { MediaUploadModal } from '../../media/media-upload-modal.component'
import { useUploadContentMutation } from '../../media/media-web.api'
import { getPublicMediaUrl } from '../../media/media-web.util'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'
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
import { BlogImageEditDialog } from './blog-image-edit-dialog.component'
import { BlogLinkEditDialog } from './blog-link-edit-dialog.component'

export const BlogAdminEditorComponent: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const editorRef = React.useRef<MDXEditorMethods>(null)
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false)
  const [editorHeight, setEditorHeight] = React.useState(400)
  const [imageModalOpen, setImageModalOpen] = React.useState(false)
  const [pdfModalOpen, setPdfModalOpen] = React.useState(false)

  const handleResizeStart = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startY = e.clientY
      const startHeight = editorHeight
      const prevUserSelect = document.body.style.userSelect
      document.body.style.userSelect = 'none'

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY
        setEditorHeight(Math.max(200, Math.min(800, startHeight + delta)))
      }

      const handleMouseUp = () => {
        document.body.style.userSelect = prevUserSelect
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [editorHeight],
  )

  const title = useAppSelector(selectBlogEditorTitle)
  const content = useAppSelector(selectBlogEditorContent)
  const isDirty = useAppSelector(selectBlogEditorIsDirty)
  const isMobileWidth = useAppSelector(selectIsMobileWidth)
  const windowHeight = useAppSelector(selectWindowHeight)
  const theme = useTheme()

  // Initial editor height: fill viewport minus header, title field, buttons, padding
  const EDITOR_OVERHEAD_PX = 360
  React.useEffect(() => {
    if (windowHeight > 0) {
      const fillHeight = Math.max(200, Math.min(800, windowHeight - EDITOR_OVERHEAD_PX))
      setEditorHeight(fillHeight)
    }
  }, [windowHeight])

  const strings = useStrings([
    'BLOG',
    'BLOG_DISCARD_CHANGES_CONFIRM',
    'BLOG_EDITOR_TITLE',
    'BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST',
    'BLOG_INSERT_IMAGE',
    'BLOG_INSERT_PDF',
    'BLOG_PDF_UPLOAD_SAVE_POST_FIRST',
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
  const [uploadContent] = useUploadContentMutation()
  const apiUrl = WebConfigService.getWebUrls().API_URL

  const imageUploadHandler = React.useCallback(
    async (file: File): Promise<string> => {
      if (!id || !post?.id) {
        throw new Error(strings.BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST)
      }
      const result = await uploadContent({
        files: [file],
        mediaSubType: MEDIA_SUB_TYPES.IMAGE,
        ownerId: post.id,
        public: true,
      }).unwrap()
      const first = result[0]
      if (!first?.ok || !first.data?.id) {
        throw new Error('Upload failed')
      }
      return getPublicMediaUrl(apiUrl, first.data.id)
    },
    [apiUrl, id, post?.id, strings.BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST, uploadContent],
  )

  const handleImageModalClose = React.useCallback(() => setImageModalOpen(false), [])

  const handleImageUrlInsert = React.useCallback((url: string) => {
    editorRef.current?.insertMarkdown(`![](${url})`)
    setImageModalOpen(false)
  }, [])

  const handleImageSuccess = React.useCallback(
    (results: MediaUploadResponseType[]) => {
      const first = results[0]
      if (!first?.ok || !first.data?.id) return
      const url = getPublicMediaUrl(apiUrl, first.data.id, MEDIA_VARIANTS.MEDIUM)
      editorRef.current?.insertMarkdown(`![](${url})`)
      setImageModalOpen(false)
    },
    [apiUrl],
  )

  const handleImageUpload = React.useCallback(
    async ({
      files,
      public: isPublic,
    }: {
      files: File[]
      public: boolean
    }): Promise<MediaUploadResponseType[]> => {
      if (!post?.id) {
        throw new Error(strings.BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST)
      }
      return uploadContent({
        files,
        mediaSubType: MEDIA_SUB_TYPES.IMAGE,
        ownerId: post.id,
        public: isPublic,
      }).unwrap()
    },
    [post?.id, strings.BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST, uploadContent],
  )

  const handlePdfModalClose = React.useCallback(() => setPdfModalOpen(false), [])

  const handlePdfSuccess = React.useCallback(
    (results: MediaUploadResponseType[]) => {
      const first = results[0]
      if (!first?.ok || !first.data?.id) return
      const fileName = first.data.originalFileName ?? 'Download PDF'
      const url = getPublicMediaUrl(apiUrl, first.data.id, MEDIA_VARIANTS.ORIGINAL)
      editorRef.current?.insertMarkdown(`[${fileName}](${url})`)
      setPdfModalOpen(false)
    },
    [apiUrl],
  )

  const handlePdfUpload = React.useCallback(
    async ({
      files,
      public: isPublic,
    }: {
      files: File[]
      public: boolean
    }): Promise<MediaUploadResponseType[]> => {
      if (!post?.id) {
        throw new Error(strings.BLOG_PDF_UPLOAD_SAVE_POST_FIRST)
      }
      return uploadContent({
        files,
        mediaSubType: MEDIA_SUB_TYPES.DOCUMENT,
        ownerId: post.id,
        public: isPublic,
      }).unwrap()
    },
    [post?.id, strings.BLOG_PDF_UPLOAD_SAVE_POST_FIRST, uploadContent],
  )

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
    navigate(BLOG_EDITOR_ROUTES.LIST)
    sleep(1000).then(() => {
      dispatch(blogEditorActions.editorFormLoad({ content: '', title: '' }))
    })
  }

  const handleCancelConfirm = (confirmed: boolean) => {
    setCancelConfirmOpen(false)
    if (confirmed) {
      navigate(BLOG_EDITOR_ROUTES.LIST)
      dispatch(blogEditorActions.editorFormLoad({ content: '', title: '' }))
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
        forceRowOnMobile
        headerColumnRightJustification="flex-end"
        headerColumnsBreaks={{
          left: { md: 6, sm: 6, xs: 8 },
          right: { md: 6, sm: 6, xs: 4 },
        }}
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

      <Box padding={'0 24px 24px'}>
        <TextField
          fullWidth
          label={strings.TITLE}
          margin="normal"
          onChange={(e) => dispatch(blogEditorActions.titleSet(e.target.value))}
          required
          value={title}
          variant="outlined"
        />

        <Box
          data-testid="blog-editor-content"
          data-theme-mode={theme.palette.mode}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 200,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: editorHeight,
              minHeight: 200,
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 'min-content',
              }}
            >
              <MDXEditor
                key={isNew ? 'new' : id}
                markdown={!isNew && post && !isDirty ? post.content : content}
                onChange={(markdown) => dispatch(blogEditorActions.contentSet(markdown))}
                plugins={[
                  headingsPlugin(),
                  imagePlugin({
                    ImageDialog: BlogImageEditDialog,
                    imageUploadHandler,
                  }),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  linkPlugin(),
                  linkDialogPlugin({ LinkDialog: () => <BlogLinkEditDialog /> }),
                  markdownShortcutPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <BlockTypeSelect />
                        <ListsToggle />
                        <CreateLink />
                        <Tooltip
                          title={
                            !post?.id
                              ? strings.BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST
                              : strings.BLOG_INSERT_IMAGE
                          }
                        >
                          <span>
                            <IconButton
                              aria-label={strings.BLOG_INSERT_IMAGE}
                              disabled={!post?.id}
                              onClick={() => setImageModalOpen(true)}
                              size="small"
                            >
                              <AddPhotoAlternateOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            !post?.id
                              ? strings.BLOG_PDF_UPLOAD_SAVE_POST_FIRST
                              : strings.BLOG_INSERT_PDF
                          }
                        >
                          <span>
                            <IconButton
                              aria-label={strings.BLOG_INSERT_PDF}
                              disabled={!post?.id}
                              onClick={() => setPdfModalOpen(true)}
                              size="small"
                            >
                              <PictureAsPdfOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <InsertThematicBreak />
                      </>
                    ),
                  }),
                ]}
                ref={editorRef}
              />
            </Box>
          </Box>
          <Button
            aria-label="Resize editor"
            onMouseDown={handleResizeStart}
            style={{
              backgroundColor: theme.palette.divider,
              border: 'none',
              cursor: 'ns-resize',
              flexShrink: 0,
              height: 8,
              padding: 0,
              width: '100%',
            }}
            title="Drag to resize"
            type="button"
          />
        </Box>

        <Box
          display={'flex'}
          gap={'16px'}
          justifyContent={'flex-end'}
          marginTop={'24px'}
        >
          <Button
            disabled={isSaving || !isDirty || !title.trim()}
            onClick={handleSave}
            variant="contained"
          >
            {isSaving ? (
              <BeatLoader
                color={theme.palette.secondary.main}
                margin="2px"
                size={12}
              />
            ) : isNew ? (
              strings.CREATE
            ) : (
              strings.SAVE
            )}
          </Button>
          <Button
            disabled={isSaving}
            onClick={handleCancel}
            variant="outlined"
          >
            {isDirty ? strings.CANCEL : strings.CLOSE}
          </Button>
        </Box>
      </Box>

      {createPortal(
        <CustomDialog
          body={
            <MediaUploadModal
              closeDialog={handleImageModalClose}
              config={{
                allowedMimeTypes: MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.IMAGE],
                allowUrlInput: true,
                maxFiles: 1,
                mediaTypeKey: 'MEDIA_TYPE_IMAGE',
                public: true,
              }}
              isMobileWidth={isMobileWidth}
              onSuccess={handleImageSuccess}
              onUpload={handleImageUpload}
              onUrlInsert={handleImageUrlInsert}
            />
          }
          closeDialog={handleImageModalClose}
          isMobileWidth={isMobileWidth}
          open={imageModalOpen}
        />,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}

      {createPortal(
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

      {createPortal(
        <CustomDialog
          body={
            <MediaUploadModal
              closeDialog={handlePdfModalClose}
              config={{
                allowedMimeTypes: [MIME_TYPES.FILE.PDF],
                maxFiles: 1,
                mediaTypeKey: 'MEDIA_TYPE_PDF',
                public: true,
              }}
              isMobileWidth={isMobileWidth}
              onSuccess={handlePdfSuccess}
              onUpload={handlePdfUpload}
            />
          }
          closeDialog={handlePdfModalClose}
          isMobileWidth={isMobileWidth}
          open={pdfModalOpen}
        />,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}
    </ContentWrapper>
  )
}
