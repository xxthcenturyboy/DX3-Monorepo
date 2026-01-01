// A file of usefull regular expressions

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
export const regexEmail =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export const regexNoWhiteSpaceString = /^\S*$/

export const regexNoWhiteSpaceAlphaNumeric = /^[a-zA-Z0-9_]+$/

export const regexPhone = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/

export const regexPhoneUS = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/

export const regexPostgresUrl =
  /^(?:([^:/?#\s]+):\/{2})?(?:([^@/?#\s]+)@)?([^/?#\s]+)?(?:\/([^?#\s]*))?(?:[?]([^#\s]+))?\S*$/

export const regexUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const regexMatchNumberGroups = /\b\d+\b/g
