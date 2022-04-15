import {
  addDays,
  isAfter as isDateAfter,
  isEqual as isDateEqual,
  isValid as isValidDate,
  startOfDay,
} from 'date-fns'
import * as Data from './Data'

export const isBagCountValid = (bagCount: number): boolean => {
  return Number.isSafeInteger(bagCount) && bagCount >= 1 && bagCount <= 50
}

export const isDateRangeValid = (dateRange: Data.DateRange): boolean => {
  const minDateFrom = addDays(startOfDay(new Date()), 1)
  const minDateTo = addDays(dateRange.from, 1)

  return (
    isValidDate(dateRange.from) &&
    isValidDate(dateRange.to) &&
    isDateEqual(dateRange.from, startOfDay(dateRange.from)) &&
    isDateEqual(dateRange.to, startOfDay(dateRange.to)) &&
    (isDateEqual(dateRange.from, minDateFrom) ||
      isDateAfter(dateRange.from, minDateFrom)) &&
    (isDateEqual(dateRange.to, minDateTo) ||
      isDateAfter(dateRange.to, minDateTo))
  )
}

export const getInitialDraftCart = (): Data.DraftCart => {
  const initialDateFrom = addDays(startOfDay(new Date()), 1)

  return {
    bagCount: 1,
    dateRange: { from: initialDateFrom, to: addDays(initialDateFrom, 1) },
    stashpointId: undefined,
  }
}

/**
 * A shortcut for making json requests
 * that returns a json response already parsed as a JS object.
 */
export async function jsonFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  // Set the default headers correctly
  const headers: HeadersInit = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error
    })
}

export function formatCurrency(
  value: number | bigint,
  currencyCode: string,
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(value)
}

/**
 * type Helper for transforming an object into an array of { key: typeof Key, value: typeof Value }
 * @example
 *    type A = { a: number, b: string }
 *    type transformed = Unionize<A>
 *      // => [ { key: 'a', value: number }, { key: 'b', value: string } ]
 */
export type Unionize<T extends object> = {
  [k in keyof T]: { key: k; value: T[k] }
}[keyof T]

export type ApiRequest<T> = {
  data?: T | undefined
  isLoading: boolean
  isError: boolean
  errorMessage?: string | undefined
}
