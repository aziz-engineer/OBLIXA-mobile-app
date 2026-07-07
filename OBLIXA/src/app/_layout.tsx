import { Stack } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="mes-informations" />
      <Stack.Screen name="mes-abonnements" />
      <Stack.Screen name="fidelite" />
      <Stack.Screen name="gerer-abonnement" />
      <Stack.Screen name="offreDetails" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="roulette" />
    </Stack>
  );
}