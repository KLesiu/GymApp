import {
  useExercises,
  useFinalizeWorkout,
  useGyms,
  useLastScores,
} from "@/api/domain";
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

export default function ActiveWorkout() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const gyms = useGyms();
  const exercises = useExercises();
  const lastScores = useLastScores();
  const finalize = useFinalizeWorkout();
  const loadLastScores = lastScores.mutate;
  const [weight, setWeight] = useState("0");
  const [reps, setReps] = useState("8");
  const [confirm, setConfirm] = useState(false);
  const gym = gyms.data?.[0];
  const exercise = exercises.data?.[0];
  useEffect(() => {
    if (gym && exercise)
      loadLastScores({
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        series: 1,
        gymId: gym._id,
      });
  }, [gym, exercise, loadLastScores]);
  const operationId = useMemo(
    () => workoutId ?? String(Date.now()),
    [workoutId],
  );
  const previous = lastScores.data?.[0];

  return (
    <Screen title="Active workout">
      <Card>
        <Text variant="subtitle">Set 1</Text>
        <Text tone="muted">
          {exercise?.name ?? "Exercise"} · {gym?.name ?? "Location"}
        </Text>
        <TextField
          label="Weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <TextField
          label="Reps"
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
        />
      </Card>
      {previous ? (
        <Card>
          <Text variant="subtitle">Previous session · {gym?.name}</Text>
          <Text>
            {previous.weight} {previous.unit} × {previous.reps}
          </Text>
          <Text tone="muted">
            Series {previous.series} ·{" "}
            {previous.completedAt ?? previous.date ?? "date unavailable"}
          </Text>
          <Button
            label="Apply values"
            variant="secondary"
            onPress={() => {
              setWeight(String(previous.weight));
              setReps(String(previous.reps));
            }}
          />
        </Card>
      ) : (
        <EmptyState
          title="No same-gym benchmark"
          body="Scores from other gyms stay hidden in this context."
        />
      )}
      <Button
        label={finalize.isPending ? "Finalizing..." : "Finalize workout"}
        disabled={finalize.isPending}
        onPress={() =>
          workoutId &&
          finalize.mutate(
            { workoutId, operationId },
            {
              onSuccess: () =>
                router.replace(`/(app)/workout/${workoutId}/summary`),
            },
          )
        }
      />
      <Button
        label="Discard draft"
        variant="ghost"
        onPress={() => setConfirm(true)}
      />
      <Dialog
        visible={confirm}
        title="Discard draft?"
        body="Unfinished workout input will be lost."
        confirmLabel="Discard"
        onConfirm={() => router.back()}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}
