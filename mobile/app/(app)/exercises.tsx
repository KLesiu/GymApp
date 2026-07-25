import { ApiError } from "@/api/client";
import {
  type Exercise,
  type ExerciseBodyPart,
  exerciseBodyParts,
  useExercises,
  useUpsertExercise,
} from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { theme } from "@/theme/tokens";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

const bodyPartLabels: Record<ExerciseBodyPart, string> = {
  CHEST: "Chest",
  BACK: "Back",
  SHOULDERS: "Shoulders",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  QUADS: "Quads",
  HAMSTRINGS: "Hamstrings",
  GLUTES: "Glutes",
  CORE: "Core",
  CALVES: "Calves",
};

const resolveBodyPart = (exercise: Exercise): ExerciseBodyPart | undefined => {
  if (exercise.bodyPart) return exercise.bodyPart;
  const region = exercise.muscleGroup?.region;
  return exerciseBodyParts.find((bodyPart) => bodyPart === region);
};

export default function Exercises() {
  const exercises = useExercises();
  const create = useUpsertExercise();
  const [query, setQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] =
    useState<ExerciseBodyPart | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftBodyPart, setDraftBodyPart] =
    useState<ExerciseBodyPart>("CHEST");
  const [message, setMessage] = useState<string | null>(null);
  const trimmedName = draftName.trim();

  const exercisesByBodyPart = useMemo(() => {
    const grouped = new Map<ExerciseBodyPart, Exercise[]>();
    for (const bodyPart of exerciseBodyParts) grouped.set(bodyPart, []);

    for (const exercise of exercises.data ?? []) {
      const bodyPart = resolveBodyPart(exercise);
      if (bodyPart) grouped.get(bodyPart)?.push(exercise);
    }

    return grouped;
  }, [exercises.data]);

  const selectedExercises = useMemo(() => {
    if (!selectedBodyPart) return [];
    const normalizedQuery = query.toLowerCase();
    return (exercisesByBodyPart.get(selectedBodyPart) ?? []).filter((exercise) =>
      exercise.name.toLowerCase().includes(normalizedQuery),
    );
  }, [exercisesByBodyPart, query, selectedBodyPart]);

  const closeCreate = () => {
    setIsCreateOpen(false);
    setMessage(null);
  };

  const createExercise = () => {
    if (!trimmedName) {
      setMessage("Enter an exercise name first.");
      return;
    }

    setMessage(null);
    create.mutate(
      {
        name: trimmedName,
        bodyPart: draftBodyPart,
        formula: "STANDARD",
      },
      {
        onSuccess: () => {
          setDraftName("");
          setSelectedBodyPart(draftBodyPart);
          setIsCreateOpen(false);
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
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title">Exercises</Text>
          <Text tone="muted">
            {selectedBodyPart
              ? bodyPartLabels[selectedBodyPart]
              : "Choose a body part first"}
          </Text>
        </View>
        <IconButton
          name="add"
          label="Create exercise"
          onPress={() => setIsCreateOpen(true)}
        />
      </View>

      {exercises.isError ? (
        <ErrorState
          message="Could not load exercises."
          onRetry={() => void exercises.refetch()}
        />
      ) : null}

      {selectedBodyPart ? (
        <>
          <Button
            label="Back to body parts"
            variant="ghost"
            onPress={() => {
              setSelectedBodyPart(null);
              setQuery("");
            }}
          />
          <TextField label="Search" value={query} onChangeText={setQuery} />
          {selectedExercises.length ? (
            selectedExercises.map((exercise) => (
              <Card key={exercise._id}>
                <Text variant="subtitle">{exercise.name}</Text>
                <Text tone="muted">
                  {bodyPartLabels[selectedBodyPart]} · {exercise.formula}
                </Text>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No exercises here"
              body={`Create the first ${bodyPartLabels[selectedBodyPart].toLowerCase()} exercise with the plus button.`}
            />
          )}
        </>
      ) : (
        exerciseBodyParts.map((bodyPart) => {
          const count = exercisesByBodyPart.get(bodyPart)?.length ?? 0;
          return (
            <Pressable
              accessibilityRole="button"
              key={bodyPart}
              onPress={() => setSelectedBodyPart(bodyPart)}
            >
              <Card style={styles.bodyPartCard}>
                <View>
                  <Text variant="subtitle">{bodyPartLabels[bodyPart]}</Text>
                  <Text tone="muted">
                    {count === 1 ? "1 exercise" : `${count} exercises`}
                  </Text>
                </View>
                <Text tone="action">Open</Text>
              </Card>
            </Pressable>
          );
        })
      )}

      <Modal transparent visible={isCreateOpen} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">Create exercise</Text>
            <TextField
              label="Name"
              value={draftName}
              onChangeText={setDraftName}
            />
            <Text variant="caption" tone="muted">
              Body part
            </Text>
            <View style={styles.bodyPartGrid}>
              {exerciseBodyParts.map((bodyPart) => {
                const selected = bodyPart === draftBodyPart;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={bodyPart}
                    onPress={() => setDraftBodyPart(bodyPart)}
                    style={[styles.choice, selected && styles.choiceSelected]}
                  >
                    <Text tone={selected ? "action" : "default"}>
                      {bodyPartLabels[bodyPart]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {message ? <Text tone="danger">{message}</Text> : null}
            <Button
              label={create.isPending ? "Creating..." : "Create"}
              disabled={create.isPending || !trimmedName}
              onPress={createExercise}
            />
            <Button label="Cancel" variant="ghost" onPress={closeCreate} />
          </Card>
        </View>
      </Modal>
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
  bodyPartCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: theme.space.screen,
    backgroundColor: "rgba(29,34,37,0.35)",
  },
  modalCard: { maxHeight: "90%" },
  bodyPartGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.space.xs,
  },
  choice: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.xs,
    backgroundColor: theme.colors.surface,
  },
  choiceSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.surfaceMuted,
  },
});
