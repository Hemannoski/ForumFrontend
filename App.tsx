import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { RootNavigator } from './src/navigation';
import { RefreshProvider } from './src/state/RefreshContext';
import { NotificationsProvider } from './src/state/NotificationsContext';
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RefreshProvider>
          <NotificationsProvider>
            <RootNavigator />
          </NotificationsProvider>
          <StatusBar style="dark" />
        </RefreshProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
