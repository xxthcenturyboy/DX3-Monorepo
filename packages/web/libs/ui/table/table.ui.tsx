import { TableCell, TableRow, TableSortLabel, tableCellClasses } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledTableCell = styled(TableCell)<{
  thememode: string
}>(({ theme, thememode }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor:
      thememode === 'dark' ? theme.palette.common.black : theme.palette.primary.light,
    color: theme.palette.common.white,
    padding: '16px',
  },
}))

export const StyledEllipsisHeaderText = styled('div')({
  display: 'block',
  maxWidth: '150px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    // color: `white !important`
    color: `${theme.palette.secondary.light} !important`,
  },
  '&:hover': {
    color: `${theme.palette.secondary.light} !important`,
  },
  '&.Mui-active': {
    color: theme.palette.secondary.light,
  },
}))

export const StyledTableRow = styled(TableRow)<{
  loading: string
  thememode: string
  data?: string
}>(({ loading, theme, thememode }) => ({
  '&:hover': {
    backgroundColor:
      loading !== 'true'
        ? theme.palette.mode === 'dark'
          ? `${theme.palette.primary.light} !important`
          : `${theme.palette.secondary.dark} !important`
        : 'initial',
  },
  // hide last border
  // '&:last-child td, &:last-child th': {
  //   border: 0,
  // },
  // '&:nth-of-type(even)': {
  //   backgroundColor: loading === 'true' ? 'transparent' : theme.palette.action.hover,
  // },
  '&:nth-of-type(odd)': {
    backgroundColor:
      loading === 'true'
        ? 'transparent'
        : theme.palette.grey[theme.palette.mode === 'dark' ? 800 : 200],
  },
}))
