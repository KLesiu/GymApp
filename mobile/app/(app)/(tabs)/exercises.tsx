import { ApiError } from "@/api/client";
import {
  type Exercise,
  type ExerciseBodyPart,
  exerciseBodyParts,
  useDeleteExercise,
  useExercises,
  useUpdateExercise,
  useUpsertExercise,
} from "@/api/domain";
import {
  Button,
  Card,
  Dialog,
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
  const update = useUpdateExercise();
  const remove = useDeleteExercise();
  const [query, setQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] =
    useState<ExerciseBodyPart | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null,
  );
  const [draftName, setDraftName] = useState("");
  const [draftBodyPart, setDraftBodyPart] = useState<ExerciseBodyPart>("CHEST");
  const [message, setMessage] = useState<string | null>(null);
  const trimmedName = draftName.trim();
  const modalOpen = isCreateOpen || editingExercise !== null;
  const saving = create.isPending || update.isPending;

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
    return (exercisesByBodyPart.get(selectedBodyPart) ?? []).filter(
      (exercise) => exercise.name.toLowerCase().includes(normalizedQuery),
    );
  }, [exercisesByBodyPart, query, selectedBodyPart]);

  const closeCreate = () => {
    setIsCreateOpen(false);
    setEditingExercise(null);
    setDraftName("");
    setDraftBodyPart("CHEST");
    setMessage(null);
  };

  const openCreate = () => {
    setEditingExercise(null);
    setDraftName("");
    setDraftBodyPart(selectedBodyPart ?? "CHEST");
    setMessage(null);
    setIsCreateOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    const bodyPart = resolveBodyPart(exercise) ?? selectedBodyPart ?? "CHEST";
    setIsCreateOpen(false);
    setEditingExercise(exercise);
    setDraftName(exercise.name);
    setDraftBodyPart(bodyPart);
    setMessage(null);
  };

  const saveExercise = () => {
    if (!trimmedName) {
      setMessage("Enter an exercise name first.");
      return;
    }

    setMessage(null);

    if (editingExercise) {
      update.mutate(
        {
          exerciseId: editingExercise._id,
          body: { name: trimmedName, bodyPart: draftBodyPart },
        },
        {
          onSuccess: () => {
            setSelectedBodyPart(draftBodyPart);
            closeCreate();
          },
          onError: (error) => {
            setMessage(
              error instanceof ApiError
                ? error.code
                : "Could not update exercise.",
            );
          },
        },
      );
      return;
    }

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

  const deleteExercise = () => {
    if (!deletingExercise) return;
    remove.mutate(deletingExercise._id, {
      onSuccess: () => setDeletingExercise(null),
      onError: (error) => {
        setMessage(
          error instanceof ApiError ? error.code : "Could not delete exercise.",
        );
        setDeletingExercise(null);
      },
    });
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
        <IconButton name="add" label="Create exercise" onPress={openCreate} />
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
                {exercise.isGlobal ? (
                  <Text variant="caption" tone="muted">
                    Library exercise
                  </Text>
                ) : (
                  <View style={styles.actionRow}>
                    <Button
                      label="Edit"
                      variant="secondary"
                      onPress={() => openEdit(exercise)}
                    />
                    <Button
                      label="Delete"
                      variant="danger"
                      onPress={() => setDeletingExercise(exercise)}
                    />
                  </View>
                )}
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

      <Modal transparent visible={modalOpen} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">
              {editingExercise ? "Edit exercise" : "Create exercise"}
            </Text>
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
              label={
                saving
                  ? "Saving..."
                  : editingExercise
                    ? "Save changes"
                    : "Create"
              }
              disabled={saving || !trimmedName}
              onPress={saveExercise}
            />
            <Button label="Cancel" variant="ghost" onPress={closeCreate} />
          </Card>
        </View>
      </Modal>
      <Dialog
        visible={deletingExercise !== null}
        title="Delete exercise?"
        body={
          deletingExercise
            ? `Remove ${deletingExercise.name} from your exercises?`
            : "Remove this exercise?"
        }
        confirmLabel={remove.isPending ? "Deleting..." : "Delete"}
        onConfirm={deleteExercise}
        onCancel={() => setDeletingExercise(null)}
      />
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
  actionRow: { flexDirection: "row", gap: theme.space.sm },
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
