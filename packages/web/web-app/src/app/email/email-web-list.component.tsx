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

import type { EmailType } from '@dx3/models-shared'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/system/ui.consts'

import { useStrings } from '../i18n'
import { AddEmailDialog } from './email-web-create.dialog'
import { DeleteEmailDialog } from './email-web-delete.dialog'

type EmailListPropsType = {
  emails: EmailType[]
  userId: string
  emailDataCallback: (email: EmailType) => void
  emailDeleteCallback: (email: EmailType) => void
}

export const EmailList: React.FC<EmailListPropsType> = (props) => {
  const { emails, userId, emailDataCallback, emailDeleteCallback } = props
  const [emailAddOpen, setEmailAddOpen] = React.useState(false)
  const [emailDeleteOpen, setEmailDeleteOpen] = React.useState(false)
  const rowHeight = '32px'
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const strings = useStrings([
    'DEFAULT',
    'EMAILS',
    'NEW_EMAIL',
    'NO_DATA',
    'TOOLTIP_DELETE_EMAIL',
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
    //   backgroundColor: themeMode && themeMode === 'dark' ? theme.palette.primary.light : theme.palette.secondary.main,
    // }
  }))

  const emailAddModal = createPortal(
    <CustomDialog
      body={
        <AddEmailDialog
          closeDialog={() => setEmailAddOpen(false)}
          emailDataCallback={emailDataCallback}
          userId={userId}
        />
      }
      closeDialog={() => setEmailAddOpen(false)}
      isMobileWidth={SM_BREAK}
      open={emailAddOpen}
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
              {strings.EMAILS}
            </Typography>
          </Grid>
          {/* New Email */}
          <Grid>
            <Button
              color="primary"
              onClick={() => setEmailAddOpen(true)}
              size={'small'}
              variant="contained"
            >
              {strings.NEW_EMAIL}
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <TableContainer component={Box}>
          <Table
            aria-label="User-Emails"
            id="table-user-emails"
            size="small"
            stickyHeader
          >
            <TableBody>
              {!emails ||
                (emails && !emails.length && (
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
              {!!emails &&
                !!emails.length &&
                emails.map((email: EmailType) => {
                  return (
                    <StyledTableRow
                      key={email.id}
                      sx={{
                        // cursor: 'pointer',
                        height: rowHeight,
                      }}
                      // onClick={() => editEmail(email)}
                    >
                      <TableCell
                        align="left"
                        sx={{
                          height: '20px',
                          textWrap: 'nowrap',
                        }}
                      >
                        {email.email}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          height: '20px',
                          textWrap: 'nowrap',
                        }}
                      >
                        {email.label}
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
                        {email.isVerified && (
                          <Chip
                            color="success"
                            label={strings.VERIFIED}
                            sx={{
                              height: '20px',
                              marginRight: '10px',
                            }}
                          />
                        )}
                        {email.default && (
                          <Chip
                            color="info"
                            label={strings.DEFAULT}
                            sx={{
                              height: '20px',
                              marginRight: '10px',
                            }}
                          />
                        )}
                        {!email.default && (
                          <>
                            <Tooltip title={strings.TOOLTIP_DELETE_EMAIL}>
                              <Delete
                                color="primary"
                                onClick={(event: React.SyntheticEvent) => {
                                  event.stopPropagation()
                                  setEmailDeleteOpen(true)
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
                                  <DeleteEmailDialog
                                    closeDialog={() => setEmailDeleteOpen(false)}
                                    emailDataCallback={emailDeleteCallback}
                                    emailItem={email}
                                  />
                                }
                                closeDialog={() => setEmailDeleteOpen(false)}
                                isMobileWidth={SM_BREAK}
                                open={emailDeleteOpen}
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
      {emailAddModal}
    </Box>
  )
}
