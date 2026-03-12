import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function RoadmapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Roadmap</Text>
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
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
})