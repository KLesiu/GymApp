import { ApiError } from "@/api/client";
import { useExercises, useMuscleGroups, useUpsertExercise } from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { useMemo, useState } from "react";

export default function Exercises() {
  const exercises = useExercises();
  const groups = useMuscleGroups();
  const create = useUpsertExercise();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const trimmedName = name.trim();
  const filtered = useMemo(
    () =>
      exercises.data?.filter((exercise) =>
        exercise.name.toLowerCase().includes(query.toLowerCase()),
      ) ?? [],
    [exercises.data, query],
  );
  const firstGroup = groups.data?.[0]?._id;
  const createDisabled =
    create.isPending || groups.isLoading || !firstGroup || !trimmedName;

  const createExercise = () => {
    if (!firstGroup) {
      setMessage(
        "No muscle groups are available yet. Use a library exercise or try again after the library loads.",
      );
      return;
    }
    if (!trimmedName) {
      setMessage("Enter an exercise name first.");
      return;
    }
    setMessage(null);
    create.mutate(
      {
        name: trimmedName,
        muscleGroupId: firstGroup,
        formula: "STANDARD",
      },
      {
        onSuccess: () => {
          setName("");
          setMessage("Exercise created.");
        },
        onError: (error) => {
          setMessage(
            error instanceof ApiError
              ? error.code
              : "Could not create exercise.",
          );
        },
      },
    );
  };

  return (
    <Screen title="Exercises">
      <TextField label="Search" value={query} onChangeText={setQuery} />
      {groups.isError ? (
        <ErrorState
          message="Could not load muscle groups for custom exercises."
          onRetry={() => void groups.refetch()}
        />
      ) : null}
      <Card>
        <Text variant="subtitle">Custom exercise</Text>
        <TextField label="Name" value={name} onChangeText={setName} />
        {!firstGroup && !groups.isLoading ? (
          <Text tone="muted">
            No muscle groups are available yet. The global exercise library will
            appear here once the API is seeded.
          </Text>
        ) : null}
        {message ? (
          <Text tone={message === "Exercise created." ? "success" : "danger"}>
            {message}
          </Text>
        ) : null}
        <Button
          label={create.isPending ? "Creating..." : "Create"}
          disabled={createDisabled}
          onPress={createExercise}
        />
      </Card>
      {filtered.length ? (
        filtered.map((exercise) => (
          <Card key={exercise._id}>
            <Text variant="subtitle">{exercise.name}</Text>
            <Text tone="muted">
              {exercise.isGlobal ? "Library" : "Custom"} ·{" "}
              {exercise.muscleGroup?.name ?? exercise.formula}
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No exercises"
          body="Create muscle groups through the API, then add your own exercise library."
        />
      )}
    </Screen>
  );
}
