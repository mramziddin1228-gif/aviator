import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthSessionProvider } from '../src/providers/AuthSessionProvider';
import { authTheme } from '../theme/authTheme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthSessionProvider>
          <StatusBar
            animated
            backgroundColor="transparent"
            style="light"
            translucent={Platform.OS === 'android'}
          />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              navigationBarColor: authTheme.colors.background,
              contentStyle: {
                backgroundColor: 'transparent',
              },
              ...(Platform.OS === 'android'
                ? {
                    statusBarColor: 'transparent',
                    statusBarTranslucent: true,
                  }
                : {}),
            }}
          />
        </AuthSessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
