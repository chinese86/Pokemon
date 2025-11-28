import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        {/* Solo esta pantalla para las tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Modal opcional */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
