import GroupIcon from '@mui/icons-material/Group'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import TodayIcon from '@mui/icons-material/Today'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'

import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'

import { useI18n } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web.redux'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import {
  useLazyGetMetricsFeaturesQuery,
  useLazyGetMetricsGrowthQuery,
  useLazyGetMetricsStatusQuery,
} from './admin-metrics-web.api'
import {
  METRICS_DATE_RANGE_I18N_KEYS,
  METRICS_DATE_RANGES,
  type MetricsDateRangeType,
} from './admin-metrics-web.consts'
import { adminMetricsActions } from './admin-metrics-web.reducer'
import { selectAdminMetricsState } from './admin-metrics-web.selectors'
import { AdminMetricsDashboardHeaderComponent } from './admin-metrics-web-dashboard-header.component'
import { StatCard } from './admin-metrics-web-stat-card.component'
import type { MetricsFeatureUsageType, MetricsGrowthDataType } from './admin-metrics-web.types'

export const AdminMetricsDashboardComponent: React.FC = () => {
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const { translations: strings } = useI18n()
  const dispatch = useAppDispatch()

  // Redux state
  const { dateRange, isAvailable } = useAppSelector(selectAdminMetricsState)

  // Local state
  const [isFetching, setIsFetching] = useState(true)
  const [growth, setGrowth] = useState<MetricsGrowthDataType | null>(null)
  const [features, setFeatures] = useState<MetricsFeatureUsageType[]>([])

  const [fetchStatus] = useLazyGetMetricsStatusQuery()
  const [fetchGrowth] = useLazyGetMetricsGrowthQuery()
  const [fetchFeatures] = useLazyGetMetricsFeaturesQuery()

  useEffect(() => {
    setDocumentTitle(strings.ADMIN_METRICS_TITLE)
    void checkStatusAndFetch()
  }, [])

  const checkStatusAndFetch = async () => {
    const statusResult = await fetchStatus()
    if (statusResult.data?.isAvailable) {
      dispatch(adminMetricsActions.isAvailableSet(true))
      await fetchMetricsData()
    } else {
      dispatch(adminMetricsActions.isAvailableSet(false))
      setIsFetching(false)
    }
  }

  const fetchMetricsData = async (range?: MetricsDateRangeType) => {
    setIsFetching(true)
    const queryRange = range ?? dateRange

    const [growthResult, featuresResult] = await Promise.all([
      fetchGrowth({ range: queryRange }),
      fetchFeatures({ range: queryRange }),
    ])

    if (growthResult.data) {
      setGrowth(growthResult.data)
      dispatch(adminMetricsActions.growthSet(growthResult.data))
    }

    if (featuresResult.data) {
      setFeatures(featuresResult.data)
    }

    setIsFetching(false)
  }

  const handleDateRangeChange = (value: MetricsDateRangeType) => {
    dispatch(adminMetricsActions.dateRangeSet(value))
    void fetchMetricsData(value)
  }

  const handleRefresh = () => {
    void fetchMetricsData()
  }

  if (isAvailable === false) {
    return (
      <ContentWrapper
        contentHeight="calc(100vh - 80px)"
        contentTopOffset={SM_BREAK ? '124px' : '74px'}
      >
        <AdminMetricsDashboardHeaderComponent onRefresh={handleRefresh} />
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          padding="24px"
        >
          <Alert
            severity="warning"
            sx={{ maxWidth: '600px', width: '100%' }}
          >
            <Typography variant="body1">{strings.ADMIN_METRICS_UNAVAILABLE}</Typography>
          </Alert>
        </Grid>
      </ContentWrapper>
    )
  }

  if (isAvailable === null) {
    return (
      <ContentWrapper
        contentHeight="calc(100vh - 80px)"
        contentTopOffset={SM_BREAK ? '124px' : '74px'}
      >
        <AdminMetricsDashboardHeaderComponent onRefresh={handleRefresh} />
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          padding="48px"
        >
          <CircularProgress />
        </Grid>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper
      contentHeight="calc(100vh - 80px)"
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      <AdminMetricsDashboardHeaderComponent onRefresh={handleRefresh} />

      {/* Date Range Filter */}
      <Grid
        alignItems="center"
        container
        direction="row"
        justifyContent="center"
        padding="18px 24px 6px"
        spacing={0}
      >
        <Grid
          mb="24px"
          size={12}
        >
          <Paper
            elevation={2}
            square={false}
            sx={(theme) => ({
              alignItems: 'center',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.background.paper
                  : theme.palette.grey[100],
              padding: theme.spacing(3, 2, 3, 2),
            })}
            variant="outlined"
          >
            <Grid
              alignItems="center"
              container
              direction={SM_BREAK ? 'column' : 'row'}
              gap={2}
              justifyContent={SM_BREAK ? 'center' : 'flex-start'}
            >
              <FormControl
                size="small"
                sx={{ minWidth: 200 }}
              >
                <InputLabel>{strings.ADMIN_METRICS_DATE_RANGE}</InputLabel>
                <Select
                  label={strings.ADMIN_METRICS_DATE_RANGE}
                  onChange={(e) => handleDateRangeChange(e.target.value as MetricsDateRangeType)}
                  value={dateRange}
                >
                  {Object.entries(METRICS_DATE_RANGES).map(([key, value]) => (
                    <MenuItem
                      key={key}
                      value={value}
                    >
                      {strings[METRICS_DATE_RANGE_I18N_KEYS[value] as keyof typeof strings]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <Grid
        container
        padding="6px 24px 24px"
        spacing={3}
      >
        {/* User Activity Stats */}
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <StatCard
            icon={<TodayIcon />}
            label={strings.ADMIN_METRICS_DAU}
            loading={isFetching}
            value={growth?.dailyActiveUsers ?? 0}
          />
        </Grid>
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <StatCard
            icon={<TrendingUpIcon />}
            label={strings.ADMIN_METRICS_WAU}
            loading={isFetching}
            value={growth?.weeklyActiveUsers ?? 0}
          />
        </Grid>
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <StatCard
            icon={<GroupIcon />}
            label={strings.ADMIN_METRICS_MAU}
            loading={isFetching}
            value={growth?.monthlyActiveUsers ?? 0}
          />
        </Grid>
        <Grid size={{ md: 3, sm: 6, xs: 12 }}>
          <StatCard
            icon={<PersonAddIcon />}
            label={strings.ADMIN_METRICS_TOTAL_SIGNUPS}
            loading={isFetching}
            value={growth?.totalSignups ?? 0}
          />
        </Grid>

        {/* Signup Stats */}
        <Grid size={{ md: 6, sm: 6, xs: 12 }}>
          <StatCard
            icon={<PersonAddIcon />}
            label={strings.ADMIN_METRICS_SIGNUPS_7D}
            loading={isFetching}
            value={growth?.signupsLast7Days ?? 0}
          />
        </Grid>
        <Grid size={{ md: 6, sm: 6, xs: 12 }}>
          <StatCard
            icon={<PersonAddIcon />}
            label={strings.ADMIN_METRICS_SIGNUPS_30D}
            loading={isFetching}
            value={growth?.signupsLast30Days ?? 0}
          />
        </Grid>

        {/* Feature Usage - only show if there are features */}
        {features.length > 0 && (
          <Grid size={12}>
            <Typography
              sx={{ mb: 2, mt: 2 }}
              variant="h6"
            >
              {strings.ADMIN_METRICS_FEATURE_USAGE}
            </Typography>
            <Grid
              container
              spacing={2}
            >
              {features.map((feature) => (
                <Grid
                  key={feature.feature}
                  size={{ md: 3, sm: 6, xs: 12 }}
                >
                  <Card
                    elevation={1}
                    variant="outlined"
                  >
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                      >
                        {feature.feature}
                      </Typography>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          minHeight: 28, // Match h6 line-height to prevent shrinking
                        }}
                      >
                        {isFetching ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Typography variant="h6">{feature.count}</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </ContentWrapper>
  )
}
