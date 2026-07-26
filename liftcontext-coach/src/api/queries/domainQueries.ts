import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { apiFetch } from '@/api/http/apiFetch'
import { queryKeys } from './queryKeys'
import { toChartPoints, toMeasurement, toPlan, toReportTemplate, toSubmission, toTrainee, toWorkout, unwrapList, type ReportField } from '@/api/adapters/viewModels'

export const useTraineesQuery = () => useQuery({ queryKey: queryKeys.trainees(), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/trainer/trainees', undefined, signal).then((data) => unwrapList(data, ['trainees']).map(toTrainee)) })
export const usePlansQuery = () => useQuery({ queryKey: queryKeys.plans(), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/plans', undefined, signal).then((data) => unwrapList(data, ['plans']).map(toPlan)) })
export const useExercisesQuery = () => useQuery({ queryKey: queryKeys.exercises(), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/exercises', undefined, signal).then((data) => unwrapList(data, ['exercises'])) })
export const useMuscleGroupsQuery = () => useQuery({ queryKey: queryKeys.muscleGroups(), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/muscle-groups', undefined, signal).then((data) => unwrapList(data, ['muscleGroups'])) })
export const useReportTemplatesQuery = () => useQuery({ queryKey: queryKeys.reportTemplates(), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/trainer/report-templates', undefined, signal).then((data) => unwrapList(data, ['templates']).map(toReportTemplate)) })
export const useSubmissionsQuery = (traineeId?: MaybeRefOrGetter<string | undefined>) => useQuery({ queryKey: computed(() => queryKeys.reportSubmissions(toValue(traineeId))), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/trainer/report-submissions', { traineeId: toValue(traineeId) }, signal).then((data) => unwrapList(data, ['submissions']).map(toSubmission)) })
export const useRecurringRulesQuery = (traineeId?: MaybeRefOrGetter<string | undefined>) => useQuery({ queryKey: computed(() => queryKeys.recurringRules(toValue(traineeId))), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/trainer/recurring-report-rules', { traineeId: toValue(traineeId) }, signal).then((data) => unwrapList(data, ['rules', 'recurringRules'])) })
export const useRankingQuery = () => useQuery({ queryKey: queryKeys.ranking(), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/ranking', { page: 1, pageSize: 25 }, signal).then((data) => unwrapList(data, ['items', 'ranking'])) })

export const useTraineeBundle = (traineeId: MaybeRefOrGetter<string>) => {
  const id = computed(() => toValue(traineeId))
  const trainees = useTraineesQuery()
  const trainee = computed(() => trainees.data.value?.find((item) => item.id === id.value))
  const elo = useQuery({ queryKey: computed(() => queryKeys.traineeElo(id.value)), queryFn: ({ signal }) => apiFetch.get<unknown>(`/api/v1/users/${id.value}/elo`, undefined, signal) })
  const eloChart = useQuery({ queryKey: computed(() => [...queryKeys.traineeElo(id.value), 'chart'] as const), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/elo/chart', { userId: id.value }, signal).then(toChartPoints) })
  const measurements = useQuery({ queryKey: computed(() => queryKeys.traineeMeasurements(id.value)), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/measurements/history', { userId: id.value }, signal).then((data) => unwrapList(data, ['measurements']).map(toMeasurement)) })
  const workouts = useQuery({ queryKey: computed(() => queryKeys.traineeWorkouts(id.value)), queryFn: ({ signal }) => apiFetch.get<unknown>('/api/v1/workouts', { userId: id.value }, signal).then((data) => unwrapList(data, ['workouts']).map(toWorkout).filter((workout) => workout.status === 'FINALIZED')) })
  const reports = useSubmissionsQuery(id)
  return { trainee, trainees, elo, eloChart, measurements, workouts, reports }
}

export const useInviteRelationship = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (traineeCode: string) => apiFetch.post('/api/v1/trainer/relationships', { traineeCode }), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trainees() }) }) }
export const useUnlinkTrainee = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (traineeId: string) => apiFetch.post(`/api/v1/trainer/trainees/${traineeId}/unlink`), onSuccess: (_data, traineeId) => { qc.removeQueries({ queryKey: queryKeys.trainee(traineeId) }); qc.invalidateQueries({ queryKey: queryKeys.trainees() }) } }) }
export const useCreatePlan = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (body: unknown) => apiFetch.post('/api/v1/plans', body), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.plans() }) }) }
export const useAssignPlan = () => useMutation({ mutationFn: ({ planId, traineeId }: { planId: string; traineeId: string }) => apiFetch.post(`/api/v1/plans/${planId}/assignments`, { traineeId }) })
export const useCreateTemplate = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (body: { name: string; description?: string; fields: ReportField[] }) => apiFetch.post('/api/v1/trainer/report-templates', body), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.reportTemplates() }) }) }
export const useAssignReport = () => useMutation({ mutationFn: (body: { traineeId: string; templateId: string; dueAt?: string; note?: string }) => apiFetch.post('/api/v1/trainer/report-assignments', body) })
export const useFeedback = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ submissionId, trainerOverallComment }: { submissionId: string; trainerOverallComment: string }) => apiFetch.patch(`/api/v1/trainer/report-submissions/${submissionId}/feedback`, { trainerOverallComment }), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) }) }
export const usePauseRule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => apiFetch.post(`/api/v1/trainer/recurring-report-rules/${id}/pause`), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', 'recurring-rules'] }) }) }
export const useResumeRule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => apiFetch.post(`/api/v1/trainer/recurring-report-rules/${id}/resume`), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', 'recurring-rules'] }) }) }
