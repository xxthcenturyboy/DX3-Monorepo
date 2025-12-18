import { render } from '@testing-library/react'
import React from 'react'

import { IconNames } from './enums'
import { getIcon } from './icons'

// Mock MUI icons
jest.mock('@mui/icons-material/Accessibility', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="accessibility-icon"
      {...props}
    >
      Accessibility Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/Check', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="check-icon"
      {...props}
    >
      Check Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/CheckBox', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="checkbox-icon"
      {...props}
    >
      CheckBox Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/CheckBoxOutlineBlank', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="checkbox-outline-blank-icon"
      {...props}
    >
      CheckBoxOutlineBlank Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/Dashboard', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="dashboard-icon"
      {...props}
    >
      Dashboard Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/HealthAndSafety', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="health-and-safety-icon"
      {...props}
    >
      HealthAndSafety Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/ManageAccounts', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="manage-accounts-icon"
      {...props}
    >
      ManageAccounts Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/MenuOpen', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="menu-open-icon"
      {...props}
    >
      MenuOpen Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/People', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="people-icon"
      {...props}
    >
      People Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/PeopleOutline', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="people-outline-icon"
      {...props}
    >
      PeopleOutline Icon
    </div>
  ),
}))

jest.mock('@mui/icons-material/QueryStats', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="query-stats-icon"
      {...props}
    >
      QueryStats Icon
    </div>
  ),
}))

describe('icons', () => {
  describe('getIcon', () => {
    describe('Icon Rendering', () => {
      it('should return Accessibility icon for ACCESSIBLITY', () => {
        const icon = getIcon(IconNames.ACCESSIBLITY)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="accessibility-icon"]')).toBeInTheDocument()
      })

      it('should return Check icon for CHECK', () => {
        const icon = getIcon(IconNames.CHECK)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="check-icon"]')).toBeInTheDocument()
      })

      it('should return CheckBox icon for CHECKBOX', () => {
        const icon = getIcon(IconNames.CHECKBOX)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="checkbox-icon"]')).toBeInTheDocument()
      })

      it('should return CheckBoxOutlineBlank icon for CHECKBOX_OUTLINED_BLANK', () => {
        const icon = getIcon(IconNames.CHECKBOX_OUTLINED_BLANK)
        const { container } = render(icon)

        expect(
          container.querySelector('[data-testid="checkbox-outline-blank-icon"]'),
        ).toBeInTheDocument()
      })

      it('should return Dashboard icon for DASHBOARD', () => {
        const icon = getIcon(IconNames.DASHBOARD)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="dashboard-icon"]')).toBeInTheDocument()
      })

      it('should return HealthAndSafety icon for HEALTHZ', () => {
        const icon = getIcon(IconNames.HEALTHZ)
        const { container } = render(icon)

        expect(
          container.querySelector('[data-testid="health-and-safety-icon"]'),
        ).toBeInTheDocument()
      })

      it('should return ManageAccounts icon for MANAGE_ACCOUNTS', () => {
        const icon = getIcon(IconNames.MANAGE_ACCOUNTS)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="manage-accounts-icon"]')).toBeInTheDocument()
      })

      it('should return MenuOpen icon for MENU_OPEN', () => {
        const icon = getIcon(IconNames.MENU_OPEN)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="menu-open-icon"]')).toBeInTheDocument()
      })

      it('should return People icon for PEOPLE', () => {
        const icon = getIcon(IconNames.PEOPLE)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="people-icon"]')).toBeInTheDocument()
      })

      it('should return PeopleOutline icon for PEOPLE_OUTLINE', () => {
        const icon = getIcon(IconNames.PEOPLE_OUTLINE)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="people-outline-icon"]')).toBeInTheDocument()
      })

      it('should return QueryStats icon for STATS', () => {
        const icon = getIcon(IconNames.STATS)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="query-stats-icon"]')).toBeInTheDocument()
      })
    })

    describe('Color Support', () => {
      it('should apply color to Accessibility icon', () => {
        const icon = getIcon(IconNames.ACCESSIBLITY, '#ff0000')
        const { container } = render(icon)

        const iconElement = container.querySelector('[data-testid="accessibility-icon"]')
        expect(iconElement).toHaveStyle({ color: '#ff0000' })
      })

      it('should apply color to Check icon', () => {
        const icon = getIcon(IconNames.CHECK, '#00ff00')
        const { container } = render(icon)

        const iconElement = container.querySelector('[data-testid="check-icon"]')
        expect(iconElement).toHaveStyle({ color: '#00ff00' })
      })

      it('should apply color to Dashboard icon', () => {
        const icon = getIcon(IconNames.DASHBOARD, 'blue')
        const { container } = render(icon)

        const iconElement = container.querySelector('[data-testid="dashboard-icon"]')
        expect(iconElement).toHaveStyle({ color: 'blue' })
      })

      it('should handle undefined color', () => {
        const icon = getIcon(IconNames.CHECK)
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="check-icon"]')).toBeInTheDocument()
      })

      it('should handle empty string color', () => {
        const icon = getIcon(IconNames.CHECK, '')
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="check-icon"]')).toBeInTheDocument()
      })
    })

    describe('Return Value', () => {
      it('should return React element for valid icon names', () => {
        const icon = getIcon(IconNames.CHECK)

        expect(React.isValidElement(icon)).toBe(true)
      })

      it('should return null for invalid icon name', () => {
        const icon = getIcon('INVALID_ICON' as IconNames)

        expect(icon).toBeNull()
      })

      it('should return different elements for different icons', () => {
        const icon1 = getIcon(IconNames.CHECK)
        const icon2 = getIcon(IconNames.DASHBOARD)

        expect(icon1).not.toBe(icon2)
      })
    })

    describe('All Icon Names Coverage', () => {
      it('should handle all IconNames enum values', () => {
        const allIconNames = [
          IconNames.ACCESSIBLITY,
          IconNames.CHECK,
          IconNames.CHECKBOX,
          IconNames.CHECKBOX_OUTLINED_BLANK,
          IconNames.DASHBOARD,
          IconNames.HEALTHZ,
          IconNames.MANAGE_ACCOUNTS,
          IconNames.MENU_OPEN,
          IconNames.PEOPLE,
          IconNames.PEOPLE_OUTLINE,
          IconNames.STATS,
        ]

        allIconNames.forEach((iconName) => {
          const icon = getIcon(iconName)
          expect(React.isValidElement(icon)).toBe(true)
        })
      })
    })

    describe('Edge Cases', () => {
      it('should handle multiple calls with same icon name', () => {
        const icon1 = getIcon(IconNames.CHECK)
        const icon2 = getIcon(IconNames.CHECK)

        expect(React.isValidElement(icon1)).toBe(true)
        expect(React.isValidElement(icon2)).toBe(true)
      })

      it('should handle multiple calls with different colors', () => {
        const icon1 = getIcon(IconNames.CHECK, 'red')
        const icon2 = getIcon(IconNames.CHECK, 'blue')

        const { container: container1 } = render(icon1)
        const { container: container2 } = render(icon2)

        expect(container1.querySelector('[data-testid="check-icon"]')).toHaveStyle({
          color: 'red',
        })
        expect(container2.querySelector('[data-testid="check-icon"]')).toHaveStyle({
          color: 'blue',
        })
      })

      it('should handle rapid successive calls', () => {
        const icons = []
        for (let i = 0; i < 100; i++) {
          icons.push(getIcon(IconNames.CHECK))
        }

        expect(icons.length).toBe(100)
        icons.forEach((icon) => {
          expect(React.isValidElement(icon)).toBe(true)
        })
      })
    })

    describe('Type Safety', () => {
      it('should accept IconNames enum values', () => {
        expect(() => getIcon(IconNames.CHECK)).not.toThrow()
      })

      it('should work with all icon names from enum', () => {
        Object.values(IconNames).forEach((iconName) => {
          const icon = getIcon(iconName as IconNames)
          expect(icon).toBeDefined()
        })
      })
    })

    describe('Color Variations', () => {
      it('should handle hex colors', () => {
        const icon = getIcon(IconNames.CHECK, '#FF5733')
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="check-icon"]')).toHaveStyle({
          color: '#FF5733',
        })
      })

      it('should handle rgb colors', () => {
        const icon = getIcon(IconNames.CHECK, 'rgb(255, 0, 0)')
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="check-icon"]')).toHaveStyle({
          color: 'rgb(255, 0, 0)',
        })
      })

      it('should handle named colors', () => {
        const icon = getIcon(IconNames.CHECK, 'crimson')
        const { container } = render(icon)

        expect(container.querySelector('[data-testid="check-icon"]')).toHaveStyle({
          color: 'crimson',
        })
      })
    })
  })
})
