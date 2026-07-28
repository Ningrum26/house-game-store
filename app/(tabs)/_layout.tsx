import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PINK_PASTEL } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PINK_PASTEL.primaryDark,
        tabBarInactiveTintColor: '#C494AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: PINK_PASTEL.border,
          height: Platform.OS === 'web' ? 80 : 65,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'web' ? 8 : 10,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Toko',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="storefront" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="receipt-long" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="smart-toy" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
