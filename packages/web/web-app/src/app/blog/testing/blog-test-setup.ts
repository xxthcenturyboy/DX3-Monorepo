/**
 * Blog test setup - applies common mocks for blog specs.
 * Import as first statement in blog spec files that need these mocks:
 *   import '../testing/blog-test-setup'  // from blog/admin/
 *   import './testing/blog-test-setup'   // from blog/
 */
/// <reference types="jest" />

import {
  BLOG_CONFIG_MOCK,
  createI18nMock,
  createStoreMock,
} from './blog-test-mocks'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => createI18nMock())
jest.mock('../../store/store-web.redux', () => createStoreMock())
jest.mock('../../config/config-web.service', () => BLOG_CONFIG_MOCK)
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))
