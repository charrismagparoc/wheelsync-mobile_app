// Building blocks that match the admin console's look (wheelsync-admin src/index.css and PageParts.jsx):
//   AppShell   - blue gradient page background (.app-shell)
//   TopBar     - translucent header with a bottom border (.admin-topbar)
//   Card       - surface card (.card)
//   Button     - gradient primary / outlined ghost buttons (.btn-primary, .btn-ghost)
//   Fill       - gradient when active, plain surface otherwise (active tabs and chips)
//   Tabs       - pill tabs with an optional count badge
//   Pill       - small status badge (.badge)
//   Notice     - error / success banner
//   Stepper    - the 5-step rental progress shown on the admin Inspections page
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '../context/ThemeContext'
import { radius, signInGradient } from '../theme'

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }

export function AppShell({ children }) {
  const { colors, mode } = useAppTheme()
  return (
    <LinearGradient colors={colors.shell} locations={[0, 0.52, 1]} {...DIAGONAL} style={{ flex: 1 }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </LinearGradient>
  )
}

export function IconButton({ icon, label, onPress, color, size = 18 }) {
  const { colors } = useAppTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm,
        borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.bgSurface2 : 'transparent',
      })}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.textPrimary} />
    </Pressable>
  )
}

export function TopBar({ title, subtitle, onBack, left, right }) {
  const { colors } = useAppTheme()
  const insets = useSafeAreaInsets()
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 20,
        backgroundColor: colors.bar, borderBottomWidth: 1, borderBottomColor: colors.border,
      }}
    >
      {onBack ? <IconButton icon="chevron-back" label="Back" onPress={onBack} /> : left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{right}</View> : null}
    </View>
  )
}

export function Card({ children, style, onPress }) {
  const { colors } = useAppTheme()
  const base = [{ backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 16 }, colors.shadow, style]
  if (!onPress) return <View style={base}>{children}</View>
  return <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.85 }]}>{children}</Pressable>
}

// Card heading like the admin panels: sky-blue icon, title, optional status on the right.
export function SectionTitle({ icon, title, hint, right }) {
  const { colors } = useAppTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon ? <Ionicons name={icon} size={16} color={colors.nebula3} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '700' }}>{title}</Text>
        {hint ? <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>{hint}</Text> : null}
      </View>
      {right}
    </View>
  )
}

export function Fill({ active, colors: gradient, style, children }) {
  const { colors } = useAppTheme()
  if (active) return <LinearGradient colors={gradient ?? colors.gradient} locations={[0, 0.45, 1]} {...DIAGONAL} style={style}>{children}</LinearGradient>
  return <View style={style}>{children}</View>
}

// variant: primary (blue gradient) | signin (login gradient) | ghost (outlined) | danger (red outline)
export function Button({ title, onPress, variant = 'primary', icon, busy = false, disabled = false, style }) {
  const { colors } = useAppTheme()
  const off = disabled || busy
  const filled = variant === 'primary' || variant === 'signin'
  const textColor = filled ? 'white' : variant === 'danger' ? colors.danger : colors.textPrimary
  const box = {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 48, paddingHorizontal: 16, borderRadius: radius.sm,
    ...(filled ? null : { borderWidth: 1, borderColor: variant === 'danger' ? colors.danger : colors.border }),
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy }}
      style={({ pressed }) => [{ borderRadius: radius.sm, opacity: off ? 0.5 : pressed ? 0.85 : 1 }, style]}
    >
      <Fill active={filled} colors={variant === 'signin' ? signInGradient : undefined} style={box}>
        {busy ? <ActivityIndicator color={textColor} /> : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
            <Text style={{ color: textColor, fontWeight: '700', fontSize: 15 }}>{title}</Text>
          </>
        )}
      </Fill>
    </Pressable>
  )
}

export function Tabs({ options, value, onChange }) {
  const { colors } = useAppTheme()
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(({ key, label, count }) => {
        const selected = value === key
        return (
          <Pressable key={key} onPress={() => onChange(key)} accessibilityRole="tab" accessibilityState={{ selected }}>
            <Fill
              active={selected}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: selected ? undefined : colors.bgSurface2 }}
            >
              <Text style={{ color: selected ? 'white' : colors.textMuted, fontSize: 14, fontWeight: '600' }}>{label}</Text>
              {count > 0 ? (
                <View style={{ minWidth: 20, paddingHorizontal: 6, borderRadius: 999, backgroundColor: colors.danger, alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>{count}</Text>
                </View>
              ) : null}
            </Fill>
          </Pressable>
        )
      })}
    </View>
  )
}

const TONES = { success: 'success', info: 'nebula3', indigo: 'nebula2', warning: 'warning', danger: 'danger', muted: 'textFaint' }

export function Pill({ tone = 'muted', icon, children }) {
  const { colors } = useAppTheme()
  const color = colors[TONES[tone]] ?? colors.textMuted
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: tone === 'muted' ? colors.bgSurface2 : `${color}26`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
      {icon ? <Ionicons name={icon} size={12} color={color} /> : null}
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  )
}

export function Notice({ tone = 'error', children }) {
  const { colors } = useAppTheme()
  if (!children) return null
  const color = tone === 'success' ? colors.success : colors.danger
  return (
    <View style={{ backgroundColor: `${color}1f`, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
      <Text style={{ color, fontSize: 13 }}>{children}</Text>
    </View>
  )
}

// Plate number chip shown next to the car name, like the admin cards.
export function PlateChip({ children }) {
  const { colors } = useAppTheme()
  if (!children) return null
  return (
    <View style={{ backgroundColor: colors.bgSurface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>{children}</Text>
    </View>
  )
}

// Text input style shared by every form (input, select, textarea in the admin stylesheet).
export function inputStyle(colors) {
  return {
    backgroundColor: colors.bgSurface2, color: colors.textPrimary, fontSize: 15,
    borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: colors.border,
  }
}

export function Stepper({ steps }) {
  const { colors } = useAppTheme()
  const current = steps.findIndex((step) => !step.done)
  const line = (on, hidden) => <View style={{ flex: 1, height: 2, backgroundColor: hidden ? 'transparent' : on ? colors.success : colors.border }} />
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {steps.map((step, index) => {
        const state = step.done ? 'done' : index === current ? 'current' : 'todo'
        return (
          <View key={step.label} style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={`${step.label}: ${state === 'done' ? 'done' : state === 'current' ? 'in progress' : 'not yet'}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              {line(index > 0 && steps[index - 1].done, index === 0)}
              <View
                style={{
                  width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: state === 'done' ? colors.success : state === 'current' ? `${colors.warning}2e` : colors.bgSurface2,
                  borderWidth: state === 'current' ? 1.5 : 0, borderColor: colors.warning,
                }}
              >
                {state === 'done'
                  ? <Ionicons name="checkmark" size={15} color={colors.onSuccess} />
                  : <Text style={{ color: state === 'current' ? colors.warning : colors.textFaint, fontSize: 12, fontWeight: '800' }}>{index + 1}</Text>}
              </View>
              {line(step.done, index === steps.length - 1)}
            </View>
            <Text style={{ marginTop: 6, paddingHorizontal: 2, fontSize: 11, lineHeight: 14, textAlign: 'center', color: state === 'todo' ? colors.textFaint : colors.textMuted }}>{step.label}</Text>
          </View>
        )
      })}
    </View>
  )
}
