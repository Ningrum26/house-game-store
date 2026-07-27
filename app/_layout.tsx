import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Sniglet_400Regular, Sniglet_800ExtraBold } from '@expo-google-fonts/sniglet';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Sniglet_400Regular, Sniglet_800ExtraBold, Fredoka_600SemiBold, PlayfairDisplay_700Bold });

  if (!fontsLoaded) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
