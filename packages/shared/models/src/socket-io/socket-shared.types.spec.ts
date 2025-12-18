import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './socket-shared.types'

describe('socket-shared.types', () => {
  describe('Type Exports', () => {
    it('should export ServerToClientEvents type', () => {
      // Type check - will fail at compile time if type doesn't exist
      const events: ServerToClientEvents = {
        basicEmit: (_a: number, _b: string, _c: Buffer) => {},
        noArg: () => {},
        withAck: (_d: string, _callback: (e: number) => void) => {},
      }
      expect(events).toBeDefined()
    })

    it('should export ClientToServerEvents type', () => {
      // Type check - will fail at compile time if type doesn't exist
      const events: ClientToServerEvents = {
        hello: () => {},
      }
      expect(events).toBeDefined()
    })

    it('should export InterServerEvents type', () => {
      // Type check - will fail at compile time if type doesn't exist
      const events: InterServerEvents = {
        ping: () => {},
      }
      expect(events).toBeDefined()
    })

    it('should export SocketData type', () => {
      // Type check - will fail at compile time if type doesn't exist
      const data: SocketData = {
        age: 30,
        name: 'John Doe',
      }
      expect(data).toBeDefined()
    })
  })

  describe('ServerToClientEvents', () => {
    it('should have noArg method that takes no arguments', () => {
      const events: ServerToClientEvents = {
        basicEmit: (_a: number, _b: string, _c: Buffer) => {},
        noArg: () => {},
        withAck: (_d: string, _callback: (e: number) => void) => {},
      }
      expect(typeof events.noArg).toBe('function')
      expect(events.noArg.length).toBe(0)
    })

    it('should have basicEmit method with correct parameters', () => {
      const mockFn = jest.fn()
      const events: ServerToClientEvents = {
        basicEmit: mockFn,
        noArg: () => {},
        withAck: (_d: string, _callback: (e: number) => void) => {},
      }

      const testBuffer = Buffer.from('test')
      events.basicEmit(123, 'test', testBuffer)

      expect(mockFn).toHaveBeenCalledWith(123, 'test', testBuffer)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should have withAck method with string and callback parameters', () => {
      const mockCallback = jest.fn()
      const mockWithAck = jest.fn((_d: string, callback: (e: number) => void) => {
        callback(42)
      })

      const events: ServerToClientEvents = {
        basicEmit: (_a: number, _b: string, _c: Buffer) => {},
        noArg: () => {},
        withAck: mockWithAck,
      }

      events.withAck('test-data', mockCallback)

      expect(mockWithAck).toHaveBeenCalledWith('test-data', mockCallback)
      expect(mockCallback).toHaveBeenCalledWith(42)
    })

    it('should have all required methods', () => {
      const events: ServerToClientEvents = {
        basicEmit: (_a: number, _b: string, _c: Buffer) => {},
        noArg: () => {},
        withAck: (_d: string, _callback: (e: number) => void) => {},
      }

      expect(events).toHaveProperty('noArg')
      expect(events).toHaveProperty('basicEmit')
      expect(events).toHaveProperty('withAck')
    })
  })

  describe('ClientToServerEvents', () => {
    it('should have hello method that takes no arguments', () => {
      const events: ClientToServerEvents = {
        hello: () => {},
      }

      expect(typeof events.hello).toBe('function')
      expect(events.hello.length).toBe(0)
    })

    it('should call hello method without errors', () => {
      const mockHello = jest.fn()
      const events: ClientToServerEvents = {
        hello: mockHello,
      }

      events.hello()

      expect(mockHello).toHaveBeenCalled()
      expect(mockHello).toHaveBeenCalledTimes(1)
    })

    it('should have all required methods', () => {
      const events: ClientToServerEvents = {
        hello: () => {},
      }

      expect(events).toHaveProperty('hello')
    })
  })

  describe('InterServerEvents', () => {
    it('should have ping method that takes no arguments', () => {
      const events: InterServerEvents = {
        ping: () => {},
      }

      expect(typeof events.ping).toBe('function')
      expect(events.ping.length).toBe(0)
    })

    it('should call ping method without errors', () => {
      const mockPing = jest.fn()
      const events: InterServerEvents = {
        ping: mockPing,
      }

      events.ping()

      expect(mockPing).toHaveBeenCalled()
      expect(mockPing).toHaveBeenCalledTimes(1)
    })

    it('should have all required methods', () => {
      const events: InterServerEvents = {
        ping: () => {},
      }

      expect(events).toHaveProperty('ping')
    })
  })

  describe('SocketData', () => {
    it('should have name property as string', () => {
      const data: SocketData = {
        age: 30,
        name: 'John Doe',
      }

      expect(typeof data.name).toBe('string')
      expect(data.name).toBe('John Doe')
    })

    it('should have age property as number', () => {
      const data: SocketData = {
        age: 30,
        name: 'John Doe',
      }

      expect(typeof data.age).toBe('number')
      expect(data.age).toBe(30)
    })

    it('should have all required properties', () => {
      const data: SocketData = {
        age: 25,
        name: 'Jane Smith',
      }

      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('age')
    })

    it('should accept various string values for name', () => {
      const testNames = ['Alice', 'Bob', 'Charlie Brown', '123', 'test-user']

      testNames.forEach((name) => {
        const data: SocketData = { age: 20, name }
        expect(data.name).toBe(name)
      })
    })

    it('should accept various number values for age', () => {
      const testAges = [0, 18, 25, 65, 100, 999]

      testAges.forEach((age) => {
        const data: SocketData = { age, name: 'Test' }
        expect(data.age).toBe(age)
      })
    })

    it('should create valid SocketData with empty string name', () => {
      const data: SocketData = {
        age: 0,
        name: '',
      }

      expect(data.name).toBe('')
      expect(data.age).toBe(0)
    })

    it('should create valid SocketData with negative age', () => {
      const data: SocketData = {
        age: -1,
        name: 'Test',
      }

      expect(data.age).toBe(-1)
    })
  })

  describe('Type Compatibility', () => {
    it('should allow ServerToClientEvents to be assigned to valid implementation', () => {
      const implementation: ServerToClientEvents = {
        basicEmit: (a, b, c) => console.log(a, b, c),
        noArg: () => console.log('no args'),
        withAck: (_d, callback) => callback(100),
      }

      expect(implementation).toBeDefined()
    })

    it('should allow ClientToServerEvents to be assigned to valid implementation', () => {
      const implementation: ClientToServerEvents = {
        hello: () => console.log('hello'),
      }

      expect(implementation).toBeDefined()
    })

    it('should allow InterServerEvents to be assigned to valid implementation', () => {
      const implementation: InterServerEvents = {
        ping: () => console.log('ping'),
      }

      expect(implementation).toBeDefined()
    })

    it('should allow SocketData to be used in arrays', () => {
      const dataArray: SocketData[] = [
        { age: 20, name: 'User1' },
        { age: 30, name: 'User2' },
        { age: 40, name: 'User3' },
      ]

      expect(dataArray.length).toBe(3)
      expect(dataArray[0].name).toBe('User1')
    })
  })
})
