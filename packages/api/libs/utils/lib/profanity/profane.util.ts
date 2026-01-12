import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
  TextCensor,
} from 'obscenity'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../../logger'

// TODO: Add internationalization - Currently only using English
export class ProfanityFilter {
  filter: typeof RegExpMatcher.prototype
  logger: ApiLoggingClassType

  constructor() {
    this.filter = new RegExpMatcher({
      ...englishDataset.build(),
      ...englishRecommendedTransformers,
    })
    this.logger = ApiLoggingClass.instance
  }

  public isProfane(stringToCheck: string): boolean {
    if (stringToCheck) {
      try {
        return this.filter.hasMatch(stringToCheck)
      } catch (err) {
        this.logger.logError(err)
      }
    }

    return false
  }

  public cleanProfanity(stringToCheck: string): string {
    if (stringToCheck) {
      try {
        const censor = new TextCensor()
        const matches = this.filter.getAllMatches(stringToCheck)
        return censor.applyTo(stringToCheck, matches)
      } catch (err) {
        this.logger.logError(err)
      }
    }

    return ''
  }
}

export type ProfanityFilterType = typeof ProfanityFilter.prototype
