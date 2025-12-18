import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import { Box, IconButton, useTheme } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'

import { themeColors } from '../system/mui-overrides/styles'

interface TablePaginationActionsProps {
  count: number
  disabled?: boolean
  page: number
  rowsPerPage: number
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void
}

export function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme()
  const { count, disabled, page, rowsPerPage, onPageChange } = props
  const [lastOffset, setLastOffset] = useState<number>(0)

  useEffect(() => {
    const n = count !== undefined ? Math.max(0, Math.ceil(count / rowsPerPage) - 1) : 1
    setLastOffset(n)
  }, [count, rowsPerPage])

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (page === 0) {
      return
    }
    onPageChange(event, 0)
  }

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (page === 0) {
      return
    }
    onPageChange(event, page - 1)
  }

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (page === lastOffset) {
      return
    }
    onPageChange(event, page + 1)
  }

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (page === lastOffset) {
      return
    }
    onPageChange(event, lastOffset)
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        aria-label="first page"
        disabled={disabled || page === 0}
        onClick={handleFirstPageButtonClick}
        style={{
          color: page === 0 ? themeColors.dark.secondary : themeColors.primary,
        }}
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        aria-label="previous page"
        disabled={disabled || page === 0}
        onClick={handleBackButtonClick}
        style={{
          color: page === 0 ? themeColors.dark.secondary : themeColors.primary,
        }}
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        aria-label="next page"
        disabled={disabled || page >= lastOffset}
        onClick={handleNextButtonClick}
        style={{
          color: page >= lastOffset ? themeColors.dark.secondary : themeColors.primary,
        }}
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        aria-label="last page"
        disabled={disabled || page >= lastOffset}
        onClick={handleLastPageButtonClick}
        style={{
          color: page >= lastOffset ? themeColors.dark.secondary : themeColors.primary,
        }}
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  )
}
