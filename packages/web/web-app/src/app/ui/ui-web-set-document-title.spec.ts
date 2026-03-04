import { APP_NAME } from '@dx3/models-shared'

import { setDocumentTitle } from './ui-web-set-document-title'

describe('setDocumentTitle', () => {
  it('should set document.title to APP_NAME when no title provided', () => {
    setDocumentTitle()
    expect(document.title).toBe(APP_NAME)
  })

  it('should set document.title to "APP_NAME - title" when title is provided', () => {
    setDocumentTitle('Dashboard')
    expect(document.title).toBe(`${APP_NAME} - Dashboard`)
  })

  it('should set document.title to "APP_NAME - title" with custom title', () => {
    setDocumentTitle('Admin Panel')
    expect(document.title).toBe(`${APP_NAME} - Admin Panel`)
  })

  it('should set to APP_NAME when title is undefined', () => {
    setDocumentTitle(undefined)
    expect(document.title).toBe(APP_NAME)
  })
})
