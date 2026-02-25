import { resolveMx } from 'node:dns/promises'
import { z } from 'zod'

import type { DomainCheckResultType } from '@dx3/api-libs/reference-data/reference-data.types'
import {
  checkDomain,
  isReferenceDataApiConfigured,
} from '@dx3/api-libs/reference-data/reference-data-api.client'
import { APP_DOMAIN } from '@dx3/models-shared'
import { regexEmail } from '@dx3/utils-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../../logger'
import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-email-providers'
import { INVALID_EMAIL_NAMES } from './email-validation.const'
import { INVALID_TLDS } from './invalid-tlds.const'

export class EmailUtil {
  domainCheckResult: DomainCheckResultType | null = null
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

  async validateDomain(): Promise<DomainCheckResultType | null> {
    if (this.domainCheckResult) return this.domainCheckResult
    if (isReferenceDataApiConfigured()) {
      this.domainCheckResult = await checkDomain(this.domain)
      return this.domainCheckResult
    }

    return null
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

      // this pattern is allowed i.e. dx3_1234 - used for DX3 testing
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

  /**
   * Async disposable check. Uses Reference Data API when configured (integration mode);
   * otherwise falls back to static list.
   */
  async isDisposableDomainAsync(): Promise<boolean> {
    if (isReferenceDataApiConfigured()) {
      const result = await this.validateDomain()
      if (result) return result.disposable
    }
    return this.isDisposableDomain()
  }

  /**
   * Async TLD validation. Uses Reference Data API (IANA list) when configured;
   * otherwise falls back to Zod + static invalid TLD list.
   * Pass optional result from this.validateDomain() to avoid duplicate API call when used with validateAsync.
   */
  async isValidTldAsync(domainCheckResult?: { validTld: boolean } | null): Promise<boolean> {
    const tld = this.domainParts?.slice(-1)[0]
    if (!tld) return false

    if (domainCheckResult) return domainCheckResult.validTld

    if (isReferenceDataApiConfigured()) {
      const result = await this.validateDomain()
      if (result) return result.validTld
    }

    const emailSchema = z.string().email()
    const parseResult = emailSchema.safeParse(this.formattedEmail())
    if (!parseResult.success) return false
    if (INVALID_TLDS.some((invalid) => invalid === tld.toLowerCase())) return false

    return true
  }

  whitelistedEmail() {
    return Boolean(this.domain?.includes(APP_DOMAIN))
  }

  validateCommon() {
    if (this.whitelistedEmail()) return true
    if (!this.rawValue) return false
    if (!this.domain) return false
    if (this.rawValue.length > 254) return false
    if (!regexEmail.test(this.rawValue)) return false
    if (this.name.length > 64) return false
    if (this.domainParts?.some((part) => part.length > 63)) return false
    if (this.isNumbers) return false
    if (this.hasInvalidName()) return false
    return true
  }

  /**
   * Async validation. Use when Reference Data API is configured (integration mode).
   * Uses API for disposable + TLD when configured; otherwise static list + Zod.
   * Single API call when configured (this.validateDomain() returns both disposable and validTld).
   */
  async validateAsync(): Promise<boolean> {
    if (!this.validateCommon()) return false

    let domainCheckResult: { disposable: boolean; validTld: boolean } | null = null
    if (isReferenceDataApiConfigured()) {
      domainCheckResult = await this.validateDomain()
    }

    const isDisposable = domainCheckResult
      ? domainCheckResult.disposable
      : this.isDisposableDomain()
    if (isDisposable) return false

    const isValidTld = domainCheckResult
      ? domainCheckResult.validTld
      : await this.isValidTldAsync(domainCheckResult)
    if (!isValidTld) return false

    return true
  }

  validate() {
    if (!this.validateCommon()) return false
    if (this.isDisposableDomain()) return false
    return true
  }
}

export type EmailUtilType = typeof EmailUtil.prototype
