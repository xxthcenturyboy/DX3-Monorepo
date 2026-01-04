import type { PaletteMode } from '@mui/material'
import type { ThemeOptions } from '@mui/material/styles'

import { dialogOverridesDark } from './dark/dialog-dark'
import {
  checkboxOverridesDark,
  filledInputOverridesDark,
  outlinedInputOverridesDark,
  textFieldOverridesDark,
} from './dark/inputs-dark'
import { listItemButtonOverridesDark, listItemOverridesDark } from './dark/list-dark'
import { toolbarItemOverridesDark } from './dark/menus-dark'
import { dialogOverridesLight } from './light/dialog-light'
import {
  checkboxOverridesLight,
  filledInputOverridesLight,
  outlinedInputOverridesLight,
  textFieldOverridesLight,
} from './light/inputs-light'
import { listItemButtonOverridesLight, listItemOverridesLight } from './light/list-light'
import { toolbarItemOverridesLight } from './light/menus-light'

export function getComponentOverrides(mode: PaletteMode): ThemeOptions['components'] {
  if (mode === 'light') {
    return {
      MuiCheckbox: checkboxOverridesLight,
      MuiDialog: dialogOverridesLight,
      MuiFilledInput: filledInputOverridesLight,
      MuiListItem: listItemOverridesLight,
      MuiListItemButton: listItemButtonOverridesLight,
      MuiOutlinedInput: outlinedInputOverridesLight,
      MuiTextField: textFieldOverridesLight,
      MuiToolbar: toolbarItemOverridesLight,
    }
  } else {
    return {
      MuiCheckbox: checkboxOverridesDark,
      MuiDialog: dialogOverridesDark,
      MuiFilledInput: filledInputOverridesDark,
      MuiListItem: listItemOverridesDark,
      MuiListItemButton: listItemButtonOverridesDark,
      MuiOutlinedInput: outlinedInputOverridesDark,
      MuiTextField: textFieldOverridesDark,
      MuiToolbar: toolbarItemOverridesDark,
    }
  }
}
