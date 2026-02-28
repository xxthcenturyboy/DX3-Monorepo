import Cached from '@mui/icons-material/Cached'
import Button from '@mui/material/Button'
import FilledInput from '@mui/material/FilledInput'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type * as React from 'react'
import { useRef, useState } from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { useFocus } from '@dx3/web-libs/ui/hooks/use-focus.hook'
import { debounce } from '@dx3/web-libs/utils/debounce'

import { useString, useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { DEBOUNCE } from '../../ui/ui-web.consts'
import { featureFlagAdminActions } from './feature-flag-admin-web.reducer'

type FeatureFlagAdminListHeaderComponentProps = {
  fetchFlags: (filterValue?: string) => Promise<void>
  onCreateClick: () => void
}

export const FeatureFlagAdminListHeaderComponent: React.FC<
  FeatureFlagAdminListHeaderComponentProps
> = (props) => {
  const [searchInputRef, _setSearchInputRef] = useFocus()
  const [filterVal, setFilterVal] = useState(
    useAppSelector((state) => state.featureFlagsAdmin.filterValue) || '',
  )
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const pageTitle = useString('FEATURE_FLAGS')
  const strings = useStrings(['CREATE', 'FILTER', 'TOOLTIP_REFRESH_LIST'])

  const debounceFetch = useRef(
    debounce((value: string) => {
      void props.fetchFlags(value)
      dispatch(featureFlagAdminActions.filterValueSet(value))
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
          sm: 4,
          xs: 12,
        },
        right: {
          sm: 8,
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
              minWidth: SM_BREAK ? '' : '300px',
              width: SM_BREAK ? '100%' : '300px',
            }}
          >
            <FormControl
              margin="none"
              style={{
                marginRight: SM_BREAK ? '24px' : '24px',
                // marginTop: 0,
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
                placeholder={strings.FILTER}
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
                  void props.fetchFlags()
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
          {/* Create Button */}
          {!MD_BREAK && (
            <Grid sx={{ marginLeft: '12px' }}>
              <Button
                color="primary"
                onClick={props.onCreateClick}
                variant="contained"
              >
                {strings.CREATE}
              </Button>
            </Grid>
          )}
        </Grid>
      }
      headerTitle={pageTitle}
    />
  )
}
