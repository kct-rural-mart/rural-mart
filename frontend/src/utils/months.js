// Shared month-bucketing helper for network-wide monthly trend charts
// (Finance, Farmers & Outreach, ...) - keeps every page's trailing-N-months
// window built the same way instead of each data module re-deriving it.
export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function buildTrendMonths(end, count) {
  const months = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1)
    months.push({ key: monthKey(d), label: d.toLocaleString('en-IN', { month: 'short' }) })
  }
  return months
}
