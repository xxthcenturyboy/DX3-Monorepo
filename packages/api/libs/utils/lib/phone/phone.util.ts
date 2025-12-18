import { type PhoneNumber, PhoneNumberUtil, PhoneNumberFormat as PNF } from 'google-libphonenumber'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../../logger'

const PHONE_TYPE = {
  FIXED_LINE: 'FIXED_LINE',
  FIXED_LINE_OR_MOBILE: 'FIXED_LINE_OR_MOBILE',
  MOBILE: 'MOBILE',
  PAGER: 'PAGER',
  PERSONAL_NUMBER: 'PERSONAL_NUMBER',
  PREMIUM_RATE: 'PREMIUM_RATE',
  SHARED_COST: 'SHARED_COST',
  TOLL_FREE: 'TOLL_FREE',
  UAN: 'UAN',
  UNKNOWN: 'UNKNOWN',
  VOICEMAIL: 'VOICEMAIL',
  VOIP: 'VOIP',
}

export class PhoneUtil {
  private phoneUtil: typeof PhoneNumberUtil.prototype
  private logger: ApiLoggingClassType
  private phoneParsed: PhoneNumber
  private phoneTypeMap: { [typeNum: number]: string } = {
    0: PHONE_TYPE.FIXED_LINE,
    1: PHONE_TYPE.MOBILE,
    2: PHONE_TYPE.FIXED_LINE_OR_MOBILE,
    3: PHONE_TYPE.TOLL_FREE,
    4: PHONE_TYPE.PREMIUM_RATE,
    5: PHONE_TYPE.SHARED_COST,
    6: PHONE_TYPE.VOIP,
    7: PHONE_TYPE.PERSONAL_NUMBER,
    8: PHONE_TYPE.PAGER,
    9: PHONE_TYPE.UAN,
    10: PHONE_TYPE.VOICEMAIL,
    [-1]: PHONE_TYPE.UNKNOWN,
  }

  constructor(phone: string, twoLetterRegionCode: string, isDebug?: boolean) {
    this.logger = ApiLoggingClass.instance
    this.phoneUtil = PhoneNumberUtil.getInstance()

    if (phone) {
      try {
        this.phoneParsed = this.phoneUtil.parseAndKeepRawInput(phone, twoLetterRegionCode || '')
        // this.phoneParsed = this.phoneUtil.parseAndKeepRawInput(phone);
      } catch (err) {
        if (isDebug) {
          this.logger.logError(err.message || 'PhoneUtil Constructor Error')
        }
      }
    }
  }

  get isValidMobile(): boolean {
    if (this.phoneParsed && this.isValid) {
      return this.phoneType === 1 || this.phoneType === 2
    }

    return false
  }

  get countryCode(): string {
    return this.phoneParsed?.getCountryCode().toString() || ''
  }

  get nationalNumber(): string {
    const zeros =
      this.phoneParsed?.numberOfLeadingZerosCount() || this.phoneParsed?.italianLeadingZeroCount()
    const number = this.phoneParsed?.getNationalNumber().toString()
    if (!zeros) {
      return number
    }

    let paddedNumber = ''
    for (let i = 0; i < zeros; i += 1) {
      paddedNumber = `${paddedNumber}0`
    }

    return `${paddedNumber}${number}`.replace(/ /g, '')
  }

  get internationalNumber(): string {
    return this.phoneUtil.format(this.phoneParsed, PNF.INTERNATIONAL).toString() as string
  }

  get normalizedPhone(): string {
    const normalizePhone = `+${this.countryCode}${this.nationalNumber}`
    return normalizePhone
  }

  get isPossibleNumber(): boolean {
    if (this.phoneParsed) {
      return this.phoneUtil.isPossibleNumber(this.phoneParsed) as boolean
    }

    return false
  }

  get isPossibleNumberReason(): number {
    if (this.phoneParsed && this.isPossibleNumber) {
      return this.phoneUtil.isPossibleNumberWithReason(this.phoneParsed) as number
    }

    return -1
  }

  get isValid(): boolean {
    if (this.phoneParsed) {
      const valid = this.phoneUtil.isValidNumber(this.phoneParsed) as boolean

      if (valid) {
        return true
      }
    }

    return false
  }

  get phoneType(): number {
    if (this.phoneParsed) {
      return this.phoneUtil.getNumberType(this.phoneParsed) as number
    }

    return 0
  }

  get phoneTypeText(): string {
    if (this.phoneParsed) {
      const type = this.phoneType
      const typeString = this.phoneTypeMap[type]

      return typeString || PHONE_TYPE.UNKNOWN
    }

    return ''
  }

  get phoneTypeString(): string {
    switch (this.phoneType) {
      case 1:
        return 'MOBILE'
      case 2:
        return 'FIXED_OR_MOBILE'
      default:
        return 'ZZ'
    }
  }
}

export type PhoneUtilType = typeof PhoneUtil.prototype
