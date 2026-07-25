import { Button, Screen, Text } from "@/components/primitives";
import { useAuthStore } from "@/state/auth-store";

export default function TrainerOnly() {
  const clearSession = useAuthStore((state) => state.clearSession);
  return (
    <Screen title="Trainer workspace">
      <Text tone="muted">
        Trainer-only accounts are handled in the web panel. Mobile flows focus
        on trainee training, measurements, and collaboration.
      </Text>
      <Button label="Log out" onPress={() => void clearSession()} />
    </Screen>
  );
}
