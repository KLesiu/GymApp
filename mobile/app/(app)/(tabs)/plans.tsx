import {
  type Plan,
  type PlanDay,
  type PlanExercise,
  useActivatePlan,
  useActivePlan,
  useCreatePlanDay,
  useDeactivatePlan,
  useDeletePlan,
  useDeletePlanDay,
  useExercises,
  usePlans,
  useUpdatePlan,
  useUpdatePlanDay,
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
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

type DraftExercise = {
  readonly exerciseId: string;
  readonly series: string;
  readonly repsTarget: string;
};

type DayEditor = {
  readonly plan: Plan;
  readonly day?: PlanDay;
};

const totalSeries = (day: PlanDay) =>
  day.exercises.reduce((total, exercise) => total + exercise.series, 0);

const groupDaysByWeek = (days: readonly PlanDay[], weeksCount = 1) =>
  Array.from({ length: Math.max(1, weeksCount) }, (_, index) => {
    const weekNumber = index + 1;
    return {
      weekNumber,
      days: days
        .filter((day) => (day.weekNumber ?? 1) === weekNumber)
        .sort(
          (left, right) => (left.orderIndex ?? 0) - (right.orderIndex ?? 0),
        ),
    };
  });

export default function Plans() {
  const plans = usePlans();
  const activePlan = useActivePlan();
  const exercises = useExercises();
  const activatePlan = useActivatePlan();
  const deactivatePlan = useDeactivatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const createPlanDay = useCreatePlanDay();
  const updatePlanDay = useUpdatePlanDay();
  const deletePlanDay = useDeletePlanDay();
  const activePlanId = activePlan.data?._id;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [dayEditor, setDayEditor] = useState<DayEditor | null>(null);
  const [deletingDay, setDeletingDay] = useState<PlanDay | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [dayName, setDayName] = useState("");
  const [dayWeekNumber, setDayWeekNumber] = useState("1");
  const [query, setQuery] = useState("");
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const selectedPlan = useMemo(() => {
    const items = plans.data ?? [];
    if (!selectedPlanId && activePlan.data) return activePlan.data;
    return (
      items.find((plan) => plan._id === selectedPlanId) ??
      items.find((plan) => plan._id === activePlanId) ??
      activePlan.data ??
      items[0] ??
      null
    );
  }, [activePlan.data, activePlanId, plans.data, selectedPlanId]);
  const selectedPlanIsOwned = Boolean(
    selectedPlan && plans.data?.some((plan) => plan._id === selectedPlan._id),
  );
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
  const canSavePlan = draftName.trim().length > 0;
  const canSaveDay = dayName.trim().length > 0 && draftExercises.length > 0;
  const savingDay = createPlanDay.isPending || updatePlanDay.isPending;

  useFocusEffect(
    useCallback(() => {
      void activePlan.refetch();
      void plans.refetch();
    }, [activePlan, plans]),
  );

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setDraftName(plan.name);
    setDraftDescription(plan.description ?? "");
  };

  const closeEditPlan = () => {
    setEditingPlan(null);
    setDraftName("");
    setDraftDescription("");
  };

  const savePlan = () => {
    if (!editingPlan) return;
    const description = draftDescription.trim();
    updatePlan.mutate(
      {
        planId: editingPlan._id,
        body: {
          name: draftName.trim(),
          ...(description ? { description } : {}),
        },
      },
      { onSuccess: closeEditPlan },
    );
  };

  const openDayEditor = (plan: Plan, day?: PlanDay) => {
    setDayEditor(day ? { plan, day } : { plan });
    setDayName(day?.name ?? "");
    setDayWeekNumber(String(day?.weekNumber ?? 1));
    setQuery("");
    setDraftExercises(
      day?.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        series: String(exercise.series),
        repsTarget: String(exercise.repsTarget),
      })) ?? [],
    );
    setMessage(null);
  };

  const closeDayEditor = () => {
    setDayEditor(null);
    setDayName("");
    setDayWeekNumber("1");
    setQuery("");
    setDraftExercises([]);
    setMessage(null);
  };

  const addExercise = (exerciseId: string) => {
    setDraftExercises((current) =>
      current.some((item) => item.exerciseId === exerciseId)
        ? current
        : [...current, { exerciseId, series: "3", repsTarget: "10" }],
    );
  };

  const updateExerciseTarget = (
    exerciseId: string,
    field: "series" | "repsTarget",
    value: string,
  ) => {
    setDraftExercises((current) =>
      current.map((item) =>
        item.exerciseId === exerciseId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeExercise = (exerciseId: string) => {
    setDraftExercises((current) =>
      current.filter((item) => item.exerciseId !== exerciseId),
    );
  };

  const buildPlanExercises = (): PlanExercise[] | null => {
    const items = draftExercises.map((item, index) => ({
      exerciseId: item.exerciseId,
      series: Number.parseInt(item.series, 10),
      repsTarget: Number.parseInt(item.repsTarget, 10),
      orderIndex: index,
    }));

    if (
      items.some(
        (item) =>
          !Number.isInteger(item.series) ||
          item.series < 1 ||
          !Number.isInteger(item.repsTarget) ||
          item.repsTarget < 1,
      )
    ) {
      setMessage("Every selected exercise needs valid series and reps.");
      return null;
    }

    return items;
  };

  const saveDay = () => {
    if (!dayEditor) return;
    const exercisesInput = buildPlanExercises();
    if (!exercisesInput) return;
    const weekNumber = Number.parseInt(dayWeekNumber, 10);
    if (
      !Number.isInteger(weekNumber) ||
      weekNumber < 1 ||
      weekNumber > (dayEditor.plan.weeksCount ?? 1)
    ) {
      setMessage(
        `Week must be between 1 and ${dayEditor.plan.weeksCount ?? 1}.`,
      );
      return;
    }

    const body = {
      name: dayName.trim(),
      weekNumber,
      orderIndex: dayEditor.day?.orderIndex ?? dayEditor.plan.days.length,
      exercises: exercisesInput,
    };

    if (dayEditor.day) {
      updatePlanDay.mutate(
        { planDayId: dayEditor.day._id, body },
        { onSuccess: closeDayEditor },
      );
      return;
    }

    createPlanDay.mutate(
      { planId: dayEditor.plan._id, body },
      { onSuccess: closeDayEditor },
    );
  };

  const removePlan = () => {
    if (!deletingPlan) return;
    deletePlan.mutate(deletingPlan._id, {
      onSuccess: () => setDeletingPlan(null),
    });
  };

  const removeDay = () => {
    if (!deletingDay) return;
    deletePlanDay.mutate(deletingDay._id, {
      onSuccess: () => setDeletingDay(null),
    });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title">Plans</Text>
          <Text tone="muted">
            Manage the active training plan and its training days.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            name="list-outline"
            label="Show plans"
            onPress={() => setPlansOpen(true)}
          />
          <IconButton
            name="add"
            label="Add new plan"
            onPress={() => router.push("/(app)/(tabs)/plans/create")}
          />
        </View>
      </View>

      {selectedPlan ? (
        <Card style={styles.daysPanel}>
          <Text variant="caption" tone="action">
            Current training plan
          </Text>
          <Text variant="heading1">{selectedPlan.name}</Text>
          <Text tone="muted">
            {selectedPlan.weeksCount ?? 1} week(s), grouped by training week
          </Text>
          <Button
            label="Add training day"
            disabled={
              !selectedPlanIsOwned || Boolean(selectedPlan.assignedByTrainer)
            }
            onPress={() => openDayEditor(selectedPlan)}
          />
          {selectedPlan.assignedByTrainer ? (
            <Text tone="muted">
              This plan was assigned by your coach. It is ready to use for
              workouts and cannot be edited here.
            </Text>
          ) : null}
          {selectedPlan.days.length ? (
            groupDaysByWeek(selectedPlan.days, selectedPlan.weeksCount).map(
              (week) => (
                <View key={week.weekNumber} style={styles.weekGroup}>
                  <Text variant="subtitle">Week {week.weekNumber}</Text>
                  {week.days.length ? (
                    week.days.map((day) => (
                      <Card key={day._id} style={styles.dayCard}>
                        <View style={styles.dayRow}>
                          <View style={styles.dayText}>
                            <Text variant="subtitle">{day.name}</Text>
                            <Text tone="muted">
                              Exercises: {day.exercises.length}
                            </Text>
                            <Text tone="muted">
                              Total series: {totalSeries(day)}
                            </Text>
                          </View>
                          <View style={styles.dayActions}>
                            <IconButton
                              name="create-outline"
                              label="Edit training day"
                              disabled={
                                !selectedPlanIsOwned ||
                                Boolean(selectedPlan.assignedByTrainer)
                              }
                              onPress={() => openDayEditor(selectedPlan, day)}
                            />
                            <IconButton
                              name="trash-outline"
                              label="Delete training day"
                              disabled={
                                !selectedPlanIsOwned ||
                                Boolean(selectedPlan.assignedByTrainer)
                              }
                              onPress={() => setDeletingDay(day)}
                            />
                          </View>
                        </View>
                      </Card>
                    ))
                  ) : (
                    <Text tone="muted">No training days in this week yet.</Text>
                  )}
                </View>
              ),
            )
          ) : (
            <EmptyState
              title="No training days"
              body="Add the first day for this plan before starting a workout."
            />
          )}
        </Card>
      ) : (
        <EmptyState
          title="No active plan"
          body="Create or select a training plan from the list button."
          actionLabel="Show plans"
          onAction={() => setPlansOpen(true)}
        />
      )}

      <Modal transparent visible={plansOpen} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">Training plans</Text>
            {plans.data?.length ? (
              plans.data.map((plan) => {
                const isActive = activePlanId === plan._id;
                const isSelected = selectedPlan?._id === plan._id;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={plan._id}
                    onPress={() => setSelectedPlanId(plan._id)}
                  >
                    <Card
                      style={[
                        styles.planCard,
                        isSelected && styles.selectedPlanCard,
                      ]}
                    >
                      <Text variant="subtitle">{plan.name}</Text>
                      <Text tone="muted">
                        {plan.description ?? "Self-managed plan"}
                      </Text>
                      <Text
                        variant="caption"
                        tone={isActive ? "success" : "muted"}
                      >
                        {isActive ? "Active plan" : "Inactive"} ·{" "}
                        {plan.weeksCount ?? 1} week(s) · {plan.days.length}{" "}
                        day(s)
                      </Text>
                      <View style={styles.actionRow}>
                        <Button
                          label={isActive ? "Deactivate" : "Set active"}
                          variant={isActive ? "secondary" : "primary"}
                          disabled={
                            activatePlan.isPending || deactivatePlan.isPending
                          }
                          onPress={() => {
                            if (isActive) {
                              deactivatePlan.mutate(plan._id);
                              return;
                            }
                            activatePlan.mutate(plan._id, {
                              onSuccess: () => {
                                setSelectedPlanId(plan._id);
                                setPlansOpen(false);
                              },
                            });
                          }}
                        />
                        <Button
                          label="Edit"
                          variant="secondary"
                          onPress={() => {
                            setPlansOpen(false);
                            openEditPlan(plan);
                          }}
                        />
                        <Button
                          label="Delete"
                          variant="danger"
                          onPress={() => {
                            setPlansOpen(false);
                            setDeletingPlan(plan);
                          }}
                        />
                      </View>
                    </Card>
                  </Pressable>
                );
              })
            ) : (
              <EmptyState
                title="No plans yet"
                body="Create a training plan first. Training days are added inside the plan."
              />
            )}
            <Button
              label="Close"
              variant="ghost"
              onPress={() => setPlansOpen(false)}
            />
          </Card>
        </View>
      </Modal>

      <Modal transparent visible={editingPlan !== null} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">Edit plan</Text>
            <TextField
              label="Name"
              value={draftName}
              onChangeText={setDraftName}
            />
            <TextField
              label="Description"
              value={draftDescription}
              onChangeText={setDraftDescription}
            />
            <Button
              label={updatePlan.isPending ? "Saving..." : "Save changes"}
              disabled={updatePlan.isPending || !canSavePlan}
              onPress={savePlan}
            />
            <Button label="Cancel" variant="ghost" onPress={closeEditPlan} />
          </Card>
        </View>
      </Modal>

      <Modal transparent visible={dayEditor !== null} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text variant="subtitle">
                {dayEditor?.day ? "Edit training day" : "Add training day"}
              </Text>
              <TextField
                label="Day name"
                value={dayName}
                onChangeText={setDayName}
              />
              <TextField
                label={`Week number (1-${dayEditor?.plan.weeksCount ?? 1})`}
                keyboardType="numeric"
                value={dayWeekNumber}
                onChangeText={setDayWeekNumber}
              />
              <TextField
                label="Search exercises"
                value={query}
                onChangeText={setQuery}
              />
              {exercises.isError ? (
                <ErrorState
                  message="Could not load exercises."
                  onRetry={() => void exercises.refetch()}
                />
              ) : null}
              <View style={styles.exerciseGrid}>
                {filteredExercises.map((exercise) => {
                  const added = draftExercises.some(
                    (item) => item.exerciseId === exercise._id,
                  );
                  return (
                    <Card key={exercise._id} style={styles.exerciseChoice}>
                      <Text variant="subtitle">{exercise.name}</Text>
                      <Text variant="caption" tone="muted">
                        {exercise.isGlobal ? "Library" : "Custom"}
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
              </View>
              {draftExercises.map((item) => {
                const exercise = exerciseById.get(item.exerciseId);
                return (
                  <Card key={item.exerciseId}>
                    <Text variant="subtitle">
                      {exercise?.name ?? "Exercise"}
                    </Text>
                    <TextField
                      label="Series"
                      keyboardType="numeric"
                      value={item.series}
                      onChangeText={(value) =>
                        updateExerciseTarget(item.exerciseId, "series", value)
                      }
                    />
                    <TextField
                      label="Reps"
                      keyboardType="numeric"
                      value={item.repsTarget}
                      onChangeText={(value) =>
                        updateExerciseTarget(
                          item.exerciseId,
                          "repsTarget",
                          value,
                        )
                      }
                    />
                    <Button
                      label="Remove"
                      variant="danger"
                      onPress={() => removeExercise(item.exerciseId)}
                    />
                  </Card>
                );
              })}
              {message ? <Text tone="danger">{message}</Text> : null}
            </ScrollView>
            <Button
              label={savingDay ? "Saving..." : "Save training day"}
              disabled={savingDay || !canSaveDay}
              onPress={saveDay}
            />
            <Button label="Cancel" variant="ghost" onPress={closeDayEditor} />
          </Card>
        </View>
      </Modal>

      <Dialog
        visible={deletingPlan !== null}
        title="Delete plan?"
        body={
          deletingPlan
            ? `Remove ${deletingPlan.name} and its training days?`
            : "Remove this plan?"
        }
        confirmLabel={deletePlan.isPending ? "Deleting..." : "Delete"}
        onConfirm={removePlan}
        onCancel={() => setDeletingPlan(null)}
      />
      <Dialog
        visible={deletingDay !== null}
        title="Delete training day?"
        body={
          deletingDay
            ? `Remove ${deletingDay.name} from this plan?`
            : "Remove this day?"
        }
        confirmLabel={deletePlanDay.isPending ? "Deleting..." : "Delete"}
        onConfirm={removeDay}
        onCancel={() => setDeletingDay(null)}
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
  headerActions: { flexDirection: "row", gap: theme.space.sm },
  planCard: { gap: theme.space.sm },
  selectedPlanCard: { borderColor: theme.colors.context },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.space.sm },
  daysPanel: { flex: 1, gap: theme.space.md },
  weekGroup: { gap: theme.space.sm },
  dayCard: { backgroundColor: theme.colors.surfaceMuted },
  dayRow: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  dayText: { flex: 1, gap: theme.space.xs },
  dayActions: { flexDirection: "row", gap: theme.space.sm },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: theme.space.screen,
    backgroundColor: "rgba(29,34,37,0.35)",
  },
  modalCard: { width: "100%", maxHeight: "86%" },
  modalScroll: { gap: theme.space.md, paddingBottom: theme.space.sm },
  exerciseGrid: { gap: theme.space.sm },
  exerciseChoice: { width: "100%" },
});
