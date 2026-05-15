import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <Stack initialRouteName="login">
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="provider" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ title: "Event Details" }} />
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="plumber" options={{ title: "Plumber List" }} />
      <Stack.Screen name="OrderView" options={{ title: "Order View" }} />
    </Stack>
  );
}
