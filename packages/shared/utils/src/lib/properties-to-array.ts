/**
 * Takes a JSON Object and Returns an array of the properties of the object in JSON 'dot' notation
 * @param obj Any JSON Object
 * @returns string[]
 */
export function propertiesToArray(obj: object): string[] {
  const isObject = (val: unknown) => typeof val === 'object' && !Array.isArray(val)

  const addDelimiter = (a: string, b: string) => (a ? `${a}.${b}` : b)

  const paths = (obj = {}, head = '') => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      const fullPath = addDelimiter(head, key)
      return isObject(value)
        ? product.concat(paths(value as object, fullPath))
        : product.concat(fullPath)
    }, [])
  }

  return paths(obj)
}
