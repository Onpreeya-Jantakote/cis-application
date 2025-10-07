import { Stack, Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💻</Text>
        <Text style={styles.appName}>CIS Community</Text>
        <Text style={styles.subtitle}>KKU Computer Science</Text>
      </View>
      <View style={styles.loadingIndicator}>
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
      </View>
    </View>
  );
}

// Tab Bar Icon Component
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
}

export default function RootLayout() {
  const { user, loading } = useAuth();

  // Show splash screen while loading
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: styles.content,
      }}
    >
      {!user ? (
        <Stack.Screen 
          name="login" 
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 4,
  },
  
  content: {
    backgroundColor: '#f8fafc',
  },
});