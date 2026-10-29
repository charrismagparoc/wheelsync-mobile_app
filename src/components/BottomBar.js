import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAppTheme } from '../context/ThemeContext'
import { CarFrontIcon } from './BrandLogo'

// Bottom navigation shared by the Assigned tasks and Notifications screens.
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

  const tabColor = (name) => (active === name ? colors.nebula3 : colors.textMuted)

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.bgSurface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}>
      <Pressable onPress={openTasks} accessibilityRole="button" accessibilityLabel="Assigned tasks" style={{ flex: 1, alignItems: 'center', gap: 3 }}>
        <CarFrontIcon size={22} color={tabColor('tasks')} />
        <Text style={{ color: tabColor('tasks'), fontSize: 11, fontWeight: '700' }}>Assigned tasks</Text>
      </Pressable>
      <Pressable onPress={openNotifications} accessibilityRole="button" accessibilityLabel={`Notifications, ${unread} unread`} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
        <View>
          <Ionicons name={active === 'notifications' ? 'notifications' : 'notifications-outline'} size={22} color={tabColor('notifications')} />
          {unread > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -10, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
        <Text style={{ color: tabColor('notifications'), fontSize: 11, fontWeight: '700' }}>Notifications</Text>
      </Pressable>
    </View>
  )
}
