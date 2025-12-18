export function maliciousUrlCheck(appDomain: string, appUrl: string, urlToCheck: string) {
  const TRANSFORMED_APP_DOMAIN = appDomain.replace(/\./g, '\\.')
  // below makes use of query params - not necessary here
  // const PATTERN_APP_DOMAIN = new RegExp(`^${appUrl.replace(/\./g, '\\.')}[.:?/]`);
  const TRANSFORMED_APP_URL = appUrl.replace(/\./g, '\\.')

  const PATTERN_REQUIRES_TEST = /^(http|https):\/\/\S|^\/\/\S/i
  const PATTERN_APP_URL = new RegExp(`^${TRANSFORMED_APP_URL}$`)
  const PATTERN_MAIN_DOMAIN = new RegExp(`^(http|https)://${TRANSFORMED_APP_DOMAIN}/`, 'i')

  // always allow
  if (PATTERN_MAIN_DOMAIN.test(urlToCheck)) return

  if (urlToCheck && PATTERN_REQUIRES_TEST.test(urlToCheck)) {
    if (!urlToCheck.match(PATTERN_APP_URL)) {
      throw new Error(`Possible malicious attack - check URL: ${urlToCheck}`)
    }
  }
}
