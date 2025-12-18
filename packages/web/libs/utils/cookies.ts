export const getCookie = (cookieName: string): string => {
  const pattern = `(?:(?:^|.*;\\s*)${cookieName}\\s*\\=\\s*([^;]*).*$)|^.*$`
  return document.cookie.replace(new RegExp(pattern), '$1')
}
