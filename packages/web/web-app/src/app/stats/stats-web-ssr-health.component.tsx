import {
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  tableCellClasses,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { green, grey, red } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import type React from 'react'
import { useEffect, useState } from 'react'

import { CollapsiblePanel } from '@dx3/web-libs/ui/content/content-collapsible-panel'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'

import { useString, useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { selectCurrentThemeMode } from '../ui/store/ui-web.selector'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'

type SsrMetrics = {
  memory: {
    heapTotal: number
    heapUsed: number
    rss: number
  }
  metrics: Record<string, unknown>
  uptime: number
}

export const StatsWebSsrHealthComponent: React.FC = () => {
  const [metrics, setMetrics] = useState<SsrMetrics | null>(null)
  const [status, setStatus] = useState<'OK' | 'DOWN'>('DOWN')
  const [isLoading, setIsLoading] = useState(false)
  const themeMode = useAppSelector((state) => selectCurrentThemeMode(state))
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const pageTitle = useString('PAGE_TITLE_SSR_HEALTH')
  const strings = useStrings([
    'DOWN',
    'HEAP_TOTAL',
    'HEAP_USED',
    'OK',
    'RSS',
    'SSR_SERVER',
    'STATUS',
    'TOOLTIP_REFRESH_DATA',
    'UPTIME',
  ])

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      // Direct fetch to SSR server on port 3000
      const response = await fetch('http://localhost:3000/metrics')

      if (response.ok) {
        const data = (await response.json()) as SsrMetrics
        setMetrics(data)
        setStatus('OK')
      } else {
        setStatus('DOWN')
        setMetrics(null)
      }
    } catch (error) {
      setStatus('DOWN')
      setMetrics(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setDocumentTitle(pageTitle)
    void fetchMetrics()
  }, [pageTitle])

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor:
        themeMode === 'dark' ? theme.palette.common.black : theme.palette.primary.light,
      color: theme.palette.common.white,
      padding: '16px',
    },
    'tr:last-child &': {
      borderBottom: 'none',
    },
  }))

  return (
    <ContentWrapper
      contentTopOffset={SM_BREAK ? '61px' : '61px'}
      spacerDiv={true}
    >
      <ContentHeader
        gridDirection={'row'}
        headerColumnRightJustification={'flex-end'}
        headerColumnsBreaks={{
          left: {
            sm: 6,
          },
          right: {
            sm: 6,
          },
        }}
        headerContent={
          <Chip
            label={isLoading ? 'Loading...' : status}
            sx={{
              backgroundColor: status === 'OK' ? green[500] : red[600],
              color: grey[50],
            }}
          />
        }
        headerTitle={pageTitle}
      />

      <Grid
        container
        display={'block'}
        padding="24px"
        width={'100%'}
      >
        {/* SSR Server */}
        <Grid
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle={strings.SSR_SERVER}
            initialOpen={true}
            isLoading={isLoading}
            panelId="panel-ssr-health-server"
          >
            <Table
              id="ssr-server"
              size="medium"
            >
              <TableBody>
                <TableRow>
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>
                    {strings.STATUS}
                  </StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={status}
                      sx={{
                        backgroundColor: status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                {metrics && (
                  <>
                    <TableRow>
                      <StyledTableCell>{strings.HEAP_USED}</StyledTableCell>
                      <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                        {metrics.memory.heapUsed} MB
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>{strings.HEAP_TOTAL}</StyledTableCell>
                      <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                        {metrics.memory.heapTotal} MB
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>{strings.RSS}</StyledTableCell>
                      <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                        {metrics.memory.rss} MB
                      </StyledTableCell>
                    </TableRow>
                    <TableRow>
                      <StyledTableCell>{strings.UPTIME}</StyledTableCell>
                      <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                        {metrics.uptime}s
                      </StyledTableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </CollapsiblePanel>
        </Grid>
      </Grid>
    </ContentWrapper>
  )
}
