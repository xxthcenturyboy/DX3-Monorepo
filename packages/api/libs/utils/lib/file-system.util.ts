import fs from 'node:fs'
import * as winston from 'winston'

export function emptyDirectory(pathToDirectory: string) {
  const logger = winston.createLogger()
  if (typeof pathToDirectory !== 'string') {
    return false
  }

  try {
    fs.rmSync(pathToDirectory, { recursive: true })
    fs.mkdirSync(pathToDirectory, { recursive: true })
    return true
  } catch (err) {
    logger ? logger.error(err) : console.error(err)
    return false
  }
}

export function readFileLocal(pathToDirectory: string) {
  const logger = winston.createLogger()
  if (typeof pathToDirectory !== 'string') {
    return false
  }

  try {
    const file = fs.readFileSync(pathToDirectory)

    return file.toString()
  } catch (err) {
    logger ? logger.error(err) : console.error(err)
    return false
  }
}
