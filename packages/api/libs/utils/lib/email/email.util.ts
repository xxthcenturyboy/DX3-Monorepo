import { resolveMx } from 'node:dns/promises'
import Joi from 'joi'

import { APP_DOMAIN } from '@dx3/models-shared'
import { regexEmail } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../../logger'
import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-email-providers'
import { INVALID_EMAIL_NAMES } from './email-validation.const'

export class EmailUtil {
  logger: ApiLoggingClassType
  regexDots = /\./g
  regexConsecutiveDots = /\.\./
  rawValue = ''
  mxData: string
  parts: string[]
  providerDomainMap: { [domain: string]: string } = {
    aol: 'aol.com',
    gmail: 'gmail.com',
    gmx: 'gmx.com',
    googlemail: 'googlemail.com',
    hotmail: 'hotmail.com',
    icloud: 'icloud.com',
    live: 'live.com',
    mac: 'mac.com',
    mail: 'mail.com',
    me: 'me.com',
    msn: 'msn.com',
    outlook: 'outlook.com',
    proton: 'proton.me',
    protonmail: 'protonmail.com',
    umusic: 'umusic.com',
    yahoo: 'yahoo.com',
    zoho: 'zoho.com',
  }
  recoveredDomain: string | undefined

  constructor(email: string, getMx?: boolean) {
    this.logger = ApiLoggingClass.instance
    this.rawValue = email
    this.parts = email.split('@')

    if (getMx) {
      this.getMxRecords()
        .then((mx) => {
          this.mxData = mx

          return mx
        })
        .catch((err) => {
          this.logger.logError(err)
        })
    }
  }

  get domain() {
    return this.domainParts?.join('.')
  }

  get domainParts() {
    return this.parts[1]?.split('.')
  }

  get name() {
    return this.parts[0] || ''
  }

  get isEmail(): boolean {
    return regexEmail.test(this.rawValue)
  }

  get isNumbers() {
    return /^[0-9]+$/.test(this.name)
  }

  get isValid() {
    return this.validate()
  }

  async getMxRecords(): Promise<string> {
    if (this.mxData) {
      return this.mxData
    }

    try {
      const mx = await resolveMx(this.domain)
      if (!mx.length) {
        return ''
      }

      this.mxData = JSON.stringify(mx)

      return this.mxData
    } catch (_err) {
      this.logger.logWarn(`Could not resolveMx: ${this.domain}`)
    }

    return ''
  }

  countOfDotsInName() {
    return (this.name.match(this.regexDots) || []).length
  }

  hasConsecutiveDots() {
    return this.regexConsecutiveDots.test(this.name)
  }

  hasInvalidName() {
    const regexInvalidName = new RegExp(`^(${INVALID_EMAIL_NAMES.join('|')})`, 'i')
    return regexInvalidName.test(this.name)
  }

  strippedName() {
    return this.name?.replace(/[.]/g, '')
  }

  async isMaybeBadGmail(): Promise<boolean> {
    const mxRecords = this.mxData ? this.mxData : await this.getMxRecords()

    return this.domain === 'gmail.com' || mxRecords.includes('gmail-smtp-in.l.google.com')
  }

  recoverDomain(): void {
    if (this.providerDomainMap[this.domainParts[0]]) {
      if (this.domainParts[0] === 'gmx' && this.domainParts[1]?.startsWith('u')) {
        this.recoveredDomain = 'gmx.us'

        return
      }

      this.recoveredDomain = this.providerDomainMap[this.domainParts[0]]
    }
  }

  async validateTld(): Promise<boolean> {
    if (this.isValid) {
      // JOI library validates TLD with simple validation
      const validator = Joi.string().email().optional()

      try {
        const validRes = await validator.validateAsync(this.formattedEmail())

        return !!validRes
      } catch (_err) {
        // this.logger.error(JSON.stringify(err, null, 2))

        return false
      }
    }

    return false
  }

  formattedName() {
    if (this.name && this.hasConsecutiveDots()) {
      return this.strippedName()
    }

    return this.name
  }

  stripPlusN(namePart: string) {
    const plusOneIndex = namePart.indexOf('+')
    const endIndex = plusOneIndex > -1 ? plusOneIndex : namePart.length
    return namePart.slice(0, endIndex)
  }

  strippedEmailForIndex() {
    const strippedEmail = `${this.stripPlusN(this.strippedName())}@${this.domain}`
    return strippedEmail.toLowerCase().trim()
  }

  nonAliasedNamePart(namePart: string): string {
    const plusOneIndex = namePart.indexOf('+')

    if (plusOneIndex > -1) {
      const alias = namePart.substring(plusOneIndex + 1)

      // this pattern is allowed i.e. umgtest_1234 - used for marketer smoke testing in prod
      if (/dx3_\d+$/.test(alias)) {
        return namePart
      }

      return this.stripPlusN(namePart)
    }

    return namePart
  }

  formattedEmail(): string {
    const domain = this.recoveredDomain ? this.recoveredDomain : this.domain
    const email = `${this.nonAliasedNamePart(this.formattedName())}@${domain}`

    return email.toLowerCase().trim()
  }

  isDisposableDomain(): boolean {
    return DISPOSABLE_EMAIL_DOMAINS[this.domain] || false
  }

  whitelistedEmail() {
    return this.domain.includes(APP_DOMAIN)
  }

  validate() {
    if (!this.rawValue) {
      return false
    }

    if (this.rawValue.length > 254) {
      return false
    }

    if (!regexEmail.test(this.rawValue)) {
      return false
    }

    if (this.name.length > 64) {
      return false
    }

    if (this.domainParts.some((part) => part.length > 63)) {
      return false
    }

    if (this.isDisposableDomain()) {
      return false
    }

    if (this.isNumbers) {
      return false
    }

    if (this.whitelistedEmail()) {
      return true
    }

    if (this.hasInvalidName()) {
      return false
    }

    return true
  }
}

export type EmailUtilType = typeof EmailUtil.prototype
