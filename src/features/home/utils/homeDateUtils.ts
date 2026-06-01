export function getDaysUntilEnd(endDate?: string) {
  if (!endDate) {
    return Number.POSITIVE_INFINITY
  }

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  return Math.ceil((getDateTimestamp(endDate) - startOfToday) / (24 * 60 * 60 * 1000))
}

export function getDateTimestamp(date?: string) {
  if (!date) {
    return 0
  }

  const [year, month, day] = date.split('-').map(Number)

  return year && month && day ? new Date(year, month - 1, day).getTime() : 0
}
