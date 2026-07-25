export type UserRole = 'TRAINER' | 'TRAINEE' | 'ADMIN'
export type SessionUser = { id: string; name: string; email?: string; role: UserRole; elo?: number }
export type TraineeSummary = { id: string; name: string; email?: string; relationshipStatus?: string; elo?: number }
export type Metric = { label: string; value: string; hint?: string; unavailable?: boolean }
export type ChartPoint = { label: string; value: number; hint?: string }
export type WorkoutSummary = { id: string; status: string; date: string; gymName?: string; title: string; summary: string; raw: Record<string, unknown> }
export type MeasurementPoint = { id: string; bodyPart: string; unit: string; value: number; takenAt: string }
export type PlanSummary = { id: string; name: string; description?: string }
export type ReportTemplate = { id: string; name: string; description?: string; fields: ReportField[]; version?: number }
export type ReportField = { key: string; label: string; type: 'TEXT' | 'NUMBER' | 'SCALE'; isRequired: boolean; order: number; moduleConfig?: Record<string, unknown> }
export type ReportSubmission = { id: string; traineeId?: string; templateName?: string; submittedAt?: string; answers?: Record<string, unknown>; feedback?: unknown }

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const str = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const num = (value: unknown): number | undefined => typeof value === 'number' ? value : undefined

export const unwrapList = (value: unknown, preferred: readonly string[] = []): unknown[] => {
  if (Array.isArray(value)) return value
  const record = asRecord(value)
  for (const key of preferred) if (Array.isArray(record[key])) return record[key] as unknown[]
  for (const item of Object.values(record)) if (Array.isArray(item)) return item
  return []
}

export const toSessionUser = (value: unknown): SessionUser => {
  const r = asRecord(value)
  const user = asRecord(r.user ?? value)
  return { id: str(user.id), name: str(user.name, 'Coach'), email: str(user.email) || undefined, role: str(user.role, 'TRAINEE') as UserRole, elo: num(user.elo) }
}

export const toToken = (value: unknown): string => {
  const r = asRecord(value)
  return str(r.token ?? r.accessToken ?? r.jwt)
}

export const toTrainee = (value: unknown): TraineeSummary => {
  const r = asRecord(value); const user = asRecord(r.trainee ?? r.user ?? value)
  return { id: str(user.id ?? r.traineeId), name: str(user.name, 'Trainee'), email: str(user.email) || undefined, relationshipStatus: str(r.status, 'ACTIVE'), elo: num(user.elo ?? r.elo) }
}

export const toWorkout = (value: unknown): WorkoutSummary => {
  const r = asRecord(value); const gym = asRecord(r.gym)
  const sets = asArray(r.sets)
  return { id: str(r.id), status: str(r.status), date: str(r.finalizedAt ?? r.startedAt ?? r.createdAt), gymName: str(r.gymName ?? gym.name) || undefined, title: str(r.planDayName ?? r.name ?? 'Workout'), summary: `${sets.length} sets`, raw: r }
}

export const toMeasurement = (value: unknown): MeasurementPoint => {
  const r = asRecord(value)
  return { id: str(r.id), bodyPart: str(r.bodyPart), unit: str(r.unit), value: num(r.value) ?? 0, takenAt: str(r.takenAt) }
}

export const toPlan = (value: unknown): PlanSummary => { const r = asRecord(value); return { id: str(r.id), name: str(r.name, 'Plan'), description: str(r.description) || undefined } }
export const toReportTemplate = (value: unknown): ReportTemplate => { const r = asRecord(value); return { id: str(r.id), name: str(r.name, 'Template'), description: str(r.description) || undefined, fields: unwrapList(r.fields).map(toReportField), version: num(r.version) } }
export const toReportField = (value: unknown): ReportField => { const r = asRecord(value); return { key: str(r.key), label: str(r.label), type: str(r.type, 'TEXT') as ReportField['type'], isRequired: Boolean(r.isRequired), order: num(r.order) ?? 0, moduleConfig: asRecord(r.moduleConfig) } }
export const toSubmission = (value: unknown): ReportSubmission => { const r = asRecord(value); return { id: str(r.id), traineeId: str(r.traineeId) || undefined, templateName: str(r.templateName ?? asRecord(r.template).name), submittedAt: str(r.submittedAt ?? r.createdAt) || undefined, answers: asRecord(r.answers), feedback: r.feedback } }
export const toChartPoints = (value: unknown): ChartPoint[] => unwrapList(value, ['points', 'history', 'elo']).map((item) => { const r = asRecord(item); return { label: str(r.date ?? r.createdAt ?? r.takenAt), value: num(r.value ?? r.elo) ?? 0, hint: str(r.reason ?? r.exerciseName) || undefined } })
