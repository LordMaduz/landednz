import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function RoadmapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roadmap</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
})
