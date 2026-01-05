import type { ThemeOptions } from '@mui/material/styles'

import { dialogOverridesDark } from './dialog-dark'
import {
  checkboxOverridesDark,
  filledInputOverridesDark,
  outlinedInputOverridesDark,
  textFieldOverridesDark,
} from './inputs-dark'
import { listItemButtonOverridesDark, listItemOverridesDark } from './list-dark'
import { toolbarItemOverridesDark } from './menus-dark'

export const muiDarkComponentOverrides: ThemeOptions['components'] = {
  MuiCheckbox: checkboxOverridesDark,
  MuiDialog: dialogOverridesDark,
  MuiFilledInput: filledInputOverridesDark,
  MuiListItem: listItemOverridesDark,
  MuiListItemButton: listItemButtonOverridesDark,
  MuiOutlinedInput: outlinedInputOverridesDark,
  MuiTextField: textFieldOverridesDark,
  MuiToolbar: toolbarItemOverridesDark,
}
