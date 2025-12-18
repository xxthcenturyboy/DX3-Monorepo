import { pbkdf2, randomBytes } from 'node:crypto'
import * as util from 'node:util'

const HASH_ALGO = 'sha512'

// nist recommends 10000, 10x nist, approx 83ms on i7-8650U
const HASH_ITERATIONS = 100000

const HASH_SALT_BYTES = 16 // Exceeds NIST Minimum 32/8 (4 bytes)
const HASH_BYTES = 64 // Match Hash Algorithm lengh / bits (512 / 8);

const atob = (input: string): Buffer => Buffer.from(input, 'base64')
const btoa = (input: Buffer): string => input.toString('base64').replace(/=+$/, '')

const h = util.promisify(pbkdf2)
const dxPbkdf2 = (input: Buffer, salt: Buffer): Promise<Buffer> =>
  h(input, salt, HASH_ITERATIONS, HASH_BYTES, HASH_ALGO)

const gs = util.promisify(randomBytes)
const generateSalt = (): Promise<Buffer> => gs(HASH_SALT_BYTES)

const normalize = (str: string): Buffer => Buffer.from(String(str).normalize('NFKC'))

export const dxHashString = async (str: string): Promise<string> => {
  const salt = await generateSalt()
  const result = await dxPbkdf2(normalize(str), salt)
  return `${btoa(salt)}.${btoa(result)}`
}

export const dxGetSaltFromHash = (hash: string): string => {
  if (typeof hash !== 'string') return '' // invalid input
  if (hash.length > 120) return '' // hash is impossibly long

  const [salt, _result] = hash.split('.')

  return salt
}

export const dxGenerateHashWithSalt = async (str: string, salt: string): Promise<string> => {
  if (typeof salt !== 'string') return '' // invalid input
  if (typeof str !== 'string') return '' // invalid input
  const saltBuffer = atob(salt)

  const result = await dxPbkdf2(normalize(str), saltBuffer)
  return `${btoa(saltBuffer)}.${btoa(result)}`
}

export const dxVerifyHash = async (hash: string, str: string): Promise<boolean> => {
  if (typeof hash !== 'string') return false // invalid input
  if (typeof str !== 'string') return false // invalid input
  if (hash.length > 120) return false // hash is impossibly long

  const [salt, result] = hash.split('.')

  const result2 = await dxPbkdf2(normalize(str), atob(salt))
  return result === btoa(result2)
}
