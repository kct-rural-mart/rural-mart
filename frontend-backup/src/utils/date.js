// Formats a Date using its LOCAL calendar fields (year/month/day), not UTC.
//
// `date.toISOString().slice(0, 10)` converts to UTC first, which silently
// shifts the calendar day for any timezone offset from UTC - e.g. in IST
// (UTC+5:30), toISOString() returns "yesterday" for every local time before
// 05:30 AM. Postgres `date` columns (sale_date, procurement_date, ...) are
// timezone-less calendar dates, and a human typing/expecting "today" always
// means their own local calendar day - so every date-range query or
// date-input default in this app must go through this function instead of
// `.toISOString().slice(0, 10)`, or a date-filtered query and the row it's
// supposed to match can disagree about what day "today" is.
export function toLocalISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getLocalToday() {
  return toLocalISODate(new Date())
}

// `new Date('2026-08-15')` (a bare date string) parses as UTC midnight, not
// local midnight - the mirror-image of the toLocalISODate bug. Parsing the
// Y/M/D fields directly into the local-time Date constructor (`new
// Date(y, m, d)`, multi-argument form) sidesteps that entirely.
function parseLocalDate(isoDateStr) {
  const [year, month, day] = isoDateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Whole calendar days between `isoDateStr` and today, both computed in local
// time - "days since a sale/expense/etc." must never fall back to raw
// epoch-ms subtraction (Date.now() - new Date(isoDateStr)), which mixes a
// UTC-anchored instant with a local one and silently miscounts today/
// yesterday depending on the caller's UTC offset and time of day.
export function daysSince(isoDateStr) {
  if (!isoDateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const then = parseLocalDate(isoDateStr)
  return Math.round((today.getTime() - then.getTime()) / (24 * 60 * 60 * 1000))
}

// `daysAgo` is null when there's no date at all (e.g. a mart with no sales
// yet) - distinct from 0, which means "today".
export function formatDaysAgo(daysAgo) {
  if (daysAgo === null || daysAgo === undefined) return 'No sales yet'
  if (daysAgo <= 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return `${daysAgo} days ago`
}
