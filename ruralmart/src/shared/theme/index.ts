// Centralized theme tokens & visual constants for the EDF Rural Mart Enterprise Admin Dashboard

export const COLORS = {
  primaryForest: '#174F3A',
  darkForest: '#103A2B',
  mediumGreen: '#34735A',
  mutedTeal: '#4F8F78',
  softMint: '#E7F2EC',
  mintAccent: '#8ECAAA',
  oliveSage: '#6B8E7C',
  
  // Status Colors (Restrained)
  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#DCFCE7',
  
  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningBorder: '#FDE68A',
  
  critical: '#DC2626',
  criticalBg: '#FEE2E2',
  criticalBorder: '#FECACA',
  
  info: '#2563EB',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',

  // Dark Mode equivalents for status
  darkSuccessBg: '#143825',
  darkWarningBg: '#3D2D10',
  darkCriticalBg: '#3D1717',
  darkInfoBg: '#152A42',

  // Text
  textPrimary: '#17221D',
  textSecondary: '#66736C',
  textSubtle: '#8A958F',

  // Dark Text
  darkTextPrimary: '#E6ECE8',
  darkTextSecondary: '#8E9E96',
  darkTextSubtle: '#61736A',

  // Surfaces & Borders
  bgAppLight: '#F5F8F4',
  bgAppDark: '#0B130F',
  cardLight: '#FFFFFF',
  cardDark: '#121E19',
  borderLight: '#DDE6E0',
  borderDark: '#1E3129',
};

// Recharts shared theme options
export const getChartTheme = (isDark: boolean) => ({
  gridStroke: isDark ? '#1E3129' : '#E9EFEB',
  textColor: isDark ? '#8E9E96' : '#66736C',
  tooltipBg: isDark ? '#16241E' : '#FFFFFF',
  tooltipBorder: isDark ? '#23382F' : '#DDE6E0',
  tooltipTextColor: isDark ? '#E6ECE8' : '#17221D',
});
