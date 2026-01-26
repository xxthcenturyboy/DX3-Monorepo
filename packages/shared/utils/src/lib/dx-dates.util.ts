import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export class DxDateUtilClass {
  public static getTimestamp(
    duration?: number,
    unit?: dayjs.ManipulateType,
    operator?: 'ADD' | 'SUB',
  ): number {
    if (duration && unit) {
      if (operator === 'ADD') {
        return dayjs.utc().add(duration, unit).unix()
      }
      if (operator === 'SUB') {
        return dayjs.utc().subtract(duration, unit).unix()
      }
    }

    return dayjs.utc().unix()
  }

  public static getTimestampFromDate(
    date: dayjs.ConfigType,
    duration?: number,
    unit?: dayjs.ManipulateType,
    operator?: 'ADD' | 'SUB',
  ): number {
    let d = date
    if (date === null || date === undefined || date === 'now') {
      d = dayjs.utc()
    }
    if (duration && unit) {
      if (operator === 'ADD') {
        return dayjs.utc(d).add(duration, unit).unix()
      }
      if (operator === 'SUB') {
        return dayjs.utc(d).subtract(duration, unit).unix()
      }
    }

    return dayjs.utc(d).unix()
  }

  public static getMilisecondsDays(days: number) {
    return days * 24 * 60 * 60 * 1000
  }

  public static formatRelativeTime(date: Date | string) {
    const then = dayjs(date)
    const diffMins = dayjs().diff(then, 'minute')
    const diffHours = dayjs().diff(then, 'hour')
    const diffDays = dayjs().diff(then, 'day')

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.format('L')
  }

  public static formatAbsoluteTime(date: Date | string) {
    return dayjs(date).format('L LT')
  }
}

export type DxDateUtilClassType = typeof DxDateUtilClass.prototype
