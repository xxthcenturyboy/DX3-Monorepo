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
import { useRef, useState } from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { useFocus } from '@dx3/web-libs/ui/hooks/use-focus.hook'
import { debounce } from '@dx3/web-libs/utils/debounce'

import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web.redux'
import { DEBOUNCE } from '../../ui/ui-web.consts'
import { supportAdminActions } from '../store/support-admin-web.reducer'

type SupportAdminListHeaderComponentProps = {
  fetchRequests: (overrides?: { filterValue?: string }) => void
}

export const SupportAdminListHeaderComponent: React.FC<SupportAdminListHeaderComponentProps> = (
  props,
) => {
  const [searchInputRef, _setSearchInputRef] = useFocus()
  const [filterVal, setFilterVal] = useState(
    useAppSelector((state) => state.supportAdmin?.filterValue) || '',
  )
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const strings = useStrings([
    'SUPPORT_REQUESTS',
    'SUPPORT_SEARCH_PLACEHOLDER',
    'TOOLTIP_REFRESH_LIST',
  ])

  const debounceFetch = useRef(
    debounce((value: string) => {
      void props.fetchRequests({ filterValue: value })
      dispatch(supportAdminActions.filterValueSet(value))
    }, DEBOUNCE),
  ).current

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilterVal(e.target.value)
    debounceFetch(e.target.value || '')
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
          {/* Search */}
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
                placeholder={strings.SUPPORT_SEARCH_PLACEHOLDER}
                ref={searchInputRef}
                size="small"
                type="search"
                value={filterVal}
              />
            </FormControl>
            <span>
              <IconButton
                color="primary"
                onClick={(event: React.SyntheticEvent) => {
                  event.stopPropagation()
                  props.fetchRequests()
                }}
                sx={{
                  boxShadow: 1,
                }}
              >
                <Tooltip title={strings.TOOLTIP_REFRESH_LIST}>
                  <Cached />
                </Tooltip>
              </IconButton>
            </span>
          </Grid>
        </Grid>
      }
      headerTitle={strings.SUPPORT_REQUESTS}
    />
  )
}
