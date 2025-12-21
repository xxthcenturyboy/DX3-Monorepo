import Cached from '@mui/icons-material/Cached'
import {
  FilledInput,
  FormControl,
  Grid,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type * as React from 'react'
import { useRef } from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { useFocus } from '@dx3/web-libs/ui/system/hooks/use-focus.hook'
import { debounce } from '@dx3/web-libs/utils/debounce'

import type { RootState } from '../../store/store-web.redux'
import { useAppDispatch, useAppSelector } from '../../store/store-web.redux'
import { DEBOUNCE } from '../../ui/ui-web.consts'
import { userAdminActions } from './user-admin-web.reducer'

type UserAdminListHeaderComponentProps = {
  fetchUsers: (filterValue?: string) => Promise<void>
}

export const UserAdminListHeaderComponent: React.FC<UserAdminListHeaderComponentProps> = (
  props,
) => {
  const [searchInputRef, _setSearchInputRef] = useFocus()
  const filterValue = useAppSelector((state) => state.userAdmin.filterValue)
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const TITLE = useAppSelector((state: RootState) => state.ui.strings.UserListAdmin) || 'Users'

  const debounceFetch = useRef(
    debounce((value: string) => {
      void props.fetchUsers(value)
    }, DEBOUNCE),
  ).current

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    if (value !== filterValue) {
      debounceFetch(value)
    }
    dispatch(userAdminActions.filterValueSet(value))
  }

  return (
    <ContentHeader
      headerColumnRightJustification={SM_BREAK ? 'center' : 'flex-end'}
      headerColumnsBreaks={{
        left: {
          sm: 6,
          xs: 12,
        },
        right: {
          sm: 6,
          xs: 12,
        },
      }}
      headerContent={
        <Grid
          alignItems="center"
          container
          direction={SM_BREAK ? 'column-reverse' : 'row'}
          justifyContent={SM_BREAK ? 'center' : 'flex-end'}
          style={{
            marginRight: MD_BREAK ? '0px' : '24px',
          }}
        >
          {/* Filter */}
          <Grid
            alignItems={'center'}
            display={'flex'}
            justifyContent={'center'}
            sx={{
              minWidth: SM_BREAK ? '' : '360px',
              width: SM_BREAK ? '100%' : '360px',
            }}
          >
            <FormControl
              margin="none"
              style={{
                marginRight: SM_BREAK ? '24px' : '24px',
                marginTop: 0,
                width: SM_BREAK ? '300px' : '100%',
              }}
            >
              <FilledInput
                autoCorrect="off"
                fullWidth
                hiddenLabel
                id="input-filter"
                name="input-filter"
                onChange={handleFilterValueChange}
                placeholder={'Filter'}
                ref={searchInputRef}
                size="small"
                type="search"
                value={filterValue}
              />
            </FormControl>
            <span>
              <IconButton
                color="primary"
                onClick={(event: React.SyntheticEvent) => {
                  event.stopPropagation()
                  void props.fetchUsers()
                }}
                sx={{
                  boxShadow: 1,
                }}
              >
                <Tooltip title="Refresh List">
                  <Cached />
                </Tooltip>
              </IconButton>
            </span>
          </Grid>
          {/* New User */}
          {/* <Grid
            style={{
              width: SM_BREAK ? '100%' : '',
              marginBottom: SM_BREAK ? '20px' : ''
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`${ROUTES.ADMIN.USER.DETAIL}`)}
              disabled={userGetXhr}
              fullWidth={SM_BREAK}
            >
              Create User
            </Button>
          </Grid> */}
        </Grid>
      }
      headerTitle={TITLE}
    />
  )
}
