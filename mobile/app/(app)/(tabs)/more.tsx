import { useMe } from "@/api/domain";
import { Button, Card, Screen, Text } from "@/components/primitives";
import { TrainingHeader } from "@/components/workout-layout";
import { brand } from "@/config/brand";
import { useAuthStore } from "@/state/auth-store";
import { theme } from "@/theme/tokens";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export default function More() {
  const me = useMe();
  const clearSession = useAuthStore((state) => state.clearSession);
  const logOut = async () => {
    await clearSession();
    router.replace("/(auth)/welcome");
  };

  return (
    <Screen>
      <TrainingHeader title="More" name={me.data?.name ?? "Athlete"} />
      <Card>
        <Text variant="subtitle">{brand.appName}</Text>
        <Text tone="muted">{brand.tagline}</Text>
      </Card>
      <Button
        label="Plans"
        variant="secondary"
        onPress={() => router.push("/(app)/plans")}
      />
      <Button
        label="Exercises"
        variant="secondary"
        onPress={() => router.push("/(app)/exercises")}
      />
      <Button
        label="Gyms"
        variant="secondary"
        onPress={() => router.push("/(app)/gyms")}
      />
      <Button
        label="Measurements"
        variant="secondary"
        onPress={() => router.push("/(app)/measurements")}
      />
      <Button
        label="Profile"
        variant="secondary"
        onPress={() => router.push("/(app)/profile")}
      />
      <View style={styles.logoutSection}>
        <Text variant="caption" tone="muted">
          Session
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void logOut()}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoutSection: {
    gap: theme.space.sm,
    marginTop: theme.space.xl,
    paddingTop: theme.space.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    minHeight: theme.control.height,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.space.xl,
    backgroundColor: theme.colors.danger,
  },
  logoutButtonPressed: { transform: [{ scale: 0.98 }] },
  logoutButtonText: { color: theme.colors.actionText },
});
