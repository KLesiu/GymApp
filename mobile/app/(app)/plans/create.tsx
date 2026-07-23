import { ApiError } from "@/api/client";
import { useActivatePlan, useCreatePlan, useExercises } from "@/api/domain";
import {
  Button,
  Card,
  ErrorState,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

type DraftExercise = {
  readonly exerciseId: string;
  readonly series: string;
};

export default function CreatePlan() {
  const exercises = useExercises();
  const createPlan = useCreatePlan();
  const activatePlan = useActivatePlan();
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const exerciseById = useMemo(
    () =>
      new Map(
        exercises.data?.map((exercise) => [exercise._id, exercise]) ?? [],
      ),
    [exercises.data],
  );
  const filteredExercises = useMemo(
    () =>
      exercises.data
        ?.filter((exercise) =>
          exercise.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 20) ?? [],
    [exercises.data, query],
  );
  const canCreate = Boolean(
    name.trim() &&
      draftExercises.length > 0 &&
      !createPlan.isPending &&
      !activatePlan.isPending,
  );

  const addExercise = (exerciseId: string) => {
    setMessage(null);
    setDraftExercises((current) =>
      current.some((item) => item.exerciseId === exerciseId)
        ? current
        : [...current, { exerciseId, series: "3" }],
    );
  };

  const removeExercise = (exerciseId: string) => {
    setDraftExercises((current) =>
      current.filter((item) => item.exerciseId !== exerciseId),
    );
  };

  const updateSeries = (exerciseId: string, series: string) => {
    setDraftExercises((current) =>
      current.map((item) =>
        item.exerciseId === exerciseId ? { ...item, series } : item,
      ),
    );
  };

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("Enter a plan name first.");
      return;
    }
    if (draftExercises.length === 0) {
      setMessage("Select at least one exercise.");
      return;
    }

    const planExercises = draftExercises.map((item, index) => ({
      exerciseId: item.exerciseId,
      series: Number.parseInt(item.series, 10),
      repsTarget: 10,
      orderIndex: index,
    }));
    if (
      planExercises.some(
        (exercise) => !Number.isInteger(exercise.series) || exercise.series < 1,
      )
    ) {
      setMessage("Every selected exercise needs at least one series.");
      return;
    }

    createPlan.mutate(
      {
        name: trimmedName,
        description: "Created in mobile",
        days: [{ name: "Day 1", orderIndex: 0, exercises: planExercises }],
      },
      {
        onSuccess: (plan) => {
          activatePlan.mutate(plan._id);
          router.replace("/(app)/plans");
        },
        onError: (error) => {
          setMessage(
            error instanceof ApiError ? error.code : "Could not create plan.",
          );
        },
      },
    );
  };

  return (
    <Screen title="Create plan">
      {exercises.isError ? (
        <ErrorState
          message="Could not load exercises."
          onRetry={() => void exercises.refetch()}
        />
      ) : null}

      <Card>
        <Text variant="subtitle">1. Name</Text>
        <TextField label="Plan name" value={name} onChangeText={setName} />
      </Card>

      <Card>
        <Text variant="subtitle">2. Pick exercises</Text>
        <Text tone="muted">
          Search the library, then use the horizontal selector to add exercises
          without endless scrolling.
        </Text>
        <TextField
          label="Search exercises"
          value={query}
          onChangeText={setQuery}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {filteredExercises.map((exercise) => {
            const added = draftExercises.some(
              (item) => item.exerciseId === exercise._id,
            );
            return (
              <Card key={exercise._id} style={{ width: 210 }}>
                <Text variant="subtitle">{exercise.name}</Text>
                <Text variant="caption" tone="muted">
                  {exercise.isGlobal ? "Library" : "Custom"} ·{" "}
                  {exercise.muscleGroup?.name ?? exercise.formula}
                </Text>
                <Button
                  label={added ? "Added" : "Add"}
                  variant="secondary"
                  disabled={added}
                  onPress={() => addExercise(exercise._id)}
                />
              </Card>
            );
          })}
        </ScrollView>
      </Card>

      <Card>
        <Text variant="subtitle">3. Series per exercise</Text>
        {draftExercises.length ? (
          draftExercises.map((item) => {
            const exercise = exerciseById.get(item.exerciseId);
            return (
              <Card key={item.exerciseId}>
                <Text variant="subtitle">{exercise?.name ?? "Exercise"}</Text>
                <TextField
                  label="Series"
                  keyboardType="numeric"
                  value={item.series}
                  onChangeText={(value) => updateSeries(item.exerciseId, value)}
                />
                <Button
                  label="Remove"
                  variant="ghost"
                  onPress={() => removeExercise(item.exerciseId)}
                />
              </Card>
            );
          })
        ) : (
          <Text tone="muted">No exercises selected yet.</Text>
        )}
      </Card>

      {message ? <Text tone="danger">{message}</Text> : null}
      <Button
        label={
          createPlan.isPending || activatePlan.isPending
            ? "Creating..."
            : "Create and activate"
        }
        disabled={!canCreate}
        onPress={submit}
      />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
