// Raw hex mirrors of the design tokens in src/index.css, for chart libraries
// (recharts) that need literal color strings rather than CSS classes.
// Keep these in sync with the --color-* custom properties in index.css.
export const CHART_COLORS = {
  primary: '#1a3d2e',
  accent: '#2f6b4f',
  border: '#e6eae7',
  textMuted: '#6c7d74',
  info: '#2563eb',
  warning: '#d97706',
  surface: '#ffffff',
  text: '#16241d',
}

// Light-only equivalent of the source design's getChartTheme(isDark) helper -
// this app has no dark mode toggle, so it always returns the light palette.
export function getChartTheme() {
  return {
    gridStroke: CHART_COLORS.border,
    textColor: CHART_COLORS.textMuted,
    tooltipBg: CHART_COLORS.surface,
    tooltipBorder: CHART_COLORS.border,
    tooltipTextColor: CHART_COLORS.text,
  }
}
