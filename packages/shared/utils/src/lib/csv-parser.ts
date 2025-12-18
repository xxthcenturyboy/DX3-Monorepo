export interface ParsedData {
  [key: string]: string
}

export const parseCSV = (csvData: string): ParsedData[] => {
  const rows = csvData.split('\n')
  const headers = rows[0].split(',')

  const result = rows.slice(1).map((row) => {
    const values = row.split(',')
    const obj: { [key: string]: string } = {}
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || ''
    })
    return obj
  })

  return result
}
