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
import { useEffect } from 'react'
import { toast } from 'react-toastify'

import { CollapsiblePanel } from '@dx3/web-libs/ui/content/content-collapsible-panel'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'

import { useString } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { selectCurrentThemeMode } from '../ui/store/ui-web.selector'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { StatsHeaderComponent } from './stats-header.component'
import { useLazyGetApiHealthzQuery } from './stats-web.api'
import { statsActions } from './stats-web.reducer'

export const StatsWebApiHealthComponent: React.FC = () => {
  const apiStats = useAppSelector((state) => state.stats.api)
  const themeMode = useAppSelector((state) => selectCurrentThemeMode(state))
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useAppDispatch()
  const pageTitle = useString('PAGE_TITLE_API_HEALTH')
  const [
    fetchApiStats,
    {
      data: apiStatsResponse,
      error: apiStatsError,
      isFetching: isLoadingApiStats,
      isSuccess: _apiStatsSuccess,
      isUninitialized: _apiStatsUninitialized,
    },
  ] = useLazyGetApiHealthzQuery()

  useEffect(() => {
    setDocumentTitle(pageTitle)
    void fetchApiStats()
  }, [pageTitle])

  useEffect(() => {
    if (!isLoadingApiStats) {
      if (!apiStatsError) {
        dispatch(statsActions.setApiStats(apiStatsResponse))
      }
      if (apiStatsError) {
        'error' in apiStatsError && toast.error(apiStatsError.error)
      }
    }
  }, [isLoadingApiStats, apiStatsError, apiStatsResponse])

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
      contentHeight={'calc(100vh - 80px)'}
      contentTopOffset={SM_BREAK ? '61px' : '61px'}
      spacerDiv={true}
    >
      <StatsHeaderComponent fetchApiStats={fetchApiStats} />
      <Grid
        container
        display={'block'}
        padding="24px"
        width={'100%'}
      >
        {/* HTTP */}
        <Grid
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle="HTTP"
            initialOpen={true}
            isLoading={isLoadingApiStats}
            panelId="panel-api-health-http"
          >
            <Table
              id="http"
              size="medium"
            >
              <TableBody>
                <TableRow>
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>Status</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.http?.status || 'Down'}
                      sx={{
                        backgroundColor: apiStats?.http?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsiblePanel>
        </Grid>

        {/* MEMORY */}
        <Grid
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle="MEMORY"
            initialOpen={true}
            isLoading={isLoadingApiStats}
            panelId="panel-api-health-memory"
          >
            <Table
              id="memory"
              size="medium"
            >
              <TableBody>
                <TableRow>
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>Status</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.memory?.status || 'Down'}
                      sx={{
                        backgroundColor: apiStats?.memory?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Array Buffers</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.arrayBuffers || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>External</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.external || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Heap Total</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.heapTotal || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Heap Used</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.heapUsed || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>RSS</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.rss || 0}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsiblePanel>
        </Grid>

        {/* POSTGRES */}
        <Grid
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle="POSTGRES"
            initialOpen={true}
            isLoading={isLoadingApiStats}
            panelId="panel-api-health-postgres"
          >
            <Table
              id="postgres"
              size="medium"
            >
              <TableBody>
                <TableRow>
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>Status</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.postgres?.status || 'No Data'}
                      sx={{
                        backgroundColor:
                          apiStats?.postgres?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Version</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.postgres?.version || '-'}
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsiblePanel>
        </Grid>

        {/* REDIS */}
        <Grid
          mb={'24px'}
          size={12}
        >
          <CollapsiblePanel
            headerTitle="REDIS"
            initialOpen={true}
            isLoading={isLoadingApiStats}
            panelId="panel-api-health-redis"
          >
            <Table
              id="redis"
              size="medium"
            >
              <TableBody>
                <TableRow>
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>Status</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.status || 'Down'}
                      sx={{
                        backgroundColor: apiStats?.redis?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Ping</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.profile.ping ? 'OK' : 'FAIL'}
                      sx={{
                        backgroundColor: apiStats?.redis?.profile.ping ? green[500] : red[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Read</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.profile.read ? 'OK' : 'FAIL'}
                      sx={{
                        backgroundColor: apiStats?.redis?.profile.read ? green[500] : red[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>Write</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.profile.write ? 'OK' : 'FAIL'}
                      sx={{
                        backgroundColor: apiStats?.redis?.profile.write ? green[500] : red[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsiblePanel>
        </Grid>
      </Grid>
    </ContentWrapper>
  )
}
