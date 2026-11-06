import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAppTheme } from '../context/ThemeContext'
import { CarFrontIcon } from './BrandLogo'
import { Fill } from './ui'

// Bottom navigation shared by the Assigned tasks and Notifications screens.
// The active tab gets the same blue gradient pill as the admin console's sidebar.
export default function BottomBar({ navigation, active }) {
  const { colors } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [unread, setUnread] = useState(0)

  const loadUnread = useCallback(async () => {
    try {
      const { count } = await api.get('/notifications/unread-count')
      setUnread(count)
    } catch {
      // the screen above shows connection errors; the badge keeps its last value
    }
  }, [])

  useEffect(() => {
    loadUnread()
    return subscribe(['notifications'], loadUnread)
  }, [loadUnread])

  function openTasks() {
    if (active === 'tasks') return
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.navigate('Jobs')
  }

  function openNotifications() {
    if (active !== 'notifications') navigation.navigate('Notifications')
  }

  const iconColor = (name) => (active === name ? 'white' : colors.textMuted)
  const labelStyle = (name) => ({ color: active === name ? colors.textPrimary : colors.textMuted, fontSize: 11, fontWeight: '700' })
  const pill = { width: 60, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.bar, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}>
      <Pressable onPress={openTasks} accessibilityRole="tab" accessibilityState={{ selected: active === 'tasks' }} accessibilityLabel="Assigned tasks" style={{ flex: 1, alignItems: 'center', gap: 3 }}>
        <Fill active={active === 'tasks'} style={pill}>
          <CarFrontIcon size={20} color={iconColor('tasks')} />
        </Fill>
        <Text style={labelStyle('tasks')}>Assigned tasks</Text>
      </Pressable>
      <Pressable onPress={openNotifications} accessibilityRole="tab" accessibilityState={{ selected: active === 'notifications' }} accessibilityLabel={`Notifications, ${unread} unread`} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
        <Fill active={active === 'notifications'} style={pill}>
          <Ionicons name={active === 'notifications' ? 'notifications' : 'notifications-outline'} size={20} color={iconColor('notifications')} />
          {unread > 0 && (
            <View style={{ position: 'absolute', top: -2, right: 8, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </Fill>
        <Text style={labelStyle('notifications')}>Notifications</Text>
      </Pressable>
    </View>
  )
}
