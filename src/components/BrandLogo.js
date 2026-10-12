import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Rect } from 'react-native-svg'

// The Pardz car logo — same lucide "car-front" icon and blue gradient tile as the admin/customer web apps.
export function CarFrontIcon({ size = 24, color = 'white', strokeWidth = 2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" />
      <Path d="M7 14h.01" />
      <Path d="M17 14h.01" />
      <Rect width="18" height="8" x="3" y="10" rx="2" />
      <Path d="M5 18v2" />
      <Path d="M19 18v2" />
    </Svg>
  )
}

export default function BrandLogo({ size = 56 }) {
  return (
    <LinearGradient
      colors={['#123c73', '#1d5aa0', '#315bd4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      accessibilityLabel="Pardz Car Rental"
      style={{
        width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(151, 198, 255, 0.45)',
      }}
    >
      <CarFrontIcon size={size * 0.54} strokeWidth={2.2} />
    </LinearGradient>
  )
}
