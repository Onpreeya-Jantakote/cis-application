import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, onPress, disabled = false, loading = false }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});