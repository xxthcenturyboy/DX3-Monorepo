import {
  Box,
  Collapse,
  Fade,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  // useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'

import { waveItem } from '../global/skeletons.ui'
import { getIcon, type IconNames } from '../system/icons'
import { BORDER_RADIUS, themeColors } from '../system/mui-overrides/styles'
import { FADE_TIMEOUT_DUR } from '../system/ui.consts'
import { TablePaginationActions } from './pagination.component'
import {
  StyledEllipsisHeaderText,
  StyledTableCell,
  StyledTableRow,
  StyledTableSortLabel,
} from './table.ui'
import type {
  TableCellData,
  TableComponentProps,
  TableDummyColumn,
  TableDummyRow,
  TableHeaderItem,
  TableRowType,
} from './types'

export const TableComponent: React.FC<TableComponentProps> = React.forwardRef((props, ref) => {
  const {
    borderRadius,
    changeLimit,
    changeOffset,
    changeSort,
    clickRow,
    count,
    header,
    hideFooter,
    isInitialized,
    loading,
    loadingColor,
    limit,
    maxHeight,
    offset,
    orderBy,
    rows,
    sortDir,
    tableName,
    themeMode,
  } = props
  const theme = useTheme()
  // const themeMode = theme.palette.mode
  const tableId = tableName?.toLowerCase().replace(' ', '-') || ''
  // const smBreak = useMediaQuery(theme.breakpoints.down('sm'));
  const [dummyData, setDummyData] = useState<TableDummyRow>([])
  const [rowsPerPageOptions, setRowsPerPageOptions] = useState<number[]>()
  const rowHeight = '32px'
  const order = sortDir === 'ASC' ? 'asc' : 'desc'

  useEffect(() => {
    getLoadingData()
    setupRowsPerPage()
  }, [])

  useEffect(() => {
    getLoadingData()
  }, [count, header, limit])

  const setupRowsPerPage = () => {
    const data: number[] = [10]
    if (count > 10) {
      data.push(25)
    }
    if (count > 25) {
      data.push(50)
    }
    if (count > 50) {
      data.push(100)
    }
    if (count > 100) {
      data.push(200)
    }
    if (count > 200) {
      data.push(500)
    }
    if (count > 500) {
      data.push(1000)
    }
    setRowsPerPageOptions(data)
  }

  const getLoadingData = () => {
    const rowData: TableDummyRow = []
    const columnData: TableDummyColumn = []
    header.map((_data, index) => {
      columnData.push(index)
    })
    const max = count > limit ? limit : count
    for (let i = 0; i < max; i += 1) {
      rowData.push(columnData)
    }
    setDummyData(rowData)
  }

  const getRowsPerPageValue = () => {
    const lastLegaValue = rowsPerPageOptions
      ? rowsPerPageOptions[rowsPerPageOptions?.length - 1 || 0]
      : 10
    return limit >= lastLegaValue ? lastLegaValue : limit
  }

  const renderIcon = (iconName: IconNames, color?: string) => {
    const Icon = getIcon(iconName, color)
    return Icon
  }

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    nextOffset: number,
  ) => {
    typeof changeOffset === 'function' && changeOffset(nextOffset)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextLimit = parseInt(event.target.value, 10)
    typeof changeLimit === 'function' && changeLimit(nextLimit)
    typeof changeOffset === 'function' && changeOffset(0)
  }

  const getDataToPopulate = (cell: TableCellData) => {
    switch (cell.componentType) {
      case 'text':
        return typeof cell.data === 'string' || typeof cell.data === 'number'
          ? cell.data
          : cell.originalStringValue
      case 'icon':
        return renderIcon(cell.icon as IconNames, cell.color)
      case 'checkbox':
        return cell.data as React.ReactElement
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: borderRadius || BORDER_RADIUS,
        width: '100%',
      }}
    >
      <Collapse in={isInitialized}>
        <Box
          padding="0"
          ref={ref}
          width="100%"
        >
          <TableContainer
            component={Box}
            style={{
              borderRadius: borderRadius || BORDER_RADIUS,
              maxHeight,
            }}
          >
            <Table
              aria-label="Table Component"
              id={tableId}
              size="small"
              stickyHeader
              sx={{
                // The sx prop is used here to allow for the use of the ::-webkit-scrollbar pseudo-element,
                // which is not supported in standard React inline styles.
                '::-webkit-scrollbar:vertical': {
                  display: maxHeight ? 'block' : 'none',
                },
                minWidth: 1200,
              }}
            >
              <TableHead>
                <TableRow>
                  {header.map((data: TableHeaderItem, _index: number) => {
                    return (
                      <StyledTableCell
                        align={data.align}
                        key={`table-header-cell-${tableId}-${data.fieldName}`}
                        sortDirection={orderBy === data.fieldName ? order : false}
                        sx={{
                          cursor: data.sortable ? 'pointer' : '',
                        }}
                        thememode={themeMode || 'light'}
                        width={data.width}
                      >
                        {data.sortable ? (
                          <StyledTableSortLabel
                            active={orderBy === data.fieldName}
                            direction={orderBy === data.fieldName ? order : 'asc'}
                            onClick={() =>
                              typeof changeSort === 'function' && changeSort(data.fieldName)
                            }
                          >
                            <StyledEllipsisHeaderText>{data.title} </StyledEllipsisHeaderText>
                          </StyledTableSortLabel>
                        ) : (
                          <StyledEllipsisHeaderText>{data.title} </StyledEllipsisHeaderText>
                        )}
                      </StyledTableCell>
                    )
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {isInitialized && !loading && !rows.length && (
                  <TableRow
                    sx={{
                      '&:hover': {
                        backgroundColor: 'default',
                      },
                      backgroundColor:
                        themeMode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
                      height: '100px',
                    }}
                  >
                    <TableCell
                      colSpan={header.length + 1}
                      sx={{
                        color: 'primary',
                        fontSize: '42px',
                        height: '200px',
                        textAlign: 'center',
                      }}
                    >
                      <Fade
                        in={true}
                        timeout={FADE_TIMEOUT_DUR}
                      >
                        <Typography variant="h2">No Data</Typography>
                      </Fade>
                    </TableCell>
                  </TableRow>
                )}
                {isInitialized &&
                  loading &&
                  dummyData.map((row, index) => {
                    return (
                      <StyledTableRow
                        data={`dummy-data-${index}`}
                        // biome-ignore lint/suspicious/noArrayIndexKey: needed here
                        key={`dummy-row-${index}`}
                        loading={loading ? 'true' : ''}
                        sx={{
                          height: rowHeight,
                        }}
                        thememode={themeMode || 'light'}
                      >
                        <TableCell
                          colSpan={row.length + 1}
                          // biome-ignore lint/suspicious/noArrayIndexKey: needed here
                          key={`dummy-cell-${index}`}
                          sx={{
                            minHeight: rowHeight,
                          }}
                        >
                          <Fade
                            in={true}
                            timeout={FADE_TIMEOUT_DUR}
                          >
                            {waveItem(rowHeight)}
                          </Fade>
                        </TableCell>
                      </StyledTableRow>
                    )
                  })}
                {!loading &&
                  rows.length > 0 &&
                  rows.map((row: TableRowType) => {
                    const clickable = !!clickRow && typeof clickRow === 'function'
                    return (
                      <StyledTableRow
                        data={row.testingKey || ''}
                        key={row.id}
                        loading={loading ? 'true' : ''}
                        onClick={() => clickRow?.(row)}
                        sx={{
                          cursor: clickable ? 'pointer' : '',
                          height: rowHeight,
                        }}
                        thememode={themeMode || 'light'}
                      >
                        {row.columns.map((cell: TableCellData, index: number) => {
                          return (
                            <TableCell
                              align={cell.align}
                              key={`table-data-cell-${row.id}-${index}`}
                              sx={{
                                height: rowHeight,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Fade
                                in={true}
                                timeout={FADE_TIMEOUT_DUR}
                              >
                                <span>{getDataToPopulate(cell)}</span>
                              </Fade>
                            </TableCell>
                          )
                        })}
                      </StyledTableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          {!hideFooter && (
            <Table>
              <TableFooter
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '12px',
                }}
              >
                <TableRow>
                  <TablePagination
                    ActionsComponent={TablePaginationActions}
                    colSpan={header.length + 1}
                    count={count}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    page={offset}
                    rowsPerPage={limit}
                    rowsPerPageOptions={count > 10 ? rowsPerPageOptions : undefined}
                    sx={{
                      borderBottom: 'none',
                      borderTop: 'none',
                      // borderTop: `1px solid ${theme.palette.grey[400]}`,
                      color: themeColors.primary,
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </Box>
      </Collapse>
      {!isInitialized && (
        <Box
          alignContent={'center'}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'center'}
          padding={6}
          width={'100%'}
        >
          <BeatLoader
            color={loadingColor || themeColors.secondary}
            margin="2px"
            size={24}
          />
        </Box>
      )}
    </Paper>
  )
})
