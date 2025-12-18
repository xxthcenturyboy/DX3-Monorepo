import {
  type BinaryLike,
  type CipherKey,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto'

import type { EncryptionReturnType } from './encryption.types'

const ALGORITHM = {
  AUTH_TAG_BYTE_LEN: 16,
  BLOCK_CIPHER: 'aes-256-cbc',
  IV_BYTE_LEN: 16,
  KEY_BYTE_LEN: 32,
  SALT_BYTE_LEN: 16,
}

function getIv() {
  return randomBytes(ALGORITHM.IV_BYTE_LEN)
}

function _getRandomKey() {
  return randomBytes(ALGORITHM.KEY_BYTE_LEN)
}

function _getSalt() {
  return randomBytes(ALGORITHM.SALT_BYTE_LEN)
}

function _getKeyFromPassword(password: string, salt: string) {
  const passwordBuffer = Buffer.from(password)
  const saltBuffer = Buffer.from(salt)
  return scryptSync(passwordBuffer, saltBuffer, ALGORITHM.KEY_BYTE_LEN)
}

function clearBuffers(buffers: Buffer[]) {
  buffers.forEach((buffer) => buffer.fill(0))
}

export function dxEncryptString(text: string, key: Buffer): EncryptionReturnType {
  const iv = getIv()
  const cipher = createCipheriv(ALGORITHM.BLOCK_CIPHER, key as CipherKey, iv as BinaryLike)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const ivString = iv.toString('hex')
  const encryptedString = encrypted.toString('hex')
  clearBuffers([encrypted, iv])
  return {
    encryptedValue: encryptedString,
    iv: ivString,
  }
}

export function dxDecryptString(encryptedValue: string, ivValue: string, key: Buffer): string {
  const iv = Buffer.from(ivValue, 'hex')
  const encryptedText = Buffer.from(encryptedValue, 'hex')
  const decipher = createDecipheriv(ALGORITHM.BLOCK_CIPHER, key as CipherKey, iv as BinaryLike)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  const result = decrypted.toString()
  clearBuffers([decrypted, encryptedText, iv])
  return result
}
