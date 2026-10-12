import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../lib/api'
import { subscribe } from '../lib/realtime'
import { useAuth } from '../context/AuthContext'
import { useAppTheme } from '../context/ThemeContext'
import StatusBadge from '../components/StatusBadge'

const STEPS = [['pre_rental', 'Pre-rental inspection'], ['post_rental', 'Post-rental inspection']]

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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: color ?? colors.textPrimary, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  )

  const card = { backgroundColor: colors.bgSurface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }
  const secondaryButton = { backgroundColor: colors.bgSurface2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }
  const canInspect = isInspector && (status === 'accepted' || status === 'ongoing')

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgVoid }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Booking detail</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>
              {job.vehicles?.make} {job.vehicles?.model}
            </Text>
            <StatusBadge status={status} />
          </View>
          <Row label="Plate number" value={job.vehicles?.plate_number} />
          <Row label="Customer" value={job.profiles?.full_name} />
          <Row label="Phone" value={job.profiles?.phone ?? '—'} />
          <Row label="Rental period" value={`${job.start_date} → ${job.end_date}`} />
          {job.destination_from || job.destination_to ? <Row label="Destination" value={job.destination_from ? `${job.destination_from} → ${job.destination_to || '—'}` : job.destination_to} /> : null}
          <Row label="Pickup location" value={job.pickup_location ?? '—'} />
        </View>

        <View style={card}>
          <Text style={{ color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }}>Progress</Text>
          {STEPS.map(([type, label]) => {
            const inspection = job.inspections?.find((item) => item.type === type)
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

        <View style={{ gap: 10 }}>
          {isInspector && status === 'accepted' && (
            <Pressable onPress={markOngoing} disabled={busy} style={{ backgroundColor: colors.nebula3, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Start rental (mark ongoing)</Text>
            </Pressable>
          )}

          {canInspect && (
            <Pressable onPress={() => navigation.navigate('Inspection', { bookingId: job.id, type: 'pre_rental', job })} style={secondaryButton}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Do pre-rental inspection</Text>
            </Pressable>
          )}

          {canInspect && (
            <Pressable onPress={() => navigation.navigate('Inspection', { bookingId: job.id, type: 'post_rental', job })} style={secondaryButton}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Do post-rental inspection</Text>
            </Pressable>
          )}

          {isInspector && status === 'ongoing' && (
            <Pressable onPress={markCompleted} disabled={busy} style={{ backgroundColor: colors.success, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Mark rental completed</Text>
            </Pressable>
          )}

          {isCleaner && status === 'completed' && !job.cleaning_done_at && (
            <Pressable onPress={markCleaned} disabled={busy} style={{ backgroundColor: colors.nebula3, borderRadius: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Ionicons name="sparkles-outline" size={18} color="white" />
              <Text style={{ color: 'white', fontWeight: '700' }}>Mark cleaning done</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
