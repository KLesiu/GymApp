import { useActivatePlan, useActivePlan, usePlans } from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  Screen,
  Text,
} from "@/components/primitives";
import { router } from "expo-router";

export default function Plans() {
  const plans = usePlans();
  const activePlan = useActivePlan();
  const activatePlan = useActivatePlan();
  const activePlanId = activePlan.data?._id;

  return (
    <Screen title="Plans">
      <Card>
        <Text variant="subtitle">Your training plans</Text>
        <Text tone="muted">
          Choose which plan is active, or create a new one from the exercise
          library.
        </Text>
        <Button
          label="Add new plan"
          onPress={() => router.push("/(app)/plans/create")}
        />
      </Card>

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
          body="Create a plan first. Plans define exercises and series, so workout setup can render the right input slots."
          actionLabel="Add new plan"
          onAction={() => router.push("/(app)/plans/create")}
        />
      )}
    </Screen>
  );
}
