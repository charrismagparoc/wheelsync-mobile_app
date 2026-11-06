import { useAppTheme } from '../context/ThemeContext'
import { IconButton } from './ui'

// Icon-only, like the admin console's theme button on small screens.
export default function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme()
  const isDark = mode === 'dark'
  return <IconButton icon={isDark ? 'sunny-outline' : 'moon-outline'} label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onPress={toggleTheme} />
}
