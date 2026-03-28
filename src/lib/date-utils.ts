import { startOfDay, endOfDay, format, addMonths, subMonths, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'
import type { MonthPeriod } from '@/types'

export function getMonthPeriod(date: Date, startDay: number): MonthPeriod {
  const d = startOfDay(date)
  const year = d.getFullYear()
  const month = d.getMonth()

  let start: Date
  let end: Date

  if (startDay === 1) {
    start = new Date(year, month, 1)
    end = endOfDay(new Date(year, month + 1, 0))
  } else {
    const dayOfMonth = d.getDate()
    if (dayOfMonth >= startDay) {
      start = new Date(year, month, startDay)
      const nextMonth = addMonths(start, 1)
      end = endOfDay(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), startDay - 1))
    } else {
      const prevStart = subMonths(new Date(year, month, startDay), 1)
      start = new Date(prevStart.getFullYear(), prevStart.getMonth(), startDay)
      end = endOfDay(new Date(year, month, startDay - 1))
    }
  }

  const label = format(start, 'MMMM yyyy', { locale: id })

  return { start, end, label }
}

export function getNextPeriod(current: MonthPeriod, startDay: number): MonthPeriod {
  const nextDate = addMonths(current.start, 1)
  return getMonthPeriod(nextDate, startDay)
}

export function getPrevPeriod(current: MonthPeriod, startDay: number): MonthPeriod {
  const prevDate = subMonths(current.start, 1)
  return getMonthPeriod(prevDate, startDay)
}

export function isInPeriod(date: string, period: MonthPeriod): boolean {
  return isWithinInterval(new Date(date), { start: period.start, end: period.end })
}

export function formatDate(date: string): string {
  return format(new Date(date), 'd MMM yyyy', { locale: id })
}

export function formatDateShort(date: string): string {
  return format(new Date(date), 'd MMM', { locale: id })
}
