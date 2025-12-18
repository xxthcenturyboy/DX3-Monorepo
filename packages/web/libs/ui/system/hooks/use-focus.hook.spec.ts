import { act, renderHook } from '@testing-library/react'

import { useFocus } from './use-focus.hook'

describe('useFocus', () => {
  describe('Hook Initialization', () => {
    it('should return a tuple with ref and setFocus function', () => {
      const { result } = renderHook(() => useFocus())

      expect(result.current).toHaveLength(2)
      expect(result.current[0]).toHaveProperty('current')
      expect(typeof result.current[1]).toBe('function')
    })

    it('should initialize ref with null', () => {
      const { result } = renderHook(() => useFocus())
      const [ref] = result.current

      expect(ref.current).toBeNull()
    })

    it('should return a new setFocus function on each render', () => {
      const { result, rerender } = renderHook(() => useFocus())
      const [, firstSetFocus] = result.current

      rerender()

      const [, secondSetFocus] = result.current
      // Functions are recreated on each render (not memoized with useCallback)
      expect(firstSetFocus).not.toBe(secondSetFocus)
      expect(typeof firstSetFocus).toBe('function')
      expect(typeof secondSetFocus).toBe('function')
    })
  })

  describe('setFocus Behavior', () => {
    it('should call focus on the referenced element', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      ref.current = mockElement

      act(() => {
        setFocus()
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(1)
    })

    it('should not throw when ref is null', () => {
      const { result } = renderHook(() => useFocus())
      const [, setFocus] = result.current

      expect(() => {
        act(() => {
          setFocus()
        })
      }).not.toThrow()
    })

    it('should not throw when ref.current is null', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      ref.current = null

      expect(() => {
        act(() => {
          setFocus()
        })
      }).not.toThrow()
    })

    it('should handle multiple focus calls', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      ref.current = mockElement

      act(() => {
        setFocus()
        setFocus()
        setFocus()
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(3)
    })
  })

  describe('Ref Updates', () => {
    it('should work with updated element reference', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement1 = {
        focus: jest.fn(),
      }

      const mockElement2 = {
        focus: jest.fn(),
      }

      ref.current = mockElement1

      act(() => {
        setFocus()
      })

      expect(mockElement1.focus).toHaveBeenCalledTimes(1)
      expect(mockElement2.focus).not.toHaveBeenCalled()

      ref.current = mockElement2

      act(() => {
        setFocus()
      })

      expect(mockElement1.focus).toHaveBeenCalledTimes(1)
      expect(mockElement2.focus).toHaveBeenCalledTimes(1)
    })

    it('should handle switching from null to element', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      // Initially null
      act(() => {
        setFocus()
      })

      expect(mockElement.focus).not.toHaveBeenCalled()

      // Set element
      ref.current = mockElement

      act(() => {
        setFocus()
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(1)
    })

    it('should handle switching from element to null', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      ref.current = mockElement

      act(() => {
        setFocus()
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(1)

      ref.current = null

      expect(() => {
        act(() => {
          setFocus()
        })
      }).not.toThrow()

      expect(mockElement.focus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration with DOM Elements', () => {
    it('should work with input elements', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const input = document.createElement('input')
      input.focus = jest.fn()

      ref.current = input

      act(() => {
        setFocus()
      })

      expect(input.focus).toHaveBeenCalledTimes(1)
    })

    it('should work with button elements', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const button = document.createElement('button')
      button.focus = jest.fn()

      ref.current = button

      act(() => {
        setFocus()
      })

      expect(button.focus).toHaveBeenCalledTimes(1)
    })

    it('should work with textarea elements', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const textarea = document.createElement('textarea')
      textarea.focus = jest.fn()

      ref.current = textarea

      act(() => {
        setFocus()
      })

      expect(textarea.focus).toHaveBeenCalledTimes(1)
    })

    it('should work with div elements with tabindex', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const div = document.createElement('div')
      div.focus = jest.fn()

      ref.current = div

      act(() => {
        setFocus()
      })

      expect(div.focus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Hook Lifecycle', () => {
    it('should maintain ref across re-renders', () => {
      const { result, rerender } = renderHook(() => useFocus())
      const [firstRef] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      firstRef.current = mockElement

      rerender()

      const [secondRef] = result.current

      expect(secondRef.current).toBe(mockElement)
      expect(firstRef).toBe(secondRef)
    })

    it('should not lose ref value on re-render', () => {
      const { result, rerender } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      ref.current = mockElement

      rerender()
      rerender()
      rerender()

      act(() => {
        setFocus()
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(1)
    })

    it('should work correctly after unmount and remount', () => {
      const { result, unmount } = renderHook(() => useFocus())
      const [, firstSetFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      result.current[0].current = mockElement

      act(() => {
        firstSetFocus()
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(1)

      unmount()

      // Remount
      const { result: newResult } = renderHook(() => useFocus())
      const [newRef, newSetFocus] = newResult.current

      const newMockElement = {
        focus: jest.fn(),
      }

      newRef.current = newMockElement

      act(() => {
        newSetFocus()
      })

      expect(newMockElement.focus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle focus method that throws an error', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(() => {
          throw new Error('Focus error')
        }),
      }

      ref.current = mockElement

      expect(() => {
        act(() => {
          setFocus()
        })
      }).toThrow('Focus error')

      expect(mockElement.focus).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid consecutive setFocus calls', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const mockElement = {
        focus: jest.fn(),
      }

      ref.current = mockElement

      act(() => {
        for (let i = 0; i < 100; i++) {
          setFocus()
        }
      })

      expect(mockElement.focus).toHaveBeenCalledTimes(100)
    })
  })

  describe('Type Safety', () => {
    it('should handle any type of element', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      // Custom object with focus
      ref.current = {
        customProperty: 'test',
        focus: jest.fn(),
      }

      act(() => {
        setFocus()
      })

      expect(ref.current.focus).toHaveBeenCalledTimes(1)
    })

    it('should work with HTMLElement interface', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      const element = {
        blur: jest.fn(),
        click: jest.fn(),
        focus: jest.fn(),
      }

      ref.current = element

      act(() => {
        setFocus()
      })

      expect(element.focus).toHaveBeenCalledTimes(1)
      expect(element.blur).not.toHaveBeenCalled()
      expect(element.click).not.toHaveBeenCalled()
    })
  })

  describe('Return Value Destructuring', () => {
    it('should allow destructuring in any order', () => {
      const { result } = renderHook(() => useFocus())
      const [ref, setFocus] = result.current

      expect(ref).toBeDefined()
      expect(setFocus).toBeDefined()
      expect(typeof setFocus).toBe('function')
    })

    it('should allow using only the ref', () => {
      const { result } = renderHook(() => useFocus())
      const [ref] = result.current

      expect(ref).toBeDefined()
      expect(ref.current).toBeNull()
    })

    it('should allow using only the setFocus function', () => {
      const { result } = renderHook(() => useFocus())
      const [, setFocus] = result.current

      expect(setFocus).toBeDefined()
      expect(typeof setFocus).toBe('function')
    })
  })

  describe('Multiple Hook Instances', () => {
    it('should maintain separate state for multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useFocus())
      const { result: result2 } = renderHook(() => useFocus())

      const [ref1, setFocus1] = result1.current
      const [ref2, setFocus2] = result2.current

      const mockElement1 = {
        focus: jest.fn(),
      }

      const mockElement2 = {
        focus: jest.fn(),
      }

      ref1.current = mockElement1
      ref2.current = mockElement2

      act(() => {
        setFocus1()
      })

      expect(mockElement1.focus).toHaveBeenCalledTimes(1)
      expect(mockElement2.focus).not.toHaveBeenCalled()

      act(() => {
        setFocus2()
      })

      expect(mockElement1.focus).toHaveBeenCalledTimes(1)
      expect(mockElement2.focus).toHaveBeenCalledTimes(1)
    })
  })
})
