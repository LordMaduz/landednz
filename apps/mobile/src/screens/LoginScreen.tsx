import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'

interface LoginScreenProps {
  onGoogleSignIn: () => Promise<void>
  loading: boolean
  error: string | null
}

export function LoginScreen({ onGoogleSignIn, loading, error }: LoginScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LandedNZ</Text>
        <Text style={styles.subtitle}>Your NZ settlement guide</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]}
          onPress={onGoogleSignIn}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>

        {/* Apple Sign-In — configured in AC-1-07 */}
        <TouchableOpacity
          style={[styles.button, styles.appleButton, styles.buttonDisabled]}
          disabled={true}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Apple — coming soon"
        >
          <Text style={[styles.buttonText, styles.appleButtonText]}>
            Sign in with Apple
          </Text>
        </TouchableOpacity>
      </View>

      {error !== null && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButtonText: {
    color: '#fff',
  },
  errorText: {
    marginTop: 16,
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  },
})