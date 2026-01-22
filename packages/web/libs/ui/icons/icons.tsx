import Accessibility from '@mui/icons-material/Accessibility'
import Article from '@mui/icons-material/Article'
import Check from '@mui/icons-material/Check'
import CheckBox from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank'
import Dashboard from '@mui/icons-material/Dashboard'
import Flag from '@mui/icons-material/Flag'
import HealthAndSafety from '@mui/icons-material/HealthAndSafety'
import Help from '@mui/icons-material/Help'
import Home from '@mui/icons-material/Home'
import Info from '@mui/icons-material/Info'
import ManageAccounts from '@mui/icons-material/ManageAccounts'
import MenuOpen from '@mui/icons-material/MenuOpen'
import People from '@mui/icons-material/People'
import PeopleOutline from '@mui/icons-material/PeopleOutline'
import QueryStats from '@mui/icons-material/QueryStats'
import type React from 'react'

import { IconNames } from './enums'

export const getIcon = (name: IconNames, color?: string): React.ReactElement | null => {
  if (name === IconNames.ACCESSIBLITY) {
    return <Accessibility style={{ color }} />
  }
  if (name === IconNames.ARTICLE) {
    return <Article style={{ color }} />
  }
  if (name === IconNames.CHECK) {
    return <Check style={{ color }} />
  }
  if (name === IconNames.CHECKBOX) {
    return <CheckBox style={{ color }} />
  }
  if (name === IconNames.CHECKBOX_OUTLINED_BLANK) {
    return <CheckBoxOutlineBlank style={{ color }} />
  }
  if (name === IconNames.DASHBOARD) {
    return <Dashboard style={{ color }} />
  }
  if (name === IconNames.FLAG) {
    return <Flag style={{ color }} />
  }
  if (name === IconNames.HEALTHZ) {
    return <HealthAndSafety style={{ color }} />
  }
  if (name === IconNames.HELP) {
    return <Help style={{ color }} />
  }
  if (name === IconNames.HOME) {
    return <Home style={{ color }} />
  }
  if (name === IconNames.INFO) {
    return <Info style={{ color }} />
  }
  if (name === IconNames.MANAGE_ACCOUNTS) {
    return <ManageAccounts style={{ color }} />
  }
  if (name === IconNames.MENU_OPEN) {
    return <MenuOpen style={{ color }} />
  }
  if (name === IconNames.PEOPLE) {
    return <People style={{ color }} />
  }
  if (name === IconNames.PEOPLE_OUTLINE) {
    return <PeopleOutline style={{ color }} />
  }
  if (name === IconNames.STATS) {
    return <QueryStats style={{ color }} />
  }

  return null
}
