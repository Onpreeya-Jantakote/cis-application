import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1e40af" />
      <Text style={styles.text}>กำลังโหลด...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});