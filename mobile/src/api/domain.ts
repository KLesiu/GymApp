import { createIdempotencyKey, request } from "@/api/client";
import { keys } from "@/api/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type User = {
  _id: string;
  name: string;
  email?: string;
  roles?: string[];
  elo?: number;
};
export type Gym = {
  _id: string;
  name: string;
  address: string;
  deletedAt?: string | null;
};
export type MuscleGroup = {
  _id: string;
  name: string;
  region: string;
  isGlobal?: boolean;
};
export type ExerciseBodyPart =
  | "CHEST"
  | "BACK"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "QUADS"
  | "HAMSTRINGS"
  | "GLUTES"
  | "CORE"
  | "CALVES";

export const exerciseBodyParts = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "QUADS",
  "HAMSTRINGS",
  "GLUTES",
  "CORE",
  "CALVES",
] as const satisfies readonly ExerciseBodyPart[];

export type Exercise = {
  _id: string;
  name: string;
  bodyPart?: ExerciseBodyPart;
  formula: string;
  muscleGroup?: MuscleGroup;
  muscleGroupId?: string;
  isGlobal?: boolean;
};
export type PlanExercise = {
  exerciseId: string;
  series: number;
  repsTarget: number;
  orderIndex: number;
};
export type Plan = {
  _id: string;
  name: string;
  description?: string | null;
  days: Array<{
    _id: string;
    name: string;
    orderIndex?: number;
    exercises: PlanExercise[];
  }>;
  assignedByTrainer?: boolean;
};
export type WorkoutSet = {
  exerciseId: string;
  series: number;
  reps: number;
  weight: number;
  unit: "KILOGRAMS" | "POUNDS";
};
export type Workout = {
  id: string;
  _id?: string;
  gymId?: string;
  gym?: string;
  planDay?: { _id: string; name: string } | null;
  status?: "DRAFT" | "FINALIZED";
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  exercises?: WorkoutExerciseSet[];
};
export type WorkoutExerciseSet = {
  _id: string;
  id?: string;
  exerciseId: string;
  exerciseName: string;
  series: number;
  reps: number;
  weight: number;
  unit: "KILOGRAMS" | "POUNDS";
};
export type WorkoutDetail = Workout & {
  createdAt: string;
  gym: string;
  planDay?: { _id: string; name: string } | null;
  exercises: WorkoutExerciseSet[];
};
export type LastScore = {
  weight: number;
  reps: number;
  unit: string;
  series: number;
  completedAt?: string;
  date?: string;
  gymName?: string;
};
export type Measurement = {
  _id: string;
  bodyPart: string;
  unit: string;
  value: number;
  takenAt: string;
  delta?: number;
};
export type ReportAssignment = {
  id: string;
  status: string;
  note?: string;
  dueAt?: string;
};

export const useMe = () =>
  useQuery({
    queryKey: keys.me,
    queryFn: ({ signal }) => request<User>({ url: "/api/v1/auth/me" }, signal),
    retry: false,
  });
export const useGyms = () =>
  useQuery({
    queryKey: keys.gyms,
    queryFn: ({ signal }) => request<Gym[]>({ url: "/api/v1/gyms" }, signal),
  });
export const useExercises = () =>
  useQuery({
    queryKey: keys.exercises,
    queryFn: ({ signal }) =>
      request<Exercise[]>({ url: "/api/v1/exercises" }, signal),
  });
export const useMuscleGroups = () =>
  useQuery({
    queryKey: keys.muscleGroups,
    queryFn: ({ signal }) =>
      request<MuscleGroup[]>({ url: "/api/v1/muscle-groups" }, signal),
  });
export const usePlans = () =>
  useQuery({
    queryKey: keys.plans,
    queryFn: ({ signal }) => request<Plan[]>({ url: "/api/v1/plans" }, signal),
  });
export const useActivePlan = () =>
  useQuery({
    queryKey: keys.activePlan,
    queryFn: ({ signal }) =>
      request<Plan | null>({ url: "/api/v1/plans/active" }, signal),
  });
export const useWorkouts = () =>
  useQuery({
    queryKey: keys.workouts,
    queryFn: ({ signal }) =>
      request<Workout[]>({ url: "/api/v1/workouts" }, signal),
  });
export const useWorkout = (workoutId: string | undefined) =>
  useQuery({
    queryKey: workoutId ? keys.workout(workoutId) : ["workouts", "missing"],
    queryFn: ({ signal }) =>
      request<WorkoutDetail>({ url: `/api/v1/workouts/${workoutId}` }, signal),
    enabled: Boolean(workoutId),
  });
export const useRanking = () =>
  useQuery({
    queryKey: keys.ranking(1),
    queryFn: ({ signal }) =>
      request<{ items: User[]; total: number }>(
        { url: "/api/v1/ranking", params: { page: 1, pageSize: 10 } },
        signal,
      ),
  });
export const useEloChart = () =>
  useQuery({
    queryKey: keys.eloChart,
    queryFn: ({ signal }) =>
      request<Array<{ createdAt: string; newElo: number }>>(
        { url: "/api/v1/elo/chart" },
        signal,
      ),
  });
export const useMeasurements = (bodyPart = "WEIGHT") =>
  useQuery({
    queryKey: keys.measurements(bodyPart),
    queryFn: ({ signal }) =>
      request<Measurement[]>(
        { url: "/api/v1/measurements", params: { bodyPart } },
        signal,
      ),
  });
export const useMeasurementTrends = (bodyPart = "WEIGHT") =>
  useQuery({
    queryKey: keys.measurementTrends(bodyPart),
    queryFn: ({ signal }) =>
      request<Measurement[]>(
        { url: "/api/v1/measurements/trends", params: { bodyPart } },
        signal,
      ),
  });
export const useReports = () =>
  useQuery({
    queryKey: keys.reports,
    queryFn: ({ signal }) =>
      request<ReportAssignment[]>(
        { url: "/api/v1/trainee/report-assignments" },
        signal,
      ),
    staleTime: 60_000,
  });
export const useCreateGym = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Pick<Gym, "name" | "address">) =>
      request<Gym>({ url: "/api/v1/gyms", method: "POST", data: body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.gyms }),
  });
};
export const useUpsertExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      bodyPart: ExerciseBodyPart;
      muscleGroupId?: string;
      formula: string;
    }) =>
      request<Exercise>({
        url: "/api/v1/exercises",
        method: "POST",
        data: body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.exercises }),
        qc.invalidateQueries({ queryKey: keys.muscleGroups }),
      ]);
    },
  });
};
export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      description?: string;
      days: {
        name: string;
        orderIndex: number;
        exercises: PlanExercise[];
      }[];
    }) => request<Plan>({ url: "/api/v1/plans", method: "POST", data: body }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.plans }),
        qc.invalidateQueries({ queryKey: keys.activePlan }),
      ]);
    },
  });
};
export const useActivatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      request<{ msg: string; plan: Plan }>({
        url: "/api/v1/plans/active",
        method: "POST",
        data: { planId },
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.plans }),
        qc.invalidateQueries({ queryKey: keys.activePlan }),
      ]);
    },
  });
};
export const useCreateWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      gymId: string;
      startedAt: string;
      planId?: string;
      planDayId?: string;
      sets: WorkoutSet[];
    }) =>
      request<Workout>({ url: "/api/v1/workouts", method: "POST", data: body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.workouts }),
  });
};
export const useUpdateWorkoutSets = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workoutId,
      sets,
    }: {
      workoutId: string;
      sets: {
        id?: string;
        exerciseId: string;
        series: number;
        reps: number;
        weight: number;
        unit: "KILOGRAMS" | "POUNDS";
      }[];
    }) =>
      request<WorkoutDetail>({
        url: `/api/v1/workouts/${workoutId}/sets`,
        method: "PATCH",
        data: { sets },
      }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.workout(variables.workoutId) }),
        qc.invalidateQueries({ queryKey: keys.workouts }),
      ]);
    },
  });
};
export const useFinalizeWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workoutId,
      operationId,
      sets,
    }: { workoutId: string; operationId: string; sets: WorkoutSet[] }) =>
      request<{ gainElo?: number; comparison?: unknown[] }>({
        url: `/api/v1/workouts/${workoutId}/finalize`,
        method: "POST",
        data: { sets },
        headers: {
          "Idempotency-Key": createIdempotencyKey(
            "workout-finalize",
            operationId,
          ),
        },
      }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.workout(variables.workoutId) }),
        qc.invalidateQueries({ queryKey: keys.workouts }),
        qc.invalidateQueries({ queryKey: keys.eloChart }),
        qc.invalidateQueries({ queryKey: keys.ranking(1) }),
      ]);
    },
  });
};
export const useLastScores = () =>
  useMutation({
    mutationFn: (body: {
      exerciseId: string;
      exerciseName?: string;
      series: number;
      gymId: string;
    }) =>
      request<LastScore[]>({
        url: "/api/v1/exercises/last-scores",
        method: "POST",
        data: body,
      }),
  });
export const useCreateMeasurement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      bodyPart: string;
      unit: string;
      value: number;
      takenAt: string;
    }) =>
      request<{ msg: string }>({
        url: "/api/v1/measurements",
        method: "POST",
        data: body,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["measurements"] }),
  });
};
export const useConnectCoach = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (traineeId: string) =>
      request({
        url: "/api/v1/trainer/relationships",
        method: "POST",
        data: { traineeId },
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.reports }),
        qc.invalidateQueries({ queryKey: keys.me }),
      ]);
    },
  });
};
export const useDetachCoach = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      request({ url: "/api/v1/trainee/trainer/detach", method: "POST" }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.reports }),
        qc.invalidateQueries({ queryKey: keys.me }),
      ]);
    },
  });
};
export const useSubmitReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      answers,
    }: { assignmentId: string; answers: Record<string, string | number> }) =>
      request({
        url: `/api/v1/trainee/report-assignments/${assignmentId}/submissions`,
        method: "POST",
        data: { answers },
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.reports }),
  });
};
