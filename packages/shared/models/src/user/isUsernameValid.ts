import { regexNoWhiteSpaceAlphaNumeric } from '@dx3/utils-shared'

import { DISALLOWED_USERNAME_STRINGS, USERNAME_MIN_LENGTH } from './user-shared.consts'

export function isUsernameValid(username: string): boolean {
  if (
    !username ||
    username.length < USERNAME_MIN_LENGTH + 1 ||
    !regexNoWhiteSpaceAlphaNumeric.test(username)
  ) {
    return false
  }

  if (DISALLOWED_USERNAME_STRINGS.includes(username.toLowerCase())) {
    return false
  }

  for (const disallowedUsername of DISALLOWED_USERNAME_STRINGS) {
    if (username.toLowerCase().includes(disallowedUsername)) {
      return false
    }
  }

  return true
}
