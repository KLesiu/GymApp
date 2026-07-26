export type UserRole = 'TRAINER' | 'TRAINEE'
export type SessionUser = { id: string; name: string; email?: string; role: UserRole; elo?: number }
export type TraineeSummary = { id: string; name: string; email?: string; relationshipStatus?: string; elo?: number }
export type Metric = { label: string; value: string; hint?: string; unavailable?: boolean }
export type ChartPoint = { label: string; value: number; hint?: string }
export type WorkoutSummary = { id: string; status: string; date: string; gymName?: string; title: string; summary: string; raw: Record<string, unknown> }
export type MeasurementPoint = { id: string; bodyPart: string; unit: string; value: number; takenAt: string }
export type PlanSummary = { id: string; name: string; description?: string; weeksCount: number; days: { id: string; name: string; weekNumber: number; orderIndex: number }[] }
export type ReportTemplate = { id: string; name: string; description?: string; fields: ReportField[]; version?: number }
export type ReportField = { key: string; label: string; type: 'TEXT' | 'NUMBER' | 'SCALE'; isRequired: boolean; order: number; moduleConfig?: Record<string, unknown> }
export type ReportSubmission = { id: string; traineeId?: string; traineeName?: string; templateName?: string; templateVersion?: number; frozenFields: ReportField[]; submittedAt?: string; answers?: Record<string, unknown>; feedback?: unknown }

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {}
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const str = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const num = (value: unknown): number | undefined => typeof value === 'number' ? value : undefined
const toUserRole = (value: unknown): UserRole | undefined => {
  if (value === 'TRAINER' || value === 'TRAINEE') return value
  return undefined
}

const roleFromClaims = (claims: unknown[]): UserRole | undefined => {
  for (const claim of claims) {
    if (typeof claim !== 'string') continue
    const role = toUserRole(claim.replace(/^role:/, ''))
    if (role) return role
  }
  return undefined
}

const roleFromUser = (user: Record<string, unknown>): UserRole => {
  const directRole = toUserRole(user.role)
  if (directRole) return directRole

  const roles = asArray(user.roles).map(toUserRole)
  if (roles.includes('TRAINER')) return 'TRAINER'
  if (roles.includes('TRAINEE')) return 'TRAINEE'

  return roleFromClaims(asArray(user.permissionClaims)) ?? 'TRAINEE'
}

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
  return { id: str(user.id ?? user._id), name: str(user.name, 'Coach'), email: str(user.email) || undefined, role: roleFromUser(user), elo: num(user.elo) }
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

export const toPlan = (value: unknown): PlanSummary => { const r = asRecord(value); return { id: str(r.id), name: str(r.name, 'Plan'), description: str(r.description) || undefined, weeksCount: num(r.weeksCount) ?? 1, days: unwrapList(r.days).map((day) => { const d = asRecord(day); return { id: str(d.id ?? d._id), name: str(d.name, 'Day'), weekNumber: num(d.weekNumber) ?? 1, orderIndex: num(d.orderIndex) ?? 0 } }) } }
export const toReportTemplate = (value: unknown): ReportTemplate => { const r = asRecord(value); return { id: str(r.id), name: str(r.name, 'Template'), description: str(r.description) || undefined, fields: unwrapList(r.fields).map(toReportField), version: num(r.version) } }
export const toReportField = (value: unknown): ReportField => { const r = asRecord(value); return { key: str(r.key), label: str(r.label), type: str(r.type, 'TEXT') as ReportField['type'], isRequired: Boolean(r.isRequired), order: num(r.order) ?? 0, moduleConfig: asRecord(r.moduleConfig) } }
export const toSubmission = (value: unknown): ReportSubmission => { const r = asRecord(value); const templateVersion = asRecord(r.templateVersion); const snapshot = asRecord(templateVersion.snapshot); return { id: str(r.id), traineeId: str(r.traineeId) || undefined, traineeName: str(r.traineeName) || undefined, templateName: str(r.templateName ?? asRecord(r.template).name), templateVersion: num(templateVersion.version), frozenFields: unwrapList(snapshot.fields).map(toReportField).sort((left, right) => left.order - right.order), submittedAt: str(r.submittedAt ?? r.createdAt) || undefined, answers: asRecord(r.answers ?? r.payloadJson), feedback: r.feedback } }
export const toChartPoints = (value: unknown): ChartPoint[] => unwrapList(value, ['points', 'history', 'elo']).map((item) => { const r = asRecord(item); return { label: str(r.date ?? r.createdAt ?? r.takenAt), value: num(r.value ?? r.elo) ?? 0, hint: str(r.reason ?? r.exerciseName) || undefined } })
