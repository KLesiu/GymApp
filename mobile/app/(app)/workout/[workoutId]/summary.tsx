import { Button, Card, Screen, Text } from "@/components/primitives";
import { router } from "expo-router";

export default function WorkoutSummary() {
  return (
    <Screen title="Workout saved">
      <Card>
        <Text variant="subtitle">Finalized safely</Text>
        <Text tone="muted">
          History, Elo, ranking, and benchmarks were invalidated after the
          idempotent finalize request.
        </Text>
      </Card>
      <Button
        label="Back to today"
        onPress={() => router.replace("/(app)/(tabs)/today")}
      />
    </Screen>
  );
}
