import { useWorkouts } from "@/api/domain";
import {
  EmptyState,
  ErrorState,
  Screen,
  Skeleton,
  Text,
} from "@/components/primitives";
import {
  DateRail,
  ExerciseResultCard,
  ResultRow,
  TrainingHeader,
  TrainingSectionTitle,
  groupExerciseResults,
} from "@/components/workout-layout";
import { formatDate, formatDateTime, formatNumber } from "@/i18n";
import { Fragment, useMemo, useState } from "react";

const dateKey = (date: string | Date) => new Date(date).toISOString().slice(0, 10);

const shiftDate = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const getWorkoutDate = (workout: NonNullable<ReturnType<typeof useWorkouts>["data"]>[number]) =>
  workout.completedAt ?? workout.createdAt ?? workout.startedAt ?? new Date().toISOString();

export default function History() {
  const workouts = useWorkouts();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const history = useMemo(() => workouts.data ?? [], [workouts.data]);
  const workoutDates = useMemo(
    () => new Set(history.map((workout) => dateKey(getWorkoutDate(workout)))),
    [history],
  );
  const dateRail = useMemo(
    () =>
      [-1, 0, 1].map((offset) => {
        const date = shiftDate(selectedDate, offset);
        return {
          date,
          selected: offset === 0,
          hasWorkout: workoutDates.has(dateKey(date)),
        };
      }),
    [selectedDate, workoutDates],
  );
  const selectedHistory = useMemo(
    () =>
      history.filter(
        (workout) => dateKey(getWorkoutDate(workout)) === dateKey(selectedDate),
      ),
    [history, selectedDate],
  );

  if (workouts.isLoading) {
    return (
      <Screen title="History">
        <Skeleton />
      </Screen>
    );
  }

  if (workouts.isError) {
    return (
      <Screen title="History">
        <ErrorState
          message="Could not load workout history."
          onRetry={() => void workouts.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <TrainingHeader title="History" name="Saved workouts" />
      <DateRail
        dates={dateRail}
        onPrevious={() => setSelectedDate((current) => shiftDate(current, -1))}
        onNext={() => setSelectedDate((current) => shiftDate(current, 1))}
        onSelectDate={setSelectedDate}
      />
      {selectedHistory.length ? (
        selectedHistory.map((workout) => {
          const workoutDate = getWorkoutDate(workout);
          const exerciseCount = new Set(
            workout.exercises?.map((exercise) => exercise.exerciseId) ?? [],
          ).size;
          const totalSets = workout.exercises?.length ?? 0;
          const groups = groupExerciseResults(workout.exercises ?? []);

          return (
            <Fragment key={workout.id ?? workout._id}>
              <TrainingSectionTitle
                title={workout.planDay?.name ?? formatDate(workoutDate)}
                gym={workout.gym ?? "Unknown gym"}
              />
              <Text variant="caption" tone="muted">
                {exerciseCount} exercises · {totalSets} set(s) · {formatDateTime(workoutDate)}
              </Text>
              {groups.map((group) => (
                <ExerciseResultCard key={group.exerciseId} title={group.exerciseName}>
                  {group.sets.map((set) => (
                    <ResultRow
                      key={set.id}
                      label={`Series: ${set.series}`}
                      value={`${set.reps} x ${formatNumber(Number(set.weight))} kg`}
                    />
                  ))}
                </ExerciseResultCard>
              ))}
            </Fragment>
          );
        })
      ) : (
        <EmptyState
          title="No workout on this day"
          body="Select a day with a dot to review finished workouts."
        />
      )}
    </Screen>
  );
}
