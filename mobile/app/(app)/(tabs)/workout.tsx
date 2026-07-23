import { useActivePlan, useGyms } from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  Screen,
  Text,
} from "@/components/primitives";
import { router } from "expo-router";

export default function WorkoutTab() {
  const gyms = useGyms();
  const plan = useActivePlan();
  return (
    <Screen title="Workout">
      <Card>
        <Text variant="subtitle">Ready state</Text>
        <Text tone="muted">
          Choose a gym before training so records and benchmarks stay tied to
          the right location.
        </Text>
      </Card>
      {gyms.data?.length ? (
        <Button
          label="Set up workout"
          onPress={() => router.push("/(app)/workout/setup")}
        />
      ) : (
        <EmptyState
          title="Create a gym first"
          body="Comparative results are scoped to a location."
          actionLabel="Open gyms"
          onAction={() => router.push("/(app)/gyms")}
        />
      )}
      <Text tone="muted">Active plan: {plan.data?.name ?? "None"}</Text>
    </Screen>
  );
}
