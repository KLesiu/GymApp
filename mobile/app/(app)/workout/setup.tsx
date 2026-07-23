import {
  useCreateWorkout,
  useExercises,
  useGyms,
  usePlans,
} from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

type PlannedSetInput = {
  readonly key: string;
  readonly exerciseId: string;
  readonly series: number;
  readonly repsTarget: number;
  readonly reps: string;
  readonly weight: string;
};

export default function WorkoutSetup() {
  const gyms = useGyms();
  const plans = usePlans();
  const exercises = useExercises();
  const create = useCreateWorkout();
  const [gymId, setGymId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [setInputs, setSetInputs] = useState<PlannedSetInput[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedGym = gymId;
  const selectedPlan = useMemo(
    () => plans.data?.find((plan) => plan._id === planId) ?? null,
    [planId, plans.data],
  );
  const selectedDay = selectedPlan?.days[0] ?? null;
  const exerciseById = useMemo(
    () =>
      new Map(
        exercises.data?.map((exercise) => [exercise._id, exercise]) ?? [],
      ),
    [exercises.data],
  );

  useEffect(() => {
    const selectionChanged = gymId !== null || planId !== null;
    setFormVisible(false);
    setSetInputs([]);
    setMessage(null);
    if (!selectionChanged) return;
  }, [gymId, planId]);

  const updateSet = (key: string, field: "reps" | "weight", value: string) => {
    setSetInputs((current) =>
      current.map((set) =>
        set.key === key ? { ...set, [field]: value } : set,
      ),
    );
  };

  const openWorkoutForm = () => {
    if (!selectedGym) {
      setMessage("Choose a gym first.");
      return;
    }
    if (!selectedPlan || !selectedDay) {
      setMessage("Choose a plan first.");
      return;
    }
    if (setInputs.length === 0) {
      const nextSetInputs = selectedDay.exercises.flatMap((exercise) =>
        Array.from({ length: exercise.series }, (_unused, index) => ({
          key: `${exercise.exerciseId}:${index + 1}`,
          exerciseId: exercise.exerciseId,
          series: index + 1,
          repsTarget: exercise.repsTarget,
          reps: String(exercise.repsTarget),
          weight: "0",
        })),
      );

      if (nextSetInputs.length === 0) {
        setMessage("The selected plan has no set slots.");
        return;
      }

      setSetInputs(nextSetInputs);
      setFormVisible(true);
      setMessage(null);
      return;
    }

    setFormVisible(true);
    setMessage(null);
  };

  const createDraft = async () => {
    if (!selectedGym || !selectedPlan || !selectedDay) {
      setMessage("Choose a gym and plan first.");
      return;
    }
    if (!formVisible || setInputs.length === 0) {
      setMessage("Start the workout form first.");
      return;
    }

    const sets = setInputs.map((set) => ({
      exerciseId: set.exerciseId,
      series: set.series,
      reps: Number.parseInt(set.reps, 10),
      weight: Number.parseFloat(set.weight.replace(",", ".")),
      unit: "KILOGRAMS" as const,
    }));
    if (
      sets.some(
        (set) =>
          !Number.isInteger(set.reps) ||
          set.reps < 1 ||
          Number.isNaN(set.weight) ||
          set.weight < 0,
      )
    ) {
      setMessage("Every set needs valid reps and non-negative weight.");
      return;
    }

    setMessage(null);
    const workout = await create.mutateAsync({
      gymId: selectedGym,
      planId: selectedPlan._id,
      planDayId: selectedDay._id,
      startedAt: new Date().toISOString(),
      sets,
    });
    router.push(`/(app)/workout/${workout.id ?? workout._id}`);
  };

  return (
    <Screen title="Set up workout">
      <Card>
        <Text variant="subtitle">1. Choose gym</Text>
        <Text tone="muted">
          Benchmarks are tied to the gym where the workout happens.
        </Text>
      </Card>
      {gyms.data?.map((gym) => (
        <Card key={gym._id}>
          <Text variant="subtitle">{gym.name}</Text>
          <Button
            label={selectedGym === gym._id ? "Selected" : "Use this gym"}
            variant="secondary"
            onPress={() => setGymId(gym._id)}
          />
        </Card>
      ))}

      <Card>
        <Text variant="subtitle">2. Choose plan</Text>
        <Text tone="muted">
          The plan decides which exercises and how many set slots appear below.
        </Text>
      </Card>
      {plans.data?.length ? (
        plans.data.map((plan) => (
          <Card key={plan._id}>
            <Text variant="subtitle">{plan.name}</Text>
            <Text tone="muted">
              {plan.days[0]?.exercises.length ?? 0} exercise(s) ·{" "}
              {plan.days[0]?.exercises.reduce(
                (total, exercise) => total + exercise.series,
                0,
              ) ?? 0}{" "}
              series
            </Text>
            <Button
              label={
                selectedPlan?._id === plan._id ? "Selected" : "Use this plan"
              }
              variant="secondary"
              onPress={() => setPlanId(plan._id)}
            />
          </Card>
        ))
      ) : (
        <EmptyState
          title="Create a plan first"
          body="Plans define exercises and series for this workout form."
          actionLabel="Open plans"
          onAction={() => router.push("/(app)/plans")}
        />
      )}

      {message ? <Text tone="danger">{message}</Text> : null}
      {!formVisible ? (
        <Button
          label="Start"
          disabled={!selectedGym || !selectedPlan}
          onPress={openWorkoutForm}
        />
      ) : null}

      {formVisible && selectedPlan && selectedDay ? (
        <Card>
          <Text variant="subtitle">3. Fill workout slots</Text>
          <Text tone="muted">
            {selectedPlan.name} · {selectedDay.name} · {setInputs.length} set
            slot(s)
          </Text>
          {setInputs.map((set) => {
            const exercise = exerciseById.get(set.exerciseId);
            return (
              <Card key={set.key}>
                <Text variant="subtitle">
                  {exercise?.name ?? "Exercise"} · Set {set.series}
                </Text>
                <TextField
                  label="Reps"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(value) => updateSet(set.key, "reps", value)}
                />
                <TextField
                  label="Weight"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(value) => updateSet(set.key, "weight", value)}
                />
              </Card>
            );
          })}
          <Button
            label={create.isPending ? "Creating..." : "Create workout draft"}
            disabled={create.isPending}
            onPress={createDraft}
          />
        </Card>
      ) : null}
    </Screen>
  );
}
