import { Readable } from 'node:stream'

import { stream2buffer } from './stream-to-buffer.util'

describe('stream2buffer', () => {
  test('concatenates multiple Buffer chunks into a single Buffer', async () => {
    const chunks = [Buffer.from('hello '), Buffer.from('world')]
    const stream = Readable.from(chunks)
    const result = await stream2buffer(stream)
    expect(result).toEqual(Buffer.from('hello world'))
  })

  test('returns an empty Buffer for an empty stream', async () => {
    const stream = Readable.from([])
    const result = await stream2buffer(stream)
    expect(result).toEqual(Buffer.alloc(0))
  })

  test('rejects with an error message when the stream emits an error', async () => {
    const stream = new Readable({
      read() {
        // emit error asynchronously to mimic real stream behavior
        process.nextTick(() => this.emit('error', new Error('boom')))
      },
    })

    await expect(stream2buffer(stream)).rejects.toEqual('error converting stream - Error: boom')
  })
})
