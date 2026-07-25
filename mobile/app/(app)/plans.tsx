import { useActivatePlan, useActivePlan, usePlans } from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  Text,
} from "@/components/primitives";
import { theme } from "@/theme/tokens";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Plans() {
  const plans = usePlans();
  const activePlan = useActivePlan();
  const activatePlan = useActivatePlan();
  const activePlanId = activePlan.data?._id;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title">Plans</Text>
          <Text tone="muted">
            Choose which plan is active, or create a new one from the exercise library.
          </Text>
        </View>
        <IconButton
          name="add"
          label="Add new plan"
          onPress={() => router.push("/(app)/plans/create")}
        />
      </View>

      {plans.data?.length ? (
        plans.data.map((plan) => {
          const isActive = activePlanId === plan._id;
          const totalSeries = plan.days.reduce(
            (dayTotal, day) =>
              dayTotal +
              day.exercises.reduce(
                (total, exercise) => total + exercise.series,
                0,
              ),
            0,
          );
          return (
            <Card key={plan._id}>
              <Text variant="subtitle">{plan.name}</Text>
              <Text tone="muted">
                {plan.description ?? "Self-managed plan"}
              </Text>
              <Text variant="caption" tone={isActive ? "success" : "muted"}>
                {isActive ? "Active plan" : "Inactive"} · {plan.days.length}{" "}
                day(s) · {totalSeries} series
              </Text>
              {plan.days.map((day) => (
                <Text key={day._id} variant="caption" tone="muted">
                  {day.name}: {day.exercises.length} exercise(s)
                </Text>
              ))}
              <Button
                label={isActive ? "Currently active" : "Set active"}
                variant={isActive ? "secondary" : "primary"}
                disabled={isActive || activatePlan.isPending}
                onPress={() => activatePlan.mutate(plan._id)}
              />
            </Card>
          );
        })
      ) : (
        <EmptyState
          title="No plans yet"
          body="Create a plan first with the plus button. Plans define exercises and series, so workout setup can render the right input slots."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
  },
  headerText: { flex: 1, gap: theme.space.xs },
});
