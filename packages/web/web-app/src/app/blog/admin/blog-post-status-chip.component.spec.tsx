import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { BLOG_POST_STATUS } from '@dx3/models-shared'

import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'
import { BlogPostStatusChipComponent } from './blog-post-status-chip.component'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={BLOG_TEST_THEME}>{ui}</ThemeProvider>)

describe('BlogPostStatusChipComponent', () => {
  it('should render draft status chip', () => {
    renderWithTheme(<BlogPostStatusChipComponent status={BLOG_POST_STATUS.DRAFT} />)
    expect(screen.getByText('Draft')).toBeTruthy()
  })

  it('should render published status chip', () => {
    renderWithTheme(<BlogPostStatusChipComponent status={BLOG_POST_STATUS.PUBLISHED} />)
    expect(screen.getByText('Published')).toBeTruthy()
  })

  it('should render scheduled status chip', () => {
    renderWithTheme(<BlogPostStatusChipComponent status={BLOG_POST_STATUS.SCHEDULED} />)
    expect(screen.getByText('Scheduled')).toBeTruthy()
  })

  it('should render unpublished status chip', () => {
    renderWithTheme(<BlogPostStatusChipComponent status={BLOG_POST_STATUS.UNPUBLISHED} />)
    expect(screen.getByText('Unpublished')).toBeTruthy()
  })

  it('should render archived status chip', () => {
    renderWithTheme(<BlogPostStatusChipComponent status={BLOG_POST_STATUS.ARCHIVED} />)
    expect(screen.getByText('Archived')).toBeTruthy()
  })

  it('should render raw status when status has no mapping', () => {
    renderWithTheme(<BlogPostStatusChipComponent status="unknown-status" />)
    expect(screen.getByText('unknown-status')).toBeTruthy()
  })
})
