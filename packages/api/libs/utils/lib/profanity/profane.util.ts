import { Filter } from 'bad-words'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../../logger'
import { CUSTOM_PROFANE_WORDS } from './custom-profane-words.const'

export class ProfanityFilter {
  filter: typeof Filter.prototype
  logger: ApiLoggingClassType

  constructor() {
    this.filter = new Filter()
    this.filter.addWords(...CUSTOM_PROFANE_WORDS)
    this.logger = ApiLoggingClass.instance
  }

  public isProfane(stringToCheck: string): boolean {
    if (stringToCheck) {
      try {
        return this.filter.isProfane(stringToCheck)
        // return this.filter.list.filter((word: string) => {
        //   const wordRegEx = new RegExp(`${word.replace(/(\W)/g, '\\$1')}`, 'gi');
        //   return !this.filter.exclude.includes((word.toLowerCase()))
        //     && stringToCheck.search(wordRegEx) > -1;
        // }).length > 0 || false;
      } catch (err) {
        this.logger.logError(err)
      }
    }

    return false
  }

  public cleanProfanity(stringToCheck: string): string {
    if (stringToCheck) {
      try {
        return this.filter.clean(stringToCheck)
      } catch (err) {
        this.logger.logError(err)
      }
    }

    return ''
  }
}

export type ProfanityFilterType = typeof ProfanityFilter.prototype
