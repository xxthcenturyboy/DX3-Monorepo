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
} from '@mui/material'
import type React from 'react'

import type { PhoneType } from '@dx3/models-shared'

import { useAppDispatch } from '../store/store-web-redux.hooks'
import { uiActions } from '../ui/store/ui-web.reducer'
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
  const dispatch = useAppDispatch()
  const rowHeight = '32px'

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
              Phones
            </Typography>
          </Grid>
          {/* New Phone */}
          <Grid>
            <Button
              color="primary"
              onClick={() =>
                dispatch(
                  uiActions.appDialogSet(
                    <AddPhoneDialog
                      phoneDataCallback={phoneDataCallback}
                      userId={userId}
                    />,
                  ),
                )
              }
              size={'small'}
              variant="contained"
            >
              New Phone
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
                      No Data
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
                            label="Verified"
                            sx={{
                              height: '20px',
                              marginRight: '10px',
                            }}
                          />
                        )}
                        {phone.default && (
                          <Chip
                            color="info"
                            label="Default"
                            sx={{
                              height: '20px',
                              marginRight: '10px',
                            }}
                          />
                        )}
                        {!phone.default && (
                          <Tooltip title="Delete Phone">
                            <Delete
                              color="primary"
                              onClick={(event: React.SyntheticEvent) => {
                                event.stopPropagation()
                                dispatch(
                                  uiActions.appDialogSet(
                                    <DeletePhoneDialog
                                      phoneDataCallback={phoneDeleteCallback}
                                      phoneItem={phone}
                                    />,
                                  ),
                                )
                              }}
                              style={{
                                cursor: 'pointer',
                                margin: '0 10 0 0',
                                width: '0.75em',
                              }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </StyledTableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
