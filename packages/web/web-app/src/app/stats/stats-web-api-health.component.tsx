import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { green, grey, red } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import type React from 'react'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

import { CollapsiblePanel } from '@dx3/web-libs/ui/content/content-collapsible-panel'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'

import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useString, useStrings } from '../i18n'
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
  const strings = useStrings([
    'ARRAY_BUFFERS',
    'DOWN',
    'EXTERNAL',
    'FAIL',
    'HEAP_TOTAL',
    'HEAP_USED',
    'NO_DATA',
    'OK',
    'PING',
    'READ',
    'RSS',
    'STATUS',
    'VERSION',
    'WRITE',
  ])
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
        toast.error(getErrorStringFromApiResponse(apiStatsError))
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
      // contentHeight={'calc(100vh - 80px)'}
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
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>
                    {strings.STATUS}
                  </StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.http?.status || strings.DOWN}
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
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>
                    {strings.STATUS}
                  </StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.memory?.status || strings.DOWN}
                      sx={{
                        backgroundColor: apiStats?.memory?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.ARRAY_BUFFERS}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.arrayBuffers || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.EXTERNAL}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.external || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.HEAP_TOTAL}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.heapTotal || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.HEAP_USED}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    {apiStats?.memory?.usage.heapUsed || 0}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.RSS}</StyledTableCell>
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
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>
                    {strings.STATUS}
                  </StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.postgres?.status || strings.NO_DATA}
                      sx={{
                        backgroundColor:
                          apiStats?.postgres?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.VERSION}</StyledTableCell>
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
                  <StyledTableCell width={MD_BREAK ? '80%' : '20%'}>
                    {strings.STATUS}
                  </StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.status || strings.DOWN}
                      sx={{
                        backgroundColor: apiStats?.redis?.status === 'OK' ? green[500] : grey[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.PING}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.profile.ping ? strings.OK : strings.FAIL}
                      sx={{
                        backgroundColor: apiStats?.redis?.profile.ping ? green[500] : red[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.READ}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.profile.read ? strings.OK : strings.FAIL}
                      sx={{
                        backgroundColor: apiStats?.redis?.profile.read ? green[500] : red[600],
                        color: grey[50],
                      }}
                    />
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{strings.WRITE}</StyledTableCell>
                  <StyledTableCell align={MD_BREAK ? 'right' : 'left'}>
                    <Chip
                      label={apiStats?.redis?.profile.write ? strings.OK : strings.FAIL}
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
