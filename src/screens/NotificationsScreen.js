import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAppTheme } from '../context/ThemeContext'
import BottomBar from '../components/BottomBar'
import { AppShell, Card, Notice, TopBar } from '../components/ui'

function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(value).toLocaleDateString()
}

function iconFor(title) {
  if (/due back|return reminder/i.test(title)) return 'alarm-outline'
  if (/clean/i.test(title)) return 'sparkles-outline'
  if (/verified/i.test(title)) return 'checkmark-circle-outline'
  if (/reassigned/i.test(title)) return 'swap-horizontal'
  if (/assigned/i.test(title)) return 'clipboard-outline'
  return 'notifications-outline'
}

export default function NotificationsScreen({ navigation }) {
  const { colors } = useAppTheme()
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setNotifications(await api.get('/notifications', { limit: 50 }))
    } catch (loadError) {
      setError(loadError.message || 'Unable to load notifications.')
    }
  }, [])

  useEffect(() => {
    load()
    return subscribe(['notifications'], load)
  }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function markRead(notification) {
    if (notification.is_read) return
    try {
      await api.post(`/notifications/${notification.id}/read`)
    } catch (updateError) {
      setError(updateError.message)
      return
    }
    load()
  }

  async function markAllRead() {
    try {
      await Promise.all(notifications.filter((n) => !n.is_read).map((n) => api.post(`/notifications/${n.id}/read`)))
    } catch (updateError) {
      setError(updateError.message)
    }
    load()
  }

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <AppShell>
      <TopBar
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'You are all caught up.'}
        right={unread > 0 ? (
          <Pressable
            onPress={markAllRead}
            accessibilityRole="button"
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.bgSurface2 : 'transparent' })}
          >
            <Ionicons name="checkmark-done" size={16} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>Mark all read</Text>
          </Pressable>
        ) : null}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textPrimary} colors={[colors.nebula1]} />}
      >
        <Notice>{error}</Notice>
        {notifications.length === 0 && !error ? (
          <Card style={{ padding: 28 }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No notifications yet.</Text>
          </Card>
        ) : null}
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            onPress={() => markRead(notification)}
            style={{ flexDirection: 'row', gap: 12, padding: 14, borderColor: notification.is_read ? colors.border : colors.nebula3 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: notification.is_read ? colors.bgSurface2 : `${colors.nebula3}26` }}>
              <Ionicons name={iconFor(notification.title)} size={18} color={notification.is_read ? colors.textMuted : colors.nebula3} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: notification.is_read ? '500' : '800' }}>{notification.title}</Text>
              {notification.body ? <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 3 }}>{notification.body}</Text> : null}
              <Text style={{ color: colors.textFaint, fontSize: 11, marginTop: 6 }}>{timeAgo(notification.created_at)}</Text>
            </View>
            {!notification.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.nebula3, marginTop: 6 }} />}
          </Card>
        ))}
      </ScrollView>
      <BottomBar navigation={navigation} active="notifications" />
    </AppShell>
  )
}
