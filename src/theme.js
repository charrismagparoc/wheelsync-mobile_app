// Shared design tokens for the WheelSync staff app.
// Same values as the admin console (wheelsync-admin src/index.css) so both apps look like one system:
// light mode is a lifted-tint version of dark mode, never a plain invert.

export const darkTheme = {
  mode: 'dark',
  bgVoid: '#060d1f',
  bgDeep: '#0a1530',
  bgSurface: '#0f1b3a',
  bgSurface2: '#16264d',
  border: 'rgba(150, 175, 225, 0.16)',
  textPrimary: '#eef3ff',
  textMuted: '#a3b3d6',
  textFaint: '#6c7ea6',
  nebula1: '#3d7bfa', // main blue
  nebula2: '#6d72f0', // indigo
  nebula3: '#38bdf8', // sky blue: links, highlights
  starGold: '#f5c542',
  success: '#4ade80',
  onSuccess: '#06281a',
  danger: '#fb7185',
  warning: '#fbbf24',
  gradient: ['#5865f2', '#3d7bfa', '#2fa8f5'], // --gradient-primary: buttons, active tabs
  shell: ['#081a40', '#10307a', '#1b2f86'], // .app-shell: page background
  bar: 'rgba(6, 13, 31, 0.18)', // .admin-topbar
  shadow: {},
}

export const lightTheme = {
  mode: 'light',
  bgVoid: '#eef4ff',
  bgDeep: '#f5f8ff',
  bgSurface: '#ffffff',
  bgSurface2: '#e7effc',
  border: 'rgba(70, 95, 150, 0.14)',
  textPrimary: '#13203d',
  textMuted: '#52607f',
  textFaint: '#8693b0',
  nebula1: '#2f6fe8',
  nebula2: '#5b6ee8',
  nebula3: '#1e9bd7',
  starGold: '#e0ab1f',
  success: '#16a34a',
  onSuccess: '#ffffff',
  danger: '#e11d48',
  warning: '#d97706',
  gradient: ['#4a63e6', '#2f6fe8', '#1e9bd7'],
  shell: ['#eaf3ff', '#dce9ff', '#e4e8ff'],
  bar: 'rgba(255, 255, 255, 0.62)',
  // [data-theme='light'] .card: 0 14px 32px rgba(55, 64, 126, 0.1)
  shadow: { shadowColor: '#37407e', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 14 }, elevation: 3 },
}

// Sign-in button on the login screen (.pardz-signin), same in both modes.
export const signInGradient = ['#174b8c', '#216fc1', '#4169e8']

export const radius = { sm: 10, md: 16, lg: 24 }
