import { createIdempotencyKey, request } from "@/api/client";
import { keys } from "@/api/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type User = {
  id?: string;
  _id: string;
  name: string;
  email?: string;
  connectionCode?: string;
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
export type PlanDay = {
  _id: string;
  name: string;
  weekNumber?: number;
  orderIndex?: number;
  exercises: PlanExercise[];
};
export type Plan = {
  _id: string;
  name: string;
  description?: string | null;
  weeksCount?: number;
  days: PlanDay[];
  assignedByTrainer?: boolean;
};
export type WorkoutSet = {
  exerciseId: string;
  series: number;
  reps?: number | null;
  weight?: number | null;
  unit: "KILOGRAMS" | "POUNDS";
};
type CompletedWorkoutSet = {
  id?: string;
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
  reps: number | null;
  weight: number | null;
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
export type CurrentCoach = {
  id?: string;
  _id: string;
  status: "ACTIVE";
  activatedAt?: string | null;
  trainer: User;
};
export type CoachInvitation = {
  id: string;
  _id?: string;
  status: "PENDING";
  createdAt?: string;
  trainer: Pick<User, "id" | "_id" | "name" | "email">;
};

export const useMe = () =>
  useQuery({
    queryKey: keys.me,
    queryFn: ({ signal }) => request<User>({ url: "/api/v1/auth/me" }, signal),
    retry: false,
  });
export const useCurrentCoach = () =>
  useQuery({
    queryKey: keys.currentCoach,
    queryFn: ({ signal }) =>
      request<CurrentCoach | null>({ url: "/api/v1/trainee/trainer" }, signal),
  });
export const useCoachInvitations = () =>
  useQuery({
    queryKey: keys.coachInvitations,
    queryFn: ({ signal }) =>
      request<CoachInvitation[]>({ url: "/api/v1/trainee/relationships" }, signal),
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
      request<{ createdAt: string; newElo: number }[]>(
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
export const useUpdateGym = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      gymId,
      body,
    }: { gymId: string; body: Pick<Gym, "name" | "address"> }) =>
      request<Gym>({
        url: `/api/v1/gyms/${gymId}`,
        method: "PATCH",
        data: body,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.gyms }),
  });
};
export const useDeleteGym = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gymId: string) =>
      request<{ msg: string }>({
        url: `/api/v1/gyms/${gymId}`,
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.gyms }),
        qc.invalidateQueries({ queryKey: keys.workouts }),
      ]);
    },
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
export const useUpdateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      exerciseId,
      body,
    }: {
      exerciseId: string;
      body: {
        name?: string;
        bodyPart?: ExerciseBodyPart;
        muscleGroupId?: string;
        formula?: string;
      };
    }) =>
      request<Exercise>({
        url: `/api/v1/exercises/${exerciseId}`,
        method: "PATCH",
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
export const useDeleteExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) =>
      request<{ msg: string }>({
        url: `/api/v1/exercises/${exerciseId}`,
        method: "DELETE",
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
      days?: {
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
export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      body,
    }: {
      planId: string;
      body: { name?: string; description?: string; weeksCount?: number };
    }) =>
      request<Plan>({
        url: `/api/v1/plans/${planId}`,
        method: "PATCH",
        data: body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.plans }),
        qc.invalidateQueries({ queryKey: keys.activePlan }),
      ]);
    },
  });
};
export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      request<{ msg: string }>({
        url: `/api/v1/plans/${planId}`,
        method: "DELETE",
      }),
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
export const useDeactivatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) =>
      request<{ msg: string }>({
        url: `/api/v1/plans/active/${planId}`,
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.plans }),
        qc.invalidateQueries({ queryKey: keys.activePlan }),
      ]);
    },
  });
};
type PlanDayBody = {
  name: string;
  weekNumber?: number;
  orderIndex: number;
  exercises: PlanExercise[];
};
export const useCreatePlanDay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, body }: { planId: string; body: PlanDayBody }) =>
      request<PlanDay>({
        url: `/api/v1/plans/${planId}/days`,
        method: "POST",
        data: body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.plans }),
        qc.invalidateQueries({ queryKey: keys.activePlan }),
      ]);
    },
  });
};
export const useUpdatePlanDay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planDayId,
      body,
    }: { planDayId: string; body: PlanDayBody }) =>
      request<PlanDay>({
        url: `/api/v1/plan-days/${planDayId}`,
        method: "PATCH",
        data: body,
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.plans }),
        qc.invalidateQueries({ queryKey: keys.activePlan }),
      ]);
    },
  });
};
export const useDeletePlanDay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planDayId: string) =>
      request<{ msg: string }>({
        url: `/api/v1/plan-days/${planDayId}`,
        method: "DELETE",
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
      sets: CompletedWorkoutSet[];
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
    }: {
      workoutId: string;
      operationId: string;
      sets: CompletedWorkoutSet[];
    }) =>
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
    mutationFn: (traineeEmail: string) =>
      request({
        url: "/api/v1/trainer/relationships",
        method: "POST",
        data: { traineeEmail },
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.currentCoach }),
        qc.invalidateQueries({ queryKey: keys.reports }),
        qc.invalidateQueries({ queryKey: keys.me }),
      ]);
    },
  });
};
export const useAcceptCoachInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (relationshipId: string) =>
      request({
        url: `/api/v1/trainee/relationships/${relationshipId}/accept`,
        method: "POST",
      }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.currentCoach }),
        qc.invalidateQueries({ queryKey: keys.coachInvitations }),
      ]);
    },
  });
};
export const useRejectCoachInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (relationshipId: string) =>
      request({
        url: `/api/v1/trainee/relationships/${relationshipId}/reject`,
        method: "POST",
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.coachInvitations }),
  });
};
export const useDetachCoach = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      request({ url: "/api/v1/trainee/trainer/detach", method: "POST" }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: keys.currentCoach }),
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
