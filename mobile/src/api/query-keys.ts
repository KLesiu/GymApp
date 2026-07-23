export const keys = {
  me: ["auth", "me"] as const,
  gyms: ["gyms"] as const,
  exercises: ["exercises"] as const,
  muscleGroups: ["muscle-groups"] as const,
  plans: ["plans"] as const,
  activePlan: ["plans", "active"] as const,
  workouts: ["workouts"] as const,
  ranking: (page = 1) => ["ranking", page] as const,
  eloChart: ["elo", "chart"] as const,
  measurements: (bodyPart?: string) => ["measurements", bodyPart] as const,
  measurementTrends: (bodyPart?: string) =>
    ["measurements", "trends", bodyPart] as const,
  reports: ["reports", "assignments"] as const,
};
