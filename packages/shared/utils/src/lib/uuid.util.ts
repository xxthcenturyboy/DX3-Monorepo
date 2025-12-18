export function getTimeFromUuid(uuid: string): Date {
  const [a, b, c] = uuid.split('-')
  return new Date(
    Math.floor((parseInt(`${c.substring(1)}${b}${a}`, 16) - 122192928000000000) / 10000),
  )
}
