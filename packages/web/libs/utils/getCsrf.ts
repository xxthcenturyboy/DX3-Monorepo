export const getCsrfToken = (): string => {
  const meta = document.querySelector('meta[name="csrf-token"]')
  let token = ''
  if (meta) {
    token = meta.getAttribute('content') || ''
  }

  return token
}
