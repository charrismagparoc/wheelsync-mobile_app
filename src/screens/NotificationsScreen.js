import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAppTheme } from '../context/ThemeContext'
import BottomBar from '../components/BottomBar'

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
    <View style={{ flex: 1, backgroundColor: colors.bgVoid }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Notifications</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{unread ? `${unread} unread` : 'You are all caught up.'}</Text>
        </View>
        {unread > 0 && (
          <Pressable onPress={markAllRead} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="checkmark-done" size={16} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textPrimary} />}
      >
        {error ? (
          <View style={{ backgroundColor: colors.danger + '1f', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.danger }}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}
        {notifications.length === 0 && !error ? (
          <View style={{ backgroundColor: colors.bgSurface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No notifications yet.</Text>
          </View>
        ) : null}
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            onPress={() => markRead(notification)}
            style={{
              flexDirection: 'row', gap: 12, backgroundColor: colors.bgSurface, borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: notification.is_read ? colors.border : colors.nebula3,
            }}
          >
            <Ionicons name={iconFor(notification.title)} size={20} color={notification.is_read ? colors.textMuted : colors.nebula3} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: notification.is_read ? '500' : '800' }}>{notification.title}</Text>
              {notification.body ? <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 3 }}>{notification.body}</Text> : null}
              <Text style={{ color: colors.textFaint, fontSize: 11, marginTop: 6 }}>{timeAgo(notification.created_at)}</Text>
            </View>
            {!notification.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.nebula3, marginTop: 6 }} />}
          </Pressable>
        ))}
      </ScrollView>
      <BottomBar navigation={navigation} active="notifications" />
    </View>
  )
}
