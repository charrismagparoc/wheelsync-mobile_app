import { useState } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useAppTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import BrandLogo from '../components/BrandLogo'
import { AppShell, Button, Card, Notice, inputStyle } from '../components/ui'

// Same layout as the admin console's sign-in: logo tile, title, then the form in a card.
export default function LoginScreen() {
  const { signInWithPassword } = useAuth()
  const { colors } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit() {
    setError('')
    setBusy(true)
    const { error } = await signInWithPassword(email.trim(), password)
    setBusy(false)
    if (error) setError(error.message)
  }

  const label = { color: colors.textPrimary, fontSize: 14, fontWeight: '500' }

  return (
    <AppShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: insets.top + 12, right: 20, zIndex: 10 }}>
          <ThemeToggle />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View style={{ marginBottom: 16 }}><BrandLogo size={60} /></View>
            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700' }}>WheelSync Staff</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4, textAlign: 'center' }}>Pardz Car Rental staff app</Text>
          </View>

          <Card style={{ padding: 20, gap: 16 }}>
            <Notice>{error}</Notice>

            <View style={{ gap: 6 }}>
              <Text style={label}>Phone number or email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="09XX XXX XXXX or staff@email.com"
                placeholderTextColor={colors.textFaint}
                style={inputStyle(colors)}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={label}>Password</Text>
              <View style={{ justifyContent: 'center' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholder="••••••••"
                  placeholderTextColor={colors.textFaint}
                  style={[inputStyle(colors), { paddingRight: 48 }]}
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  hitSlop={8}
                  style={{ position: 'absolute', right: 12, padding: 4 }}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <Button variant="signin" title="Sign in" onPress={handleSubmit} busy={busy} disabled={!email || !password} style={{ marginTop: 4 }} />

            <Text style={{ color: colors.textFaint, fontSize: 12, textAlign: 'center' }}>
              Sign in with the account your admin created for you.
            </Text>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </AppShell>
  )
}
