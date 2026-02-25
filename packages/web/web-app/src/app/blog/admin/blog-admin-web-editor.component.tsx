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
import FormatAlignCenter from '@mui/icons-material/FormatAlignCenter'
import FormatAlignLeft from '@mui/icons-material/FormatAlignLeft'
import FormatAlignRight from '@mui/icons-material/FormatAlignRight'
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined'
import { Box, Button, IconButton, Tooltip, useTheme } from '@mui/material'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router'
import { BeatLoader } from 'react-spinners'

import {
  BLOG_POST_STATUS,
  MEDIA_SUB_TYPES,
  MEDIA_VARIANTS,
  type MediaUploadResponseType,
  MIME_TYPE_BY_SUB_TYPE,
  MIME_TYPES,
} from '@dx3/models-shared'
import { slugify } from '@dx3/utils-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'
import { debounce } from '@dx3/web-libs/utils/debounce'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
import { MediaUploadModal } from '../../media/media-upload-modal.component'
import { useUploadContentMutation } from '../../media/media-web.api'
import { getPublicMediaUrl } from '../../media/media-web.util'
import { useAppDispatch, useAppSelector, useAppStore } from '../../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import {
  useCreateBlogPostMutation,
  useGetBlogAdminPostByIdQuery,
  useGetBlogCategoriesQuery,
  useGetBlogTagsQuery,
  useUpdateBlogPostMutation,
  useUpdateBlogPostPassiveMutation,
} from '../blog-web.api'
import {
  BlogAdminSettingsDrawerComponent,
  BlogAdminSettingsTriggerButton,
} from './blog-admin-settings-drawer.component'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'
import {
  selectBlogEditorBodyDirty,
  selectBlogEditorContent,
  selectBlogEditorIsDirty,
  selectBlogEditorSettings,
  selectBlogEditorTitle,
} from './blog-admin-web.selectors'
import { blogEditorBodyActions } from './blog-admin-web-body.reducer'
import { blogEditorSettingsActions } from './blog-admin-web-settings.reducer'
import { BlogEditorFooterComponent } from './blog-editor-footer.component'
import { BlogEditorTitleFieldComponent } from './blog-editor-title-field.component'
import { BlogImageEditDialog } from './blog-image-edit-dialog.component'
import { BlogLinkEditDialog } from './blog-link-edit-dialog.component'
import { BlogPostStatusChipComponent } from './blog-post-status-chip.component'

/**
 * When navigating to Preview (same post, different view), we skip clearing editor state
 * on unmount so that when the user returns, the state is preserved and we avoid phantom
 * dirty from MDXEditor's imagePlugin firing onChange after remount.
 */
let skipEditorClearOnUnmount = false

export const BlogAdminEditorComponent: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const editorRef = React.useRef<MDXEditorMethods>(null)
  const dispatchRef = React.useRef(dispatch)
  dispatchRef.current = dispatch
  const debouncedContentSet = React.useRef(
    debounce((markdown: string) => {
      dispatchRef.current(blogEditorBodyActions.contentSet(markdown))
    }, 300),
  ).current
  // MDXEditor plugins (e.g. imagePlugin URL escaping) fire onChange on load.
  // Ignore those to prevent phantom isDirty (see mdx-editor/editor#592).
  const ignoreChangeUntilRef = React.useRef(0)
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false)
  const [editorHeight, setEditorHeight] = React.useState(400)
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = React.useState(false)
  const [imageModalOpen, setImageModalOpen] = React.useState(false)
  const [pdfModalOpen, setPdfModalOpen] = React.useState(false)
  const [settingsDrawerOpen, setSettingsDrawerOpen] = React.useState(false)

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

  const content = useAppSelector(selectBlogEditorContent)
  const isBodyDirty = useAppSelector(selectBlogEditorBodyDirty)
  const isMobileWidth = useAppSelector(selectIsMobileWidth)
  const theme = useTheme()
  const windowHeight = useAppSelector(selectWindowHeight)

  // Initial editor height: fill viewport minus header, title field, buttons, padding
  // Use smaller overhead on mobile for more editor space
  const EDITOR_OVERHEAD_DESKTOP = 360
  const EDITOR_OVERHEAD_MOBILE = 260
  const editorOverhead = isMobileWidth ? EDITOR_OVERHEAD_MOBILE : EDITOR_OVERHEAD_DESKTOP
  React.useEffect(() => {
    if (windowHeight > 0) {
      const fillHeight = Math.max(200, Math.min(800, windowHeight - editorOverhead))
      setEditorHeight(fillHeight)
    }
  }, [editorOverhead, windowHeight])

  const strings = useStrings([
    'ALIGN_CENTER',
    'ALIGN_LEFT',
    'ALIGN_RIGHT',
    'BLOG_DISCARD_CHANGES_CONFIRM',
    'BLOG_EDITOR_TITLE',
    'BLOG_EDIT_POST_TITLE',
    'BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST',
    'BLOG_INSERT_IMAGE',
    'BLOG_INSERT_PDF',
    'BLOG_NEW_POST_TITLE',
    'BLOG_PDF_UPLOAD_SAVE_POST_FIRST',
    'BLOG_UNPUBLISH_TO_EDIT',
    'BLOG_UPLOAD_FEATURED_IMAGE',
    'CANCEL',
    'CANCELING',
    'DISCARD',
    'PREVIEW',
    'TITLE',
  ])
  const isNew = pathname.endsWith('/new') || !id

  const { data: post, isLoading: isLoadingPost } = useGetBlogAdminPostByIdQuery(id ?? '', {
    refetchOnMountOrArgChange: true,
    skip: isNew || !id,
  })
  const { data: categories = [] } = useGetBlogCategoriesQuery()
  const { data: tags = [] } = useGetBlogTagsQuery()
  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation()
  const [updatePostPassive] = useUpdateBlogPostPassiveMutation()
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

  const handleFeaturedImageModalClose = React.useCallback(
    () => setFeaturedImageModalOpen(false),
    [],
  )
  const handleFeaturedImageSuccess = React.useCallback(
    async (results: MediaUploadResponseType[]) => {
      const first = results[0]
      if (!first?.ok || !first.data?.id) return
      dispatch(blogEditorSettingsActions.settingsSet({ featuredImageId: first.data.id }))
      setFeaturedImageModalOpen(false)
      // Persist immediately: settings drawer closes before modal opens, so
      // BlogAdminSettingsComponent (debounced auto-save) is unmounted and never runs.
      if (id && post?.id) {
        const settings = selectBlogEditorSettings(store.getState())
        const slugifiedSlug = settings.slug
          ? slugify(settings.slug).trim() || undefined
          : undefined
        try {
          await updatePostPassive({
            id,
            payload: {
              canonicalUrl: settings.canonicalUrl || null,
              categories: settings.categories,
              excerpt: settings.excerpt || null,
              featuredImageId: first.data.id,
              isAnonymous: settings.isAnonymous,
              seoDescription: settings.seoDescription || null,
              seoTitle: settings.seoTitle || null,
              slug: slugifiedSlug,
              tags: settings.tags,
            },
          }).unwrap()
        } catch {
          // Error handled by RTK Query / toast
        }
      }
    },
    [dispatch, id, post?.id, store, updatePostPassive],
  )
  const handleFeaturedImageUpload = React.useCallback(
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
    debouncedContentSet.cancel()
    // Ignore onChange after load - imagePlugin fires onChange when images load (mdx-editor#592).
    // Use 4s for existing posts (often have images); 2s for new.
    const ignoreMs = post && !isNew ? 4000 : 2000
    ignoreChangeUntilRef.current = Date.now() + ignoreMs
    if (post) {
      dispatch(
        blogEditorBodyActions.bodyFormLoad({
          content: post.content,
          title: post.title,
        }),
      )
      dispatch(
        blogEditorSettingsActions.settingsFormLoad({
          canonicalUrl: post.canonicalUrl ?? '',
          categories: post.categories?.map((c) => c.id) ?? [],
          excerpt: post.excerpt ?? '',
          featuredImageId: post.featuredImageId ?? '',
          isAnonymous: post.isAnonymous ?? false,
          seoDescription: post.seoDescription ?? '',
          seoTitle: post.seoTitle ?? '',
          slug: post.slug ?? '',
          tags: post.tags?.map((t) => t.id) ?? [],
        }),
      )
    } else if (isNew) {
      dispatch(blogEditorBodyActions.bodyFormLoad({ content: '', title: '' }))
      dispatch(blogEditorSettingsActions.settingsFormLoad(undefined))
    }
  }, [debouncedContentSet, dispatch, isNew, post])

  // Clear editor state when navigating away (unmount). Skip when going to Preview
  // so that state is preserved for when user returns and we avoid phantom dirty.
  React.useEffect(() => {
    return () => {
      debouncedContentSet.cancel()
      if (skipEditorClearOnUnmount) {
        skipEditorClearOnUnmount = false
        return
      }
      dispatch(blogEditorBodyActions.bodyFormLoad({ content: '', title: '' }))
      dispatch(blogEditorSettingsActions.settingsFormLoad(undefined))
    }
  }, [debouncedContentSet, dispatch])

  const handleEditorChange = React.useCallback(
    (markdown: string) => {
      if (Date.now() < ignoreChangeUntilRef.current) return
      debouncedContentSet(markdown)
    },
    [debouncedContentSet],
  )

  // Use post.content (never Redux content) so the editor doesn't re-parse on every keystroke.
  // post.content is stable during a session; avoids input lag (mdx-editor/editor#839).
  const editorMarkdown = isNew ? '' : (post?.content ?? '')

  React.useEffect(() => {
    setDocumentTitle(
      isNew
        ? `${strings.BLOG_NEW_POST_TITLE} | ${strings.BLOG_EDITOR_TITLE}`
        : `${strings.BLOG_EDIT_POST_TITLE} | ${strings.BLOG_EDITOR_TITLE}`,
    )
  }, [isNew, strings.BLOG_EDITOR_TITLE, strings.BLOG_NEW_POST_TITLE, strings.BLOG_EDIT_POST_TITLE])

  const handleCancel = () => {
    const isDirty = selectBlogEditorIsDirty(store.getState())
    if (isDirty) {
      setCancelConfirmOpen(true)
      return
    }
    debouncedContentSet.cancel()
    navigate(BLOG_EDITOR_ROUTES.LIST)
  }

  const handleCancelConfirm = (confirmed: boolean) => {
    setCancelConfirmOpen(false)
    if (confirmed) {
      debouncedContentSet.cancel()
      navigate(BLOG_EDITOR_ROUTES.LIST)
    }
  }

  const isReadOnly = post?.status === BLOG_POST_STATUS.PUBLISHED

  const handleSave = async () => {
    const title = selectBlogEditorTitle(store.getState())
    if (!title.trim()) return

    debouncedContentSet.cancel()
    const latestContent = editorRef.current?.getMarkdown?.() ?? content
    const settings = selectBlogEditorSettings(store.getState())
    const slugifiedSlug = settings.slug ? slugify(settings.slug).trim() || undefined : undefined

    try {
      if (isNew) {
        const result = await createPost({
          content: latestContent || '',
          title: title.trim(),
          ...(settings.excerpt && { excerpt: settings.excerpt }),
          ...(settings.categories.length > 0 && {
            categories: settings.categories,
          }),
          ...(settings.featuredImageId && {
            featuredImageId: settings.featuredImageId,
          }),
          ...(settings.tags.length > 0 && { tags: settings.tags }),
          ...(settings.isAnonymous && { isAnonymous: true }),
        }).unwrap()
        navigate(`${BLOG_EDITOR_ROUTES.EDIT}/${result.id}`)
      } else if (id) {
        await updatePost({
          id,
          payload: {
            canonicalUrl: settings.canonicalUrl || null,
            categories: settings.categories,
            content: latestContent || '',
            excerpt: settings.excerpt || null,
            featuredImageId: settings.featuredImageId || null,
            isAnonymous: settings.isAnonymous,
            seoDescription: settings.seoDescription || null,
            seoTitle: settings.seoTitle || null,
            slug: slugifiedSlug || undefined,
            tags: settings.tags,
            title: title.trim(),
          },
        }).unwrap()
        const savedSlug = (slugifiedSlug || settings.slug) ?? ''
        dispatch(
          blogEditorBodyActions.bodyFormLoad({
            content: latestContent || '',
            title: title.trim(),
          }),
        )
        dispatch(
          blogEditorSettingsActions.settingsFormLoad({
            canonicalUrl: settings.canonicalUrl,
            categories: settings.categories,
            excerpt: settings.excerpt,
            featuredImageId: settings.featuredImageId,
            isAnonymous: settings.isAnonymous,
            seoDescription: settings.seoDescription,
            seoTitle: settings.seoTitle,
            slug: savedSlug,
            tags: settings.tags,
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
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
            <BlogAdminSettingsTriggerButton onClick={() => setSettingsDrawerOpen(true)} />
            {!isNew && id && (
              <Button
                disabled={isBodyDirty}
                onClick={() => {
                  if (!isBodyDirty) {
                    skipEditorClearOnUnmount = true
                    navigate(`${BLOG_EDITOR_ROUTES.PREVIEW}/${id}`)
                  }
                }}
                size="small"
                variant="outlined"
              >
                {strings.PREVIEW}
              </Button>
            )}
          </Box>
        }
        headerTitle={
          isNew ? (
            strings.BLOG_NEW_POST_TITLE
          ) : post?.status ? (
            <BlogPostStatusChipComponent status={post.status} />
          ) : (
            strings.BLOG_EDIT_POST_TITLE
          )
        }
        navigation={handleCancel}
      />

      <Box padding={'0px 24px 24px'}>
        <BlogEditorTitleFieldComponent disabled={!!isReadOnly || isSaving} />

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
                markdown={editorMarkdown}
                onChange={handleEditorChange}
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
                            isReadOnly
                              ? strings.BLOG_UNPUBLISH_TO_EDIT
                              : !post?.id
                                ? strings.BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST
                                : strings.BLOG_INSERT_IMAGE
                          }
                        >
                          <span>
                            <IconButton
                              aria-label={strings.BLOG_INSERT_IMAGE}
                              disabled={!!isReadOnly || !post?.id || isSaving}
                              onClick={() => setImageModalOpen(true)}
                              size="small"
                            >
                              <AddPhotoAlternateOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            isReadOnly
                              ? strings.BLOG_UNPUBLISH_TO_EDIT
                              : !post?.id
                                ? strings.BLOG_PDF_UPLOAD_SAVE_POST_FIRST
                                : strings.BLOG_INSERT_PDF
                          }
                        >
                          <span>
                            <IconButton
                              aria-label={strings.BLOG_INSERT_PDF}
                              disabled={!!isReadOnly || !post?.id || isSaving}
                              onClick={() => setPdfModalOpen(true)}
                              size="small"
                            >
                              <PictureAsPdfOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <InsertThematicBreak />
                        <Tooltip title={strings.ALIGN_LEFT}>
                          <span>
                            <IconButton
                              aria-label={strings.ALIGN_LEFT}
                              onClick={() => {
                                const sel = editorRef.current?.getSelectionMarkdown?.() ?? ''
                                editorRef.current?.insertMarkdown?.(
                                  sel ? `<p align="left">${sel}</p>` : '<p align="left"></p>',
                                )
                              }}
                              size="small"
                            >
                              <FormatAlignLeft fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={strings.ALIGN_CENTER}>
                          <span>
                            <IconButton
                              aria-label={strings.ALIGN_CENTER}
                              onClick={() => {
                                const sel = editorRef.current?.getSelectionMarkdown?.() ?? ''
                                editorRef.current?.insertMarkdown?.(
                                  sel ? `<p align="center">${sel}</p>` : '<p align="center"></p>',
                                )
                              }}
                              size="small"
                            >
                              <FormatAlignCenter fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={strings.ALIGN_RIGHT}>
                          <span>
                            <IconButton
                              aria-label={strings.ALIGN_RIGHT}
                              onClick={() => {
                                const sel = editorRef.current?.getSelectionMarkdown?.() ?? ''
                                editorRef.current?.insertMarkdown?.(
                                  sel ? `<p align="right">${sel}</p>` : '<p align="right"></p>',
                                )
                              }}
                              size="small"
                            >
                              <FormatAlignRight fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    ),
                  }),
                  markdownShortcutPlugin(),
                ]}
                readOnly={!!isReadOnly || isSaving}
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

        <BlogEditorFooterComponent
          isNew={isNew}
          isReadOnly={!!isReadOnly}
          isSaving={isSaving}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Box>

      <BlogAdminSettingsDrawerComponent
        categories={categories}
        isNew={isNew}
        isSaving={isSaving}
        onClose={() => setSettingsDrawerOpen(false)}
        onFeaturedImageClick={() => {
          setSettingsDrawerOpen(false)
          window.setTimeout(() => setFeaturedImageModalOpen(true), 150)
        }}
        onPublishSuccess={() => setSettingsDrawerOpen(false)}
        onScheduleSuccess={() => setSettingsDrawerOpen(false)}
        onUnpublishSuccess={() => setSettingsDrawerOpen(false)}
        onUnscheduleSuccess={() => {}}
        open={settingsDrawerOpen}
        postId={id}
        postPublishedAt={post?.publishedAt}
        postScheduledAt={post?.scheduledAt}
        postStatus={post?.status}
        postTitle={post?.title}
        tags={tags}
      />

      {createPortal(
        <CustomDialog
          body={
            <MediaUploadModal
              closeDialog={handleFeaturedImageModalClose}
              config={{
                allowedMimeTypes: MIME_TYPE_BY_SUB_TYPE[MEDIA_SUB_TYPES.IMAGE],
                maxFiles: 1,
                mediaTypeKey: 'MEDIA_TYPE_IMAGE',
                public: true,
                title: strings.BLOG_UPLOAD_FEATURED_IMAGE,
              }}
              isMobileWidth={isMobileWidth}
              onSuccess={handleFeaturedImageSuccess}
              onUpload={handleFeaturedImageUpload}
            />
          }
          closeDialog={handleFeaturedImageModalClose}
          isMobileWidth={isMobileWidth}
          open={featuredImageModalOpen}
        />,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}

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
