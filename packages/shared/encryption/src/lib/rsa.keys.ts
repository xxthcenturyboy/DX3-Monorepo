import NodeRsa from 'node-rsa'

export type KeyPairsResponse = {
  publicKey: string | null
  privateKey: string | null
}

export function dxRsaGenerateKeyPair(): KeyPairsResponse {
  try {
    const key = new NodeRsa()
    const pair = key.generateKeyPair()
    const publicKey = pair.exportKey('pkcs1-public-der').toString('base64')
    const privateKey = pair.exportKey('pkcs1-der').toString('base64')
    return {
      privateKey,
      publicKey,
    }
  } catch (err) {
    console.error(err.message)
  }
  return {
    privateKey: null,
    publicKey: null,
  }
}

export function dxRsaSignPayload(privateKey: string, payload: string) {
  try {
    const privateKeyBuffer = Buffer.from(privateKey, 'base64')
    const key = new NodeRsa()
    const signer = key.importKey(privateKeyBuffer, 'pkcs1-der')
    const signature = signer.sign(Buffer.from(payload))
    return signature.toString('base64')
  } catch (err) {
    console.error(err.message)
  }

  return undefined
}

export function dxRsaValidatePayload(signature: string, payload: string, publicKey: string) {
  try {
    const publicKeyBuffer = Buffer.from(publicKey, 'base64')
    const key = new NodeRsa()
    const signer = key.importKey(publicKeyBuffer, 'pkcs1-public-der')
    return signer.verify(Buffer.from(payload), signature, 'utf8', 'base64')
  } catch (err) {
    console.error(err.message)
  }
  return false
}

export function dxRsaValidateBiometricKey(signature: string, payload: string, publicKey: string) {
  return dxRsaValidatePayload(signature, payload, publicKey)
}
