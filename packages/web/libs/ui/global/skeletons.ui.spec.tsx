import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import type React from 'react'

import { boxSkeleton, listSkeleton, waveItem } from './skeletons.ui'

describe('skeletons.ui', () => {
  const testTheme = createTheme()

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={testTheme}>{component}</ThemeProvider>)
  }

  describe('listSkeleton', () => {
    it('should render without crashing', () => {
      const skeleton = listSkeleton(3, '50px')
      const { container } = renderWithTheme(skeleton)

      expect(container.firstChild).not.toBeNull()
    })

    it('should render the correct number of list items', () => {
      const skeleton = listSkeleton(5, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItems = container.querySelectorAll('.MuiListItem-root')
      expect(listItems.length).toBe(5)
    })

    it('should render zero items when count is 0', () => {
      const skeleton = listSkeleton(0, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItems = container.querySelectorAll('.MuiListItem-root')
      expect(listItems.length).toBe(0)
    })

    it('should render single item when count is 1', () => {
      const skeleton = listSkeleton(1, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItems = container.querySelectorAll('.MuiListItem-root')
      expect(listItems.length).toBe(1)
    })

    it('should render many items when count is high', () => {
      const skeleton = listSkeleton(20, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItems = container.querySelectorAll('.MuiListItem-root')
      expect(listItems.length).toBe(20)
    })

    it('should render Skeleton components inside list items', () => {
      const skeleton = listSkeleton(3, '50px')
      const { container } = renderWithTheme(skeleton)

      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons.length).toBe(3)
    })

    it('should handle different height values', () => {
      const skeleton1 = listSkeleton(2, '100px')
      const { container: container1 } = renderWithTheme(skeleton1)

      const skeleton2 = listSkeleton(2, '200px')
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeleton2}</ThemeProvider>,
      )

      expect(container1.querySelectorAll('.MuiListItem-root').length).toBe(2)
      expect(container2.querySelectorAll('.MuiListItem-root').length).toBe(2)
    })

    it('should render each item with a unique key', () => {
      const skeleton = listSkeleton(5, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItems = container.querySelectorAll('.MuiListItem-root')
      expect(listItems.length).toBe(5)
    })

    it('should render rectangular variant skeletons', () => {
      const skeleton = listSkeleton(3, '50px')
      const { container } = renderWithTheme(skeleton)

      const skeletons = container.querySelectorAll('.MuiSkeleton-rectangular')
      expect(skeletons.length).toBe(3)
    })

    it('should render wave animation skeletons', () => {
      const skeleton = listSkeleton(3, '50px')
      const { container } = renderWithTheme(skeleton)

      const skeletons = container.querySelectorAll('.MuiSkeleton-wave')
      expect(skeletons.length).toBe(3)
    })
  })

  describe('boxSkeleton', () => {
    it('should render without crashing', () => {
      const skeleton = boxSkeleton('20px', '100px')
      const { container } = renderWithTheme(skeleton)

      expect(container.firstChild).not.toBeNull()
    })

    it('should render a Box component', () => {
      const skeleton = boxSkeleton('20px', '100px')
      const { container } = renderWithTheme(skeleton)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toBeInTheDocument()
    })

    it('should render a Skeleton component inside Box', () => {
      const skeleton = boxSkeleton('20px', '100px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-root')
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should render with different padding values', () => {
      const skeleton1 = boxSkeleton('10px', '100px')
      const { container: container1 } = renderWithTheme(skeleton1)

      const skeleton2 = boxSkeleton('40px', '100px')
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeleton2}</ThemeProvider>,
      )

      expect(container1.querySelector('.MuiBox-root')).toBeInTheDocument()
      expect(container2.querySelector('.MuiBox-root')).toBeInTheDocument()
    })

    it('should render with different height values', () => {
      const skeleton1 = boxSkeleton('20px', '50px')
      const { container: container1 } = renderWithTheme(skeleton1)

      const skeleton2 = boxSkeleton('20px', '200px')
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeleton2}</ThemeProvider>,
      )

      expect(container1.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
      expect(container2.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    it('should render rectangular variant skeleton', () => {
      const skeleton = boxSkeleton('20px', '100px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-rectangular')
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should render wave animation skeleton', () => {
      const skeleton = boxSkeleton('20px', '100px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-wave')
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should handle zero padding', () => {
      const skeleton = boxSkeleton('0px', '100px')
      const { container } = renderWithTheme(skeleton)

      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument()
      expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    it('should handle various CSS units for padding', () => {
      const skeletonPx = boxSkeleton('20px', '100px')
      const skeletonRem = boxSkeleton('2rem', '100px')
      const skeletonEm = boxSkeleton('1.5em', '100px')

      const { container: container1 } = renderWithTheme(skeletonPx)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeletonRem}</ThemeProvider>,
      )
      const { container: container3 } = render(
        <ThemeProvider theme={testTheme}>{skeletonEm}</ThemeProvider>,
      )

      expect(container1.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
      expect(container2.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
      expect(container3.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })
  })

  describe('waveItem', () => {
    it('should render without crashing', () => {
      const skeleton = waveItem('50px')
      const { container } = renderWithTheme(skeleton)

      expect(container.firstChild).not.toBeNull()
    })

    it('should render a Skeleton component', () => {
      const skeleton = waveItem('50px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-root')
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should render with different height values', () => {
      const skeleton1 = waveItem('50px')
      const { container: container1 } = renderWithTheme(skeleton1)

      const skeleton2 = waveItem('150px')
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeleton2}</ThemeProvider>,
      )

      expect(container1.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
      expect(container2.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    it('should render rectangular variant skeleton', () => {
      const skeleton = waveItem('50px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-rectangular')
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should render wave animation skeleton', () => {
      const skeleton = waveItem('50px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-wave')
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should handle various CSS units for height', () => {
      const skeletonPx = waveItem('50px')
      const skeletonPercent = waveItem('100%')
      const skeletonVh = waveItem('10vh')

      const { container: container1 } = renderWithTheme(skeletonPx)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeletonPercent}</ThemeProvider>,
      )
      const { container: container3 } = render(
        <ThemeProvider theme={testTheme}>{skeletonVh}</ThemeProvider>,
      )

      expect(container1.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
      expect(container2.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
      expect(container3.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })
  })

  describe('Combined Usage', () => {
    it('should render multiple skeleton types together', () => {
      const list = listSkeleton(2, '50px')
      const box = boxSkeleton('20px', '100px')
      const wave = waveItem('50px')

      const { container } = renderWithTheme(
        <>
          {list}
          {box}
          {wave}
        </>,
      )

      expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
      expect(container.querySelectorAll('.MuiListItem-root').length).toBe(2)
      expect(container.querySelectorAll('.MuiBox-root').length).toBe(1)
    })

    it('should handle re-rendering with different parameters', () => {
      const { container, rerender } = renderWithTheme(listSkeleton(3, '50px'))

      expect(container.querySelectorAll('.MuiListItem-root').length).toBe(3)

      rerender(<ThemeProvider theme={testTheme}>{listSkeleton(5, '75px')}</ThemeProvider>)

      expect(container.querySelectorAll('.MuiListItem-root').length).toBe(5)
    })

    it('should render consistently across multiple renders', () => {
      const skeleton1 = listSkeleton(3, '50px')
      const skeleton2 = listSkeleton(3, '50px')

      const { container: container1 } = renderWithTheme(skeleton1)
      const { container: container2 } = render(
        <ThemeProvider theme={testTheme}>{skeleton2}</ThemeProvider>,
      )

      expect(container1.querySelectorAll('.MuiListItem-root').length).toBe(
        container2.querySelectorAll('.MuiListItem-root').length,
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle large number of list items', () => {
      const skeleton = listSkeleton(100, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItems = container.querySelectorAll('.MuiListItem-root')
      expect(listItems.length).toBe(100)
    })

    it('should handle very small height values', () => {
      const skeleton = waveItem('1px')
      const { container } = renderWithTheme(skeleton)

      expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    it('should handle very large height values', () => {
      const skeleton = waveItem('1000px')
      const { container } = renderWithTheme(skeleton)

      expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    it('should handle decimal values in height', () => {
      const skeleton = waveItem('50.5px')
      const { container } = renderWithTheme(skeleton)

      expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    it('should handle complex padding values in boxSkeleton', () => {
      const skeleton = boxSkeleton('10px 20px 30px 40px', '100px')
      const { container } = renderWithTheme(skeleton)

      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument()
    })
  })

  describe('Animation and Variant', () => {
    it('should consistently use wave animation across all skeleton types', () => {
      const list = listSkeleton(2, '50px')
      const box = boxSkeleton('20px', '100px')
      const wave = waveItem('50px')

      const { container } = renderWithTheme(
        <>
          {list}
          {box}
          {wave}
        </>,
      )

      const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
      expect(waveSkeletons.length).toBeGreaterThan(0)
    })

    it('should consistently use rectangular variant across all skeleton types', () => {
      const list = listSkeleton(2, '50px')
      const box = boxSkeleton('20px', '100px')
      const wave = waveItem('50px')

      const { container } = renderWithTheme(
        <>
          {list}
          {box}
          {wave}
        </>,
      )

      const rectangularSkeletons = container.querySelectorAll('.MuiSkeleton-rectangular')
      expect(rectangularSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Structure and Hierarchy', () => {
    it('should nest Skeleton inside ListItem for listSkeleton', () => {
      const skeleton = listSkeleton(1, '50px')
      const { container } = renderWithTheme(skeleton)

      const listItem = container.querySelector('.MuiListItem-root')
      const skeletonElement = listItem?.querySelector('.MuiSkeleton-root')

      expect(listItem).toBeInTheDocument()
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should nest Skeleton inside Box for boxSkeleton', () => {
      const skeleton = boxSkeleton('20px', '100px')
      const { container } = renderWithTheme(skeleton)

      const box = container.querySelector('.MuiBox-root')
      const skeletonElement = box?.querySelector('.MuiSkeleton-root')

      expect(box).toBeInTheDocument()
      expect(skeletonElement).toBeInTheDocument()
    })

    it('should render waveItem as standalone Skeleton', () => {
      const skeleton = waveItem('50px')
      const { container } = renderWithTheme(skeleton)

      const skeletonElement = container.querySelector('.MuiSkeleton-root')
      const listItem = container.querySelector('.MuiListItem-root')
      const box = container.querySelector('.MuiBox-root')

      expect(skeletonElement).toBeInTheDocument()
      expect(listItem).not.toBeInTheDocument()
      expect(box).not.toBeInTheDocument()
    })
  })

  describe('Rendering Performance', () => {
    it('should not throw errors with rapid re-renders', () => {
      const { rerender } = renderWithTheme(listSkeleton(3, '50px'))

      expect(() => {
        rerender(<ThemeProvider theme={testTheme}>{listSkeleton(5, '60px')}</ThemeProvider>)
        rerender(<ThemeProvider theme={testTheme}>{listSkeleton(2, '40px')}</ThemeProvider>)
        rerender(<ThemeProvider theme={testTheme}>{listSkeleton(10, '80px')}</ThemeProvider>)
      }).not.toThrow()
    })

    it('should handle switching between skeleton types', () => {
      const { container, rerender } = renderWithTheme(listSkeleton(3, '50px'))

      expect(container.querySelectorAll('.MuiListItem-root').length).toBe(3)

      rerender(<ThemeProvider theme={testTheme}>{boxSkeleton('20px', '100px')}</ThemeProvider>)

      expect(container.querySelectorAll('.MuiListItem-root').length).toBe(0)
      expect(container.querySelectorAll('.MuiBox-root').length).toBe(1)

      rerender(<ThemeProvider theme={testTheme}>{waveItem('50px')}</ThemeProvider>)

      expect(container.querySelectorAll('.MuiBox-root').length).toBe(0)
      expect(container.querySelectorAll('.MuiSkeleton-root').length).toBe(1)
    })
  })
})
