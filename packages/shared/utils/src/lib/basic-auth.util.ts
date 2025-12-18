export const basicAuthHeader = (username: string, password: string) => {
  const str = `${username}:${password}`

  let base64: string
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    // Node.js
    base64 = Buffer.from(str).toString('base64')
  } else if (typeof btoa === 'function' && typeof TextEncoder !== 'undefined') {
    // Browser (UTF-8 safe)
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    base64 = btoa(binary)
  } else {
    throw new Error('No base64 encoder available in this environment')
  }

  return { Authorization: `Basic ${base64}` }
}
