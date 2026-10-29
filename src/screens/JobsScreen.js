import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAuth } from '../context/AuthContext'
import { useAppTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import StatusBadge from '../components/StatusBadge'
import BrandLogo from '../components/BrandLogo'
import BottomBar from '../components/BottomBar'

const FILTERS = [['active', 'To do'], ['completed', 'Done']]

export default function JobsScreen({ navigation }) {
  const { profile, signOut } = useAuth()
  const { colors } = useAppTheme()
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('active')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setJobs(await api.get('/bookings', { sort: 'start_asc' }))
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your staff workspace.')
    }
  }, [])

  useEffect(() => {
    load()
    return subscribe(['bookings'], load)
  }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  // A returned vehicle is still a task for the staff member assigned to clean it.
  const needsCleaning = (job) => job.status === 'completed' && job.cleaning_staff_id === profile?.id && !job.cleaning_done_at
  const isTodo = (job) => job.status !== 'completed' || needsCleaning(job)
  const activeCount = jobs.filter(isTodo).length
  const visibleJobs = jobs.filter((job) => isTodo(job) === (filter === 'active'))

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgVoid }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <BrandLogo size={42} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Assigned tasks</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Hi {profile?.full_name?.split(' ')[0]}, {activeCount} {activeCount === 1 ? 'task' : 'tasks'} to do.</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ThemeToggle />
          <Pressable onPress={signOut} accessibilityLabel="Sign out" style={{ padding: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
            <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        {FILTERS.map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: filter === key ? colors.nebula3 : colors.bgSurface2 }}
          >
            <Text style={{ color: filter === key ? 'white' : colors.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textPrimary} />}
      >
        {error ? (
          <View style={{ backgroundColor: colors.danger + '1f', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.danger }}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}
        {visibleJobs.length === 0 && (
          <View style={{ backgroundColor: colors.bgSurface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              {filter === 'active' ? 'No tasks assigned yet. Pull down to refresh.' : 'No completed tasks yet.'}
            </Text>
          </View>
        )}
        {visibleJobs.map((job) => (
          <Pressable
            key={job.id}
            onPress={() => navigation.navigate('JobDetail', { job })}
            style={{ backgroundColor: colors.bgSurface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {job.vehicles?.make} {job.vehicles?.model} ({job.vehicles?.plate_number})
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 3 }}>
                  {job.profiles?.full_name} · {job.profiles?.phone}
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 3 }}>
                  {job.start_date} → {job.end_date}
                </Text>
              </View>
              {needsCleaning(job) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.nebula3 + '26', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                  <Ionicons name="sparkles-outline" size={12} color={colors.nebula3} />
                  <Text style={{ color: colors.nebula3, fontSize: 12, fontWeight: '700' }}>Cleaning</Text>
                </View>
              ) : <StatusBadge status={job.status} />}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <BottomBar navigation={navigation} active="tasks" />
    </View>
  )
}
