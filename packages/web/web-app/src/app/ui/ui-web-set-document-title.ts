import { APP_NAME } from '@dx3/models-shared'

export const setDocumentTitle = (title?: string): void => {
  if (typeof document !== 'undefined') {
    const data = title ? `${APP_NAME} - ${title}` : APP_NAME
    document.title = data
  }
}
