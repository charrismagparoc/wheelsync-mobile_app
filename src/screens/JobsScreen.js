import { useCallback, useEffect, useState } from 'react'
import { View, Text, RefreshControl, ScrollView } from 'react-native'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAuth } from '../context/AuthContext'
import { useAppTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import StatusBadge from '../components/StatusBadge'
import BrandLogo from '../components/BrandLogo'
import BottomBar from '../components/BottomBar'
import { AppShell, Card, IconButton, Notice, Pill, PlateChip, Tabs, TopBar } from '../components/ui'

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
    <AppShell>
      <TopBar
        left={<BrandLogo size={38} />}
        title="Assigned tasks"
        subtitle={`Hi ${profile?.full_name?.split(' ')[0] ?? ''}, ${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} to do.`}
        right={<><ThemeToggle /><IconButton icon="log-out-outline" label="Sign out" onPress={signOut} /></>}
      />

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Card style={{ padding: 12 }}>
          <Tabs
            value={filter}
            onChange={setFilter}
            options={[{ key: 'active', label: 'To do', count: activeCount }, { key: 'completed', label: 'Done' }]}
          />
        </Card>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textPrimary} colors={[colors.nebula1]} />}
      >
        <Notice>{error}</Notice>
        {visibleJobs.length === 0 && (
          <Card style={{ padding: 28 }}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              {filter === 'active' ? 'No tasks assigned yet. Pull down to refresh.' : 'No completed tasks yet.'}
            </Text>
          </Card>
        )}
        {visibleJobs.map((job) => (
          <Card key={job.id} onPress={() => navigation.navigate('JobDetail', { job })}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <BrandLogo size={42} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>{job.vehicles?.make} {job.vehicles?.model}</Text>
                  <PlateChip>{job.vehicles?.plate_number}</PlateChip>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                  {job.profiles?.full_name}{job.profiles?.phone ? ` · ${job.profiles.phone}` : ''}
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 2 }}>{job.start_date} → {job.end_date}</Text>
                <View style={{ marginTop: 10 }}>
                  {needsCleaning(job) ? <Pill tone="info" icon="sparkles-outline">Cleaning</Pill> : <StatusBadge status={job.status} />}
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
      <BottomBar navigation={navigation} active="tasks" />
    </AppShell>
  )
}
