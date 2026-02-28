import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type React from 'react'

type StatCardProps = {
  icon: React.ReactNode
  label: string
  loading?: boolean
  value: number | string
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, loading, value }) => {
  const theme = useTheme()

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        minWidth: 200,
      }}
    >
      <CardContent>
        <Box
          alignItems="center"
          display="flex"
          gap={2}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.dark
                  : theme.palette.primary.light,
              borderRadius: 2,
              color: theme.palette.primary.contrastText,
              display: 'flex',
              height: 48,
              justifyContent: 'center',
              width: 48,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {label}
            </Typography>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                minHeight: 32, // Match h5 line-height to prevent shrinking
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography variant="h5">{value}</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
