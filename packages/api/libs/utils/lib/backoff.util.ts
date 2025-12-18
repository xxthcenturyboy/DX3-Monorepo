import { backOff } from 'exponential-backoff'
import type * as winston from 'winston'

type PromiseFuncType = () => Promise<unknown>

export const backOffWrapper = async (
  promiseFunc: PromiseFuncType,
  logMessage: string,
  retryAttemptNumber: number,
  logger?: typeof winston.Logger.prototype,
) =>
  backOff(
    () => promiseFunc(),
    // options
    {
      numOfAttempts: retryAttemptNumber,
      retry: (e, attemptNumber) => {
        if (logger) {
          logger.error(`Attempt Number ${attemptNumber} error message: ${logMessage}`)
          logger.error(JSON.stringify(e.stack, null, 2))
          return true
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error(
          `Attempt Number ${attemptNumber} error message: ${logMessage}`,
          JSON.stringify(e.stack),
        )
        return true
      },
    },
  )
