import { Button, Card, Screen, Text } from "@/components/primitives";
import { brand, distributionLinks } from "@/config/brand";
import { useAuthStore } from "@/state/auth-store";
import { router } from "expo-router";

export default function More() {
  const clearSession = useAuthStore((state) => state.clearSession);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  return (
    <Screen title="More">
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
      <Button
        label="Polski"
        variant="ghost"
        onPress={() => setLanguage("pl")}
      />
      <Button
        label="English"
        variant="ghost"
        onPress={() => setLanguage("en")}
      />
      <Text tone="muted">Privacy: {distributionLinks.privacyPolicyUrl}</Text>
      <Button label="Log out" onPress={() => void clearSession()} />
    </Screen>
  );
}
