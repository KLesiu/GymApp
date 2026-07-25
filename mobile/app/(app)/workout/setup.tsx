import {
  type Gym,
  type Plan,
  useCreateWorkout,
  useExercises,
  useGyms,
  usePlans,
  useWorkouts,
} from "@/api/domain";
import { EmptyState, ErrorState, Screen, Text } from "@/components/primitives";
import { formatDate } from "@/i18n";
import { theme } from "@/theme/tokens";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type SetupStep = "gym" | "plan";

export default function WorkoutSetup() {
  const gyms = useGyms();
  const plans = usePlans();
  const exercises = useExercises();
  const workouts = useWorkouts();
  const create = useCreateWorkout();
  const [step, setStep] = useState<SetupStep>("gym");
  const [gymId, setGymId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedGym = useMemo(
    () => gyms.data?.find((gym) => gym._id === gymId) ?? null,
    [gymId, gyms.data],
  );

  const lastWorkoutByGym = useMemo(() => {
    const map = new Map<string, NonNullable<typeof workouts.data>[number]>();
    for (const workout of workouts.data ?? []) {
      if (workout.gymId && !map.has(workout.gymId)) map.set(workout.gymId, workout);
    }
    return map;
  }, [workouts]);

  const chooseGym = (gym: Gym) => {
    setGymId(gym._id);
    setMessage(null);
    setStep("plan");
  };

  const startPlan = async (plan: Plan) => {
    if (!selectedGym) {
      setMessage("Choose a gym first.");
      setStep("gym");
      return;
    }

    const selectedDay = plan.days[0] ?? null;
    if (!selectedDay) {
      setMessage("This plan has no training day.");
      return;
    }

    const sets = selectedDay.exercises.flatMap((exercise) =>
      Array.from({ length: exercise.series }, (_unused, index) => ({
        exerciseId: exercise.exerciseId,
        series: index + 1,
        reps: exercise.repsTarget,
        weight: 0,
        unit: "KILOGRAMS" as const,
      })),
    );

    if (sets.length === 0) {
      setMessage("The selected plan has no exercise slots.");
      return;
    }

    setMessage(null);
    const workout = await create.mutateAsync({
      gymId: selectedGym._id,
      planId: plan._id,
      planDayId: selectedDay._id,
      startedAt: new Date().toISOString(),
      sets,
    });
    router.push(`/(app)/workout/${workout.id ?? workout._id}`);
  };

  if (gyms.isError || plans.isError) {
    return (
      <Screen style={styles.screen}>
        <ErrorState
          message="Could not load workout setup."
          onRetry={() => {
            void gyms.refetch();
            void plans.refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <Text variant="title">Workout setup</Text>

      {step === "gym" ? (
        <>
          <Text variant="title" style={styles.title}>
            Choose a gym
          </Text>
          {gyms.data?.length ? (
            gyms.data.map((gym) => (
              <GymCard
                key={gym._id}
                gym={gym}
                {...(lastWorkoutByGym.get(gym._id)
                  ? { lastWorkout: lastWorkoutByGym.get(gym._id) }
                  : {})}
                onPress={() => chooseGym(gym)}
              />
            ))
          ) : (
            <EmptyState
              title="Create a gym first"
              body="Workout sessions need a gym context."
              actionLabel="Open gyms"
              onAction={() => router.push("/(app)/gyms")}
            />
          )}
        </>
      ) : (
        <>
          <Text variant="title" style={styles.title}>
            Choose a training day
          </Text>
          {plans.data?.length ? (
            plans.data.map((plan) => (
              <Pressable
                accessibilityRole="button"
                disabled={create.isPending || exercises.isLoading}
                key={plan._id}
                onPress={() => void startPlan(plan)}
                style={styles.choiceCard}
              >
                <Text variant="heading1" style={styles.cardTitle}>
                  {plan.days[0]?.name ?? plan.name}
                </Text>
              </Pressable>
            ))
          ) : (
            <EmptyState
              title="Create a plan first"
              body="Plans define exercises and set slots for this workout."
              actionLabel="Open plans"
              onAction={() => router.push("/(app)/plans")}
            />
          )}
        </>
      )}

      {message ? <Text style={styles.errorText}>{message}</Text> : null}
    </Screen>
  );
}

const GymCard = ({
  gym,
  lastWorkout,
  onPress,
}: {
  readonly gym: Gym;
  readonly lastWorkout?: NonNullable<ReturnType<typeof useWorkouts>["data"]>[number] | undefined;
  readonly onPress: () => void;
}) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={styles.choiceCard}>
    <Text variant="heading1" style={styles.cardTitle}>
      {gym.name}
    </Text>
    <Text style={styles.cardSubtitle}>
      Last workout: {lastWorkout?.completedAt ? `${formatDate(lastWorkout.completedAt)} ${lastWorkout.planDay?.name ?? ""}` : "—"}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: {
    gap: theme.space.lg,
  },
  title: {
    marginBottom: theme.space.xs,
  },
  choiceCard: {
    minHeight: 96,
    justifyContent: "center",
    gap: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {},
  cardSubtitle: { color: theme.colors.textMuted, fontSize: 16, lineHeight: 24 },
  errorText: { color: theme.colors.danger },
});
