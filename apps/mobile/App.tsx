import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold'
      }}>
        HELLO WORLD
      </Text>
    </View>
  );
}
