import PhotoCamera from '@mui/icons-material/Photo'
import { Avatar, Badge, Grid, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

import { APP_COLOR_PALETTE } from '@dx3/web-libs/ui/system/mui-overrides/styles'

import { useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { selectProfileFormatted } from './user-profile-web.selectors'

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: APP_COLOR_PALETTE.PRIMARY[700],
    borderRadius: '50%',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    color: APP_COLOR_PALETTE.PRIMARY[200],
    cursor: 'pointer',
    height: '25%',
    padding: '15%',
    width: '25%',
  },
}))

type UserProfileAvatarPropTypes = {
  fontSize?: string
  justifyContent?: string
  size?: { height?: number; width?: number }
  handleChangeImage?: () => void
}

export const UserProfileAvatar: React.FC<UserProfileAvatarPropTypes> = (props) => {
  const { fontSize, handleChangeImage, justifyContent, size } = props
  const profile = useAppSelector((state) => selectProfileFormatted(state))

  React.useEffect(() => {
    setDocumentTitle('Profile')
  }, [])

  return (
    <Grid
      container
      direction={'row'}
      display={'flex'}
      justifyContent={justifyContent || 'flex-start'}
    >
      {!!handleChangeImage && (
        <StyledBadge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          badgeContent={
            <IconButton
              component="span"
              sx={{
                color: APP_COLOR_PALETTE.SECONDARY[600],
              }}
            >
              <PhotoCamera
                style={{
                  padding: '5px',
                }}
              />
            </IconButton>
          }
          onClick={handleChangeImage}
          overlap="circular"
          variant="standard"
        >
          <Avatar
            alt={profile.fullName}
            src={profile.profileImageUrl}
            sx={{
              bgcolor: APP_COLOR_PALETTE.SECONDARY[600],
              color: APP_COLOR_PALETTE.PRIMARY[700],
              fontSize: fontSize || '1rem',
              height: size?.height || 64,
              width: size?.width || 64,
            }}
            variant="circular"
          />
        </StyledBadge>
      )}
      {!handleChangeImage && (
        <Avatar
          alt={profile.fullName}
          src={profile.profileImageUrl}
          sx={{
            bgcolor: APP_COLOR_PALETTE.SECONDARY[600],
            color: APP_COLOR_PALETTE.PRIMARY[700],
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
