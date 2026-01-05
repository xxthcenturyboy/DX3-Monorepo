import type { ThemeOptions } from '@mui/material/styles'

import { dialogOverridesLight } from './dialog-light'
import {
  checkboxOverridesLight,
  filledInputOverridesLight,
  outlinedInputOverridesLight,
  textFieldOverridesLight,
} from './inputs-light'
import { listItemButtonOverridesLight, listItemOverridesLight } from './list-light'
import { toolbarItemOverridesLight } from './menus-light'

export const muiLightComponentOverrides: ThemeOptions['components'] = {
  MuiCheckbox: checkboxOverridesLight,
  MuiDialog: dialogOverridesLight,
  MuiFilledInput: filledInputOverridesLight,
  MuiListItem: listItemOverridesLight,
  MuiListItemButton: listItemButtonOverridesLight,
  MuiOutlinedInput: outlinedInputOverridesLight,
  MuiTextField: textFieldOverridesLight,
  MuiToolbar: toolbarItemOverridesLight,
}
