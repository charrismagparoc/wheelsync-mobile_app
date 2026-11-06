import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAuth } from '../context/AuthContext'
import { useAppTheme } from '../context/ThemeContext'
import StatusBadge from '../components/StatusBadge'
import BrandLogo from '../components/BrandLogo'
import { AppShell, Button, Card, PlateChip, SectionTitle, Stepper, TopBar } from '../components/ui'

const STEPS = [['pre_rental', 'Pre-rental inspection'], ['post_rental', 'Post-rental inspection']]

// An inspection can be saved more than once: show the one still waiting for the admin, else the latest.
function inspectionOf(job, type) {
  const submissions = (job.inspections ?? []).filter((item) => item.type === type)
  return submissions.find((item) => !item.verified_at) ?? submissions[submissions.length - 1]
}

// Same five steps as the admin console's Inspections page.
function progressSteps(job) {
  const inspections = job.inspections ?? []
  const returned = job.status === 'completed'
  const verified = inspections.length > 0 && inspections.every((item) => item.verified_at)
  return [
    { label: 'Pre-rental check', done: inspections.some((item) => item.type === 'pre_rental') },
    { label: 'Rented out', done: job.status === 'ongoing' || returned },
    { label: 'Post-rental check', done: inspections.some((item) => item.type === 'post_rental') },
    { label: 'Cleaning', done: Boolean(job.cleaning_done_at) },
    { label: 'Back on fleet', done: returned && verified && Boolean(job.cleaning_done_at) },
  ]
}

export default function JobDetailScreen({ route, navigation }) {
  const { profile } = useAuth()
  const { colors } = useAppTheme()
  const [job, setJob] = useState(route.params.job)
  const [busy, setBusy] = useState(false)
  const status = job.status
  const isInspector = job.assigned_staff_id === profile?.id
  const isCleaner = job.cleaning_staff_id === profile?.id

  // Refresh after an inspection is saved, the admin verifies it, or the task is reassigned.
  const load = useCallback(async () => {
    try {
      setJob(await api.get(`/bookings/${route.params.job.id}`))
    } catch (error) {
      if (error.status === 404) {
        Alert.alert('Task reassigned', 'This task was moved to another staff member.')
        navigation.goBack()
      }
    }
  }, [route.params.job.id, navigation])

  useFocusEffect(useCallback(() => { load() }, [load]))
  useEffect(() => subscribe(['bookings'], load), [load])

  async function runAction(path, onDone) {
    setBusy(true)
    try {
      setJob(await api.post(`/bookings/${job.id}/${path}`))
      onDone?.()
    } catch (error) {
      if (error.status === 409 && /post-rental inspection/i.test(error.message)) {
        Alert.alert('Post-rental inspection required', 'Complete and save the post-rental inspection before releasing this vehicle.')
      } else {
        Alert.alert('Error', error.message)
      }
    }
    setBusy(false)
  }

  const markOngoing = () => runAction('start')
  const markCompleted = () => runAction('complete', () => Alert.alert(
    'Booking completed',
    'The vehicle is now waiting for the admin to verify the post-rental inspection and for cleaning.',
  ))
  const markCleaned = () => runAction('cleaning-done', () => Alert.alert(
    'Cleaning done',
    'The admin has been notified. The vehicle goes back on the fleet once its inspection is verified.',
  ))

  const Row = ({ label, value, color }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 }}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: color ?? colors.textPrimary, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  )

  const canInspect = isInspector && (status === 'accepted' || status === 'ongoing')

  return (
    <AppShell>
      <TopBar onBack={() => navigation.goBack()} title="Booking detail" subtitle={job.vehicles?.plate_number} />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <BrandLogo size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}>{job.vehicles?.make} {job.vehicles?.model}</Text>
                <PlateChip>{job.vehicles?.plate_number}</PlateChip>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 3 }}>{job.profiles?.full_name}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 1 }}>{job.start_date} → {job.end_date}</Text>
            </View>
            <StatusBadge status={status} />
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
            <Row label="Phone" value={job.profiles?.phone ?? '—'} />
            {job.destination_from || job.destination_to ? <Row label="Destination" value={job.destination_from ? `${job.destination_from} → ${job.destination_to || '—'}` : job.destination_to} /> : null}
            <Row label="Pickup location" value={job.pickup_location ?? '—'} />
          </View>
        </Card>

        <Card style={{ gap: 16 }}>
          <SectionTitle icon="git-commit-outline" title="Progress" />
          <Stepper steps={progressSteps(job)} />
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
            {STEPS.map(([type, label]) => {
              const inspection = inspectionOf(job, type)
              const value = !inspection ? 'Not done' : inspection.verified_at ? 'Done · verified by admin' : 'Done · waiting for admin'
              const color = !inspection ? colors.textFaint : inspection.verified_at ? colors.success : colors.warning
              return <Row key={type} label={label} value={value} color={color} />
            })}
            {status === 'completed' && (
              <Row
                label="Cleaning"
                value={job.cleaning_done_at ? 'Done' : isCleaner ? 'Assigned to you' : 'Assigned to another staff'}
                color={job.cleaning_done_at ? colors.success : colors.warning}
              />
            )}
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          {isInspector && status === 'accepted' && (
            <Button icon="car-outline" title="Start rental (mark ongoing)" onPress={markOngoing} busy={busy} />
          )}
          {canInspect && (
            <Button variant="ghost" icon="clipboard-outline" title="Do pre-rental inspection" onPress={() => navigation.navigate('Inspection', { bookingId: job.id, type: 'pre_rental', job })} />
          )}
          {canInspect && (
            <Button variant="ghost" icon="clipboard-outline" title="Do post-rental inspection" onPress={() => navigation.navigate('Inspection', { bookingId: job.id, type: 'post_rental', job })} />
          )}
          {isInspector && status === 'ongoing' && (
            <Button icon="checkmark-circle-outline" title="Mark rental completed" onPress={markCompleted} busy={busy} />
          )}
          {isCleaner && status === 'completed' && !job.cleaning_done_at && (
            <Button icon="sparkles-outline" title="Mark cleaning done" onPress={markCleaned} busy={busy} />
          )}
        </View>
      </ScrollView>
    </AppShell>
  )
}
