import PhotoCamera from '@mui/icons-material/Photo'
import { Avatar, Badge, Grid, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React from 'react'

import { useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { selectProfileFormatted } from './user-profile-web.selectors'

type UserProfileAvatarPropTypes = {
  fontSize?: string
  justifyContent?: string
  size?: { height?: number; width?: number }
  handleChangeImage?: () => void
}

export const UserProfileAvatar: React.FC<UserProfileAvatarPropTypes> = (props) => {
  const { fontSize, handleChangeImage, justifyContent, size } = props
  const profile = useAppSelector((state) => selectProfileFormatted(state))
  const theme = useTheme()
  const strings = useStrings(['PROFILE'])

  React.useEffect(() => {
    setDocumentTitle(strings.PROFILE)
  }, [])

  return (
    <Grid
      container
      direction={'row'}
      display={'flex'}
      justifyContent={justifyContent || 'flex-start'}
    >
      {!!handleChangeImage && (
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          badgeContent={
            <IconButton
              color="primary"
              component="span"
            >
              <PhotoCamera
                color="secondary"
                style={{
                  padding: '5px',
                }}
              />
            </IconButton>
          }
          onClick={handleChangeImage}
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50%',
              boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              color: theme.palette.secondary.main,
              cursor: 'pointer',
              height: '25%',
              padding: '15%',
              width: '25%',
            },
          }}
          variant="standard"
        >
          <Avatar
            alt={profile.fullName}
            src={profile.profileImageUrl}
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.primary.main,
              fontSize: fontSize || '1rem',
              height: size?.height || 64,
              width: size?.width || 64,
            }}
            variant="circular"
          />
        </Badge>
      )}
      {!handleChangeImage && (
        <Avatar
          alt={profile.fullName}
          src={profile.profileImageUrl}
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            fontSize: fontSize || '1rem',
            height: size?.height || 64,
            width: size?.width || 64,
          }}
          variant="circular"
        />
      )}
    </Grid>
  )
}
