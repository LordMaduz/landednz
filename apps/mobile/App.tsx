import React from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from './src/hooks/useAuth'
import { LoginScreen } from './src/screens/LoginScreen'
import { RoadmapScreen } from './src/screens/RoadmapScreen'
import { ChatScreen } from './src/screens/ChatScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function App() {
  const { session, loading, signInWithGoogle, error } = useAuth()

  // Show loading spinner during auth check
  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />
  }

  // Show login screen when no authenticated session
  if (!session) {
    return (
      <LoginScreen
        onGoogleSignIn={signInWithGoogle}
        loading={loading}
        error={error}
      />
    )
  }

  // Show main app when authenticated
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Roadmap" component={RoadmapScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}