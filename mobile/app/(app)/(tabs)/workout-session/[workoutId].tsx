import {
  useFinalizeWorkout,
  useUpdateWorkoutSets,
  useWorkout,
} from "@/api/domain";
import {
  Dialog,
  EmptyState,
  ErrorState,
  Screen,
  Text,
} from "@/components/primitives";
import { theme } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type SetDraft = {
  readonly clientKey: string;
  readonly id?: string;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly series: number;
  readonly reps: string;
  readonly weight: string;
  readonly unit: "KILOGRAMS" | "POUNDS";
};

export default function ActiveWorkout() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const workout = useWorkout(workoutId);
  const updateSets = useUpdateWorkoutSets();
  const finalize = useFinalizeWorkout();
  const [sets, setSets] = useState<SetDraft[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [hasLocalEdits, setHasLocalEdits] = useState(false);

  useEffect(() => {
    if (!workout.data || hasLocalEdits) return;
    const nextSets = workout.data.exercises.map((set) => ({
      clientKey: set.id ?? set._id,
      id: set.id ?? set._id,
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      series: set.series,
      reps: "",
      weight: "",
      unit: set.unit,
    }));
    setSets(nextSets);
    setSelectedExerciseId((current) => {
      if (current && nextSets.some((set) => set.exerciseId === current))
        return current;
      return nextSets[0]?.exerciseId ?? null;
    });
  }, [hasLocalEdits, workout.data]);

  const groupedSets = useMemo(() => {
    const grouped = new Map<string, SetDraft[]>();
    for (const set of sets) {
      const current = grouped.get(set.exerciseId);
      if (current) {
        current.push(set);
      } else {
        grouped.set(set.exerciseId, [set]);
      }
    }
    return Array.from(grouped.values());
  }, [sets]);

  const selectedSets =
    groupedSets.find((group) => group[0]?.exerciseId === selectedExerciseId) ??
    groupedSets[0] ??
    [];
  const selectedExercise = selectedSets[0];

  const updateSet = (
    clientKey: string,
    field: "reps" | "weight",
    value: string,
  ) => {
    setHasLocalEdits(true);
    setSets((current) =>
      current.map((set) =>
        set.clientKey === clientKey ? { ...set, [field]: value } : set,
      ),
    );
  };

  const addSeries = () => {
    if (!selectedExercise) return;
    setHasLocalEdits(true);
    const lastSet = selectedSets[selectedSets.length - 1] ?? selectedExercise;
    const nextSeries =
      Math.max(...selectedSets.map((set) => set.series), 0) + 1;
    setSets((current) => [
      ...current,
      {
        clientKey: `local:${selectedExercise.exerciseId}:${Date.now()}:${nextSeries}`,
        exerciseId: selectedExercise.exerciseId,
        exerciseName: selectedExercise.exerciseName,
        series: nextSeries,
        reps: "",
        weight: "",
        unit: lastSet.unit,
      },
    ]);
    setMessage(null);
  };

  const removeSeries = () => {
    if (selectedSets.length <= 1) return;
    setHasLocalEdits(true);
    const lastSet = [...selectedSets].sort(
      (left, right) => right.series - left.series,
    )[0];
    if (!lastSet) return;
    setSets((current) =>
      current
        .filter((set) => set.clientKey !== lastSet.clientKey)
        .map((set) =>
          set.exerciseId === selectedExerciseId && set.series > lastSet.series
            ? { ...set, series: set.series - 1 }
            : set,
        ),
    );
    setMessage(null);
  };

  const removeExerciseFromSession = (exerciseId = selectedExerciseId) => {
    if (!exerciseId) return;
    setHasLocalEdits(true);
    setSets((current) => {
      const remaining = current.filter((set) => set.exerciseId !== exerciseId);
      setSelectedExerciseId((selected) => {
        if (selected !== exerciseId) return selected;
        return remaining[0]?.exerciseId ?? null;
      });
      return remaining;
    });
    setMessage(null);
  };

  const parseSets = () => {
    const parsed = sets.map((set) => {
      const repsText = set.reps.trim();
      const weightText = set.weight.trim().replace(",", ".");
      return {
        ...(set.id ? { id: set.id } : {}),
        exerciseId: set.exerciseId,
        series: set.series,
        reps: /^\d+$/.test(repsText) ? Number(repsText) : Number.NaN,
        weight: /^\d+(\.\d+)?$/.test(weightText)
          ? Number(weightText)
          : Number.NaN,
        unit: set.unit,
      };
    });

    if (
      parsed.some(
        (set) =>
          !Number.isInteger(set.reps) ||
          set.reps < 1 ||
          Number.isNaN(set.weight) ||
          set.weight < 0,
      )
    ) {
      setMessage("Every set needs valid reps and non-negative weight.");
      return null;
    }

    return parsed;
  };

  const finalizeWorkout = async () => {
    if (!workoutId) return;
    setMessage(null);
    const parsed = parseSets();
    if (!parsed) return;

    try {
      await updateSets.mutateAsync({ workoutId, sets: parsed });
    } catch {
      setMessage("Could not save workout results.");
      return;
    }

    finalize.mutate(
      {
        workoutId,
        operationId: buildFinalizeOperationId(workoutId, parsed),
        sets: parsed,
      },
      {
        onSuccess: () => {
          setHasLocalEdits(false);
          router.replace({
            pathname: "/(app)/(tabs)/workout-summary/[workoutId]",
            params: { workoutId },
          });
        },
        onError: () => setMessage("Could not finalize workout."),
      },
    );
  };

  if (workout.isError) {
    return (
      <Screen title="Active workout">
        <ErrorState
          message="Could not load this workout draft."
          onRetry={() => void workout.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.leftHeaderTools}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.roundIcon}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.planHeader}>
          <Text variant="subtitle" style={styles.lightText}>
            {workout.data?.planDay?.name ?? "Workout"}
          </Text>
          <View style={styles.gymRow}>
            <Ionicons name="location" size={18} color={colors.muted} />
            <Text tone="muted" style={styles.mutedText}>
              {workout.data?.gym ?? "Loading gym"}
            </Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.middleScroll}
      >
        {selectedExercise ? (
          <>
            <View style={styles.heroBlock}>
              <Text variant="title" style={styles.heroTitle}>
                {selectedExercise.exerciseName}
              </Text>
              <Text style={styles.targetText}>
                {selectedSets.length}x{selectedSets[0]?.reps || "—"}
              </Text>
            </View>

            <View style={styles.toolRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove series"
                disabled={selectedSets.length <= 1}
                onPress={removeSeries}
                style={[
                  styles.toolButton,
                  selectedSets.length <= 1 && styles.disabledTool,
                ]}
              >
                <Ionicons name="remove" size={22} color={colors.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add series"
                onPress={addSeries}
                style={styles.toolButton}
              >
                <Ionicons name="add" size={22} color={colors.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove exercise from this session"
                onPress={() => removeExerciseFromSession()}
                style={styles.toolButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.danger}
                />
              </Pressable>
            </View>

            <Text style={styles.scoreLine}>
              Last training scores at{" "}
              <Text style={styles.scoreHighlight}>
                {workout.data?.gym ?? "this gym"}
              </Text>
              : —
            </Text>

            <View style={styles.tableHeader}>
              <Text style={styles.columnSeries}>Series</Text>
              <Text style={styles.columnInput}>Reps</Text>
              <Text style={styles.columnInput}>Weight (kg)</Text>
            </View>
            {selectedSets.map((set) => (
              <View key={set.clientKey} style={styles.tableRow}>
                <View style={styles.seriesBox}>
                  <Text style={styles.inputText}>{set.series}</Text>
                </View>
                <TextInput
                  value={set.reps}
                  onChangeText={(value) =>
                    updateSet(set.clientKey, "reps", value)
                  }
                  keyboardType="numeric"
                  placeholder="Required"
                  placeholderTextColor={colors.muted}
                  style={styles.darkInput}
                />
                <TextInput
                  value={set.weight}
                  onChangeText={(value) =>
                    updateSet(set.clientKey, "weight", value)
                  }
                  keyboardType="numeric"
                  placeholder="Required"
                  placeholderTextColor={colors.muted}
                  style={styles.darkInput}
                />
              </View>
            ))}

            <Text style={styles.listTitle}>Exercise list</Text>
            <View style={styles.exerciseList}>
              {groupedSets.map((group) => {
                const firstSet = group[0];
                if (!firstSet) return null;
                const selected =
                  firstSet.exerciseId === selectedExercise.exerciseId;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={firstSet.exerciseId}
                    onPress={() => setSelectedExerciseId(firstSet.exerciseId)}
                    style={[
                      styles.exerciseListItem,
                      selected && styles.exerciseListItemActive,
                    ]}
                  >
                    <View style={styles.exerciseListText}>
                      <Text
                        variant="heading2"
                        style={selected ? styles.lightText : styles.dimText}
                      >
                        {firstSet.exerciseName}
                      </Text>
                      <Text style={styles.mutedText}>
                        Set {group.length} Rep{" "}
                        {group.map((set) => set.reps || "—").join("/")}
                      </Text>
                    </View>
                    {selected ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Remove exercise from this session"
                        onPress={() =>
                          removeExerciseFromSession(firstSet.exerciseId)
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={28}
                          color={colors.muted}
                        />
                      </Pressable>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <EmptyState
            title="No sets in this draft"
            body="Go back and start a workout from a plan with exercises."
          />
        )}
      </ScrollView>

      <View style={styles.bottomDock}>
        {message ? (
          <Text
            style={
              message === "Results saved."
                ? styles.successText
                : styles.errorText
            }
          >
            {message}
          </Text>
        ) : null}

        <View style={styles.bottomActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirm(true)}
            style={styles.deleteButton}
          >
            <Text style={styles.bottomButtonText}>Delete</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={
              updateSets.isPending || finalize.isPending || !sets.length
            }
            onPress={() => void finalizeWorkout()}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {updateSets.isPending || finalize.isPending
                ? "Saving..."
                : "Save training"}
            </Text>
          </Pressable>
        </View>
      </View>

      <Dialog
        visible={confirm}
        title="Discard draft?"
        body="Unfinished workout input will be lost."
        confirmLabel="Discard"
        onConfirm={() => router.replace("/(app)/(tabs)/workout")}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}

const buildFinalizeOperationId = (
  workoutId: string,
  sets: readonly {
    readonly id?: string;
    readonly exerciseId: string;
    readonly series: number;
    readonly reps: number;
    readonly weight: number;
    readonly unit: "KILOGRAMS" | "POUNDS";
  }[],
) =>
  `${workoutId}:${sets
    .map(
      (set) =>
        `${set.id ?? "new"}:${set.exerciseId}:${set.series}:${set.reps}:${set.weight}:${set.unit}`,
    )
    .join("|")}`;

const colors = {
  background: theme.colors.background,
  panel: theme.colors.surface,
  panelMuted: theme.colors.surfaceMuted,
  text: theme.colors.text,
  muted: theme.colors.textMuted,
  accent: theme.colors.action,
  danger: theme.colors.danger,
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: theme.space.md,
  },
  middleScroll: { flex: 1 },
  scrollContent: {
    gap: theme.space.section,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.lg,
  },
  leftHeaderTools: {
    width: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
  },
  headerSpacer: { width: 44 },
  roundIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: colors.panelMuted,
  },
  planHeader: { alignItems: "center", gap: theme.space.xxs },
  gymRow: { flexDirection: "row", alignItems: "center", gap: theme.space.xs },
  lightText: { color: colors.text },
  mutedText: { color: colors.muted },
  heroBlock: { gap: theme.space.xs },
  heroTitle: { color: colors.text },
  targetText: { color: colors.text, fontSize: 20, lineHeight: 26 },
  toolRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: theme.space.sm,
  },
  toolButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md,
    backgroundColor: colors.panel,
  },
  disabledTool: { opacity: 0.4 },
  scoreLine: { color: colors.text, fontSize: 16, lineHeight: 24 },
  scoreHighlight: { color: colors.accent, fontWeight: "700" },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  columnSeries: { width: 72, color: colors.text, fontSize: 16 },
  columnInput: { flex: 1, color: colors.text, fontSize: 16 },
  tableRow: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
  seriesBox: {
    width: 72,
    height: theme.control.height,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md,
    backgroundColor: colors.panel,
  },
  darkInput: {
    flex: 1,
    height: theme.control.height,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: colors.panel,
    color: colors.text,
    fontSize: 16,
  },
  inputText: { color: colors.text, fontSize: 16 },
  listTitle: { color: colors.text, fontSize: 18 },
  exerciseList: { gap: theme.space.sm },
  exerciseListItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
    borderRadius: theme.radii.md,
    padding: theme.space.md,
    backgroundColor: colors.panel,
  },
  exerciseListItemActive: { backgroundColor: colors.panelMuted },
  exerciseListText: { flex: 1, gap: theme.space.xxs },
  dimText: { color: colors.muted },
  successText: { color: theme.colors.success },
  errorText: { color: theme.colors.danger },
  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
  },
  bottomDock: {
    gap: theme.space.md,
    paddingTop: theme.space.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: colors.background,
  },
  deleteButton: {
    flex: 1,
    minHeight: theme.control.height,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: colors.panel,
  },
  bottomButtonText: { color: colors.danger, fontSize: 16 },
  saveButton: {
    flex: 1,
    minHeight: theme.control.height,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md,
    backgroundColor: colors.accent,
  },
  saveButtonText: { color: theme.colors.actionText, fontSize: 16 },
});
