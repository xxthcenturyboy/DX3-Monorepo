import { regexNoWhiteSpaceString } from '@dx3/utils-shared'

export function usernameValidator(username: string): boolean {
  return typeof username === 'string' && regexNoWhiteSpaceString.test(username)
}
