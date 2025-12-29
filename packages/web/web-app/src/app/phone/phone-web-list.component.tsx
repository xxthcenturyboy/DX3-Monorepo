import Delete from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'
import { createPortal } from 'react-dom'

import type { PhoneType } from '@dx3/models-shared'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/system/ui.consts'

import { useStrings } from '../i18n'
import { AddPhoneDialog } from './phone-web-create.dialog'
import { DeletePhoneDialog } from './phone-web-delete.dialog'

export type UserPhonesProps = {
  phones?: PhoneType[]
  userId: string
  phoneDataCallback: (email: PhoneType) => void
  phoneDeleteCallback: (email: PhoneType) => void
}

export const Phonelist: React.FC<UserPhonesProps> = (props) => {
  const { phones, userId, phoneDataCallback, phoneDeleteCallback } = props
  const [phoneAddDialogOpen, setPhoneAddDialogOpen] = React.useState(false)
  const [phoneDeleteDialogOpen, setPhoneDeleteDialogOpen] = React.useState(false)
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const rowHeight = '32px'
  const strings = useStrings([
    'DEFAULT',
    'NEW_PHONE',
    'NO_DATA',
    'PHONES',
    'TOOLTIP_DELETE_PHONE',
    'VERIFIED',
  ])

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    minHeight: '100px',
    // '&:hover': {
    // backgroundColor: themeMode && themeMode === 'dark' ? theme.palette.primary.light : theme.palette.secondary.main,
    // }
  }))

  const phoneAddModal = createPortal(
    <CustomDialog
      body={
        <AddPhoneDialog
          closeDialog={() => setPhoneAddDialogOpen(false)}
          phoneDataCallback={phoneDataCallback}
          userId={userId}
        />
      }
      closeDialog={() => setPhoneAddDialogOpen(false)}
      isMobileWidth={SM_BREAK}
      open={phoneAddDialogOpen}
    />,
    document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
  )

  return (
    <Box
      margin="20px 0"
      width="100%"
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
        }}
      >
        <Grid
          alignItems="center"
          container
          justifyContent="space-between"
          marginBottom={'8px'}
        >
          {/* Title */}
          <Grid>
            <Typography
              color="primary"
              variant="h6"
            >
              {strings.PHONES}
            </Typography>
          </Grid>
          {/* New Phone */}
          <Grid>
            <Button
              color="primary"
              onClick={() => setPhoneAddDialogOpen(true)}
              size={'small'}
              variant="contained"
            >
              {strings.NEW_PHONE}
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <TableContainer component={Box}>
          <Table
            aria-label="User Phones Table"
            id="table-user-phones"
            size="small"
            stickyHeader
          >
            <TableBody>
              {!phones ||
                (phones && !phones.length && (
                  <StyledTableRow>
                    <TableCell
                      colSpan={3}
                      sx={{
                        color: 'primary',
                        fontSize: '42px',
                        height: '200px',
                        textAlign: 'center',
                      }}
                    >
                      {strings.NO_DATA}
                    </TableCell>
                  </StyledTableRow>
                ))}
              {!!phones &&
                !!phones.length &&
                phones.map((phone: PhoneType) => {
                  return (
                    <StyledTableRow
                      key={phone.id}
                      sx={{
                        // cursor: 'pointer',
                        height: rowHeight,
                      }}
                      // onClick={() => editPhone(phone)}
                    >
                      <TableCell
                        align="left"
                        sx={{
                          height: '20px',
                          textWrap: 'nowrap',
                        }}
                      >
                        {phone.uiFormatted || phone.phone}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          height: '20px',
                          textWrap: 'nowrap',
                        }}
                      >
                        {phone.label}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          flexDirection: 'row',
                          height: '32px',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {phone.isVerified && (
                          <Chip
                            color="success"
                            label={strings.VERIFIED}
                            sx={{
                              height: '20px',
                              marginRight: '10px',
                            }}
                          />
                        )}
                        {phone.default && (
                          <Chip
                            color="info"
                            label={strings.DEFAULT}
                            sx={{
                              height: '20px',
                              marginRight: '10px',
                            }}
                          />
                        )}
                        {!phone.default && (
                          <>
                            <Tooltip title={strings.TOOLTIP_DELETE_PHONE}>
                              <Delete
                                color="primary"
                                onClick={(event: React.SyntheticEvent) => {
                                  event.stopPropagation()
                                  setPhoneDeleteDialogOpen(true)
                                }}
                                style={{
                                  cursor: 'pointer',
                                  margin: '0 10 0 0',
                                  width: '0.75em',
                                }}
                              />
                            </Tooltip>
                            {createPortal(
                              <CustomDialog
                                body={
                                  <DeletePhoneDialog
                                    closeDialog={() => setPhoneDeleteDialogOpen(false)}
                                    phoneDataCallback={phoneDeleteCallback}
                                    phoneItem={phone}
                                  />
                                }
                                closeDialog={() => setPhoneDeleteDialogOpen(false)}
                                isMobileWidth={SM_BREAK}
                                open={phoneDeleteDialogOpen}
                              />,
                              document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
                            )}
                          </>
                        )}
                      </TableCell>
                    </StyledTableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {phoneAddModal}
    </Box>
  )
}
