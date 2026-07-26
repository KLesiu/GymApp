import {
  type Gym,
  type PlanDay,
  useActivePlan,
  useCreateWorkout,
  useExercises,
  useGyms,
  useLastScores,
  useWorkouts,
} from "@/api/domain";
import {
  BenchmarkCard,
  EmptyState,
  ErrorState,
  Screen,
  Text,
} from "@/components/primitives";
import { formatDate } from "@/i18n";
import { theme } from "@/theme/tokens";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type SetupStep = "gym" | "day";

export default function WorkoutSetup() {
  const gyms = useGyms();
  const activePlan = useActivePlan();
  const exercises = useExercises();
  const workouts = useWorkouts();
  const create = useCreateWorkout();
  const [step, setStep] = useState<SetupStep>("gym");
  const [gymId, setGymId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStep("gym");
      setGymId(null);
      setMessage(null);
    }, []),
  );

  const selectedGym = useMemo(
    () => gyms.data?.find((gym) => gym._id === gymId) ?? null,
    [gymId, gyms.data],
  );

  const lastWorkoutByGym = useMemo(() => {
    const map = new Map<string, NonNullable<typeof workouts.data>[number]>();
    for (const workout of workouts.data ?? []) {
      if (workout.gymId && !map.has(workout.gymId))
        map.set(workout.gymId, workout);
    }
    return map;
  }, [workouts]);

  const chooseGym = (gym: Gym) => {
    setGymId(gym._id);
    setMessage(null);
    setStep("day");
  };

  const startPlanDay = async (day: PlanDay) => {
    if (!selectedGym) {
      setMessage("Choose a gym first.");
      setStep("gym");
      return;
    }

    if (!activePlan.data) {
      setMessage("Set an active plan first.");
      return;
    }

    const sets = day.exercises.flatMap((exercise) =>
      Array.from({ length: exercise.series }, (_unused, index) => ({
        exerciseId: exercise.exerciseId,
        series: index + 1,
        reps: null,
        weight: null,
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
      planId: activePlan.data._id,
      planDayId: day._id,
      startedAt: new Date().toISOString(),
      sets,
    });
    router.push({
      pathname: "/(app)/(tabs)/workout-session/[workoutId]",
      params: { workoutId: workout.id ?? workout._id },
    });
  };

  if (gyms.isError || activePlan.isError) {
    return (
      <Screen style={styles.screen}>
        <ErrorState
          message="Could not load workout setup."
          onRetry={() => {
            void gyms.refetch();
            void activePlan.refetch();
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
              onAction={() => router.push("/(app)/(tabs)/gyms")}
            />
          )}
        </>
      ) : (
        <>
          <Text variant="title" style={styles.title}>
            Choose a training day
          </Text>
          {activePlan.data ? (
            <Text tone="muted">Active plan: {activePlan.data.name}</Text>
          ) : null}
          {activePlan.data?.days.length ? (
            activePlan.data.days.map((day) => {
              const firstExercise = day.exercises[0];
              const exercise = exercises.data?.find(
                (item) => item._id === firstExercise?.exerciseId,
              );
              return (
                <Pressable
                accessibilityRole="button"
                disabled={create.isPending || exercises.isLoading}
                key={day._id}
                onPress={() => void startPlanDay(day)}
                style={styles.choiceCard}
              >
                  <View style={styles.dayHeader}>
                    <View>
                      <Text variant="heading1" style={styles.cardTitle}>
                        {day.name}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Week {day.weekNumber ?? 1} · {day.exercises.length} exercise(s)
                      </Text>
                    </View>
                    <Text variant="caption" tone="muted">
                      Tap to start
                    </Text>
                  </View>
                  {selectedGym && firstExercise ? (
                    <SameGymBenchmarkPreview
                      exerciseId={firstExercise.exerciseId}
                      exerciseName={exercise?.name}
                      gymId={selectedGym._id}
                      gymName={selectedGym.name}
                      series={1}
                    />
                  ) : null}
                </Pressable>
              );
            })
          ) : (
            <EmptyState
              title={
                activePlan.data
                  ? "Add a training day first"
                  : "Set an active plan first"
              }
              body={
                activePlan.data
                  ? "Training days define exercises and set slots for this workout."
                  : "Plans are activated on the Plans screen."
              }
              actionLabel="Open plans"
              onAction={() => router.push("/(app)/(tabs)/plans")}
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
  readonly lastWorkout?:
    | NonNullable<ReturnType<typeof useWorkouts>["data"]>[number]
    | undefined;
  readonly onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={styles.choiceCard}
  >
    <Text variant="heading1" style={styles.cardTitle}>
      {gym.name}
    </Text>
    <Text style={styles.cardSubtitle}>
      Last workout:{" "}
      {lastWorkout?.completedAt
        ? `${formatDate(lastWorkout.completedAt)} ${lastWorkout.planDay?.name ?? ""}`
        : "—"}
    </Text>
  </Pressable>
);

const SameGymBenchmarkPreview = ({
  exerciseId,
  exerciseName,
  gymId,
  gymName,
  series,
}: {
  readonly exerciseId: string;
  readonly exerciseName?: string | undefined;
  readonly gymId: string;
  readonly gymName: string;
  readonly series: number;
}) => {
  const { data, isPending, mutate } = useLastScores();

  useEffect(() => {
    mutate({
      exerciseId,
      ...(exerciseName ? { exerciseName } : {}),
      gymId,
      series,
    });
  }, [exerciseId, exerciseName, gymId, mutate, series]);

  if (isPending) {
    return <Text tone="muted">Loading same-gym benchmark...</Text>;
  }

  const benchmark = data?.find((score) => score.series === series);

  return (
    <BenchmarkCard
      gymName={benchmark?.gymName ?? gymName}
      previousDate={
        benchmark?.completedAt ?? benchmark?.date
          ? formatDate(benchmark.completedAt ?? benchmark.date ?? "")
          : undefined
      }
      weight={benchmark?.weight}
      reps={benchmark?.reps}
      series={series}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    gap: theme.space.lg,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
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
