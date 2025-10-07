import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}