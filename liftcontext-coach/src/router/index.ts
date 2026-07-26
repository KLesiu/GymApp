import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/features/auth/LoginView.vue'), meta: { public: true } },
  { path: '/register', name: 'register', component: () => import('@/features/auth/RegisterView.vue'), meta: { public: true } },
  { path: '/', component: () => import('@/layouts/AppLayout.vue'), children: [
    { path: '', name: 'dashboard', component: () => import('@/features/dashboard/DashboardView.vue') },
    { path: 'invitations', name: 'invitations', component: () => import('@/features/trainees/TraineesView.vue'), props: { initialTab: 'invitations' } },
    { path: 'trainees', name: 'trainees', component: () => import('@/features/trainees/TraineesView.vue'), props: { initialTab: 'trainees' } },
    { path: 'trainees/:traineeId', name: 'trainee-profile', component: () => import('@/features/trainees/TraineeProfileView.vue') },
    { path: 'trainees/:traineeId/workouts', name: 'trainee-workouts', component: () => import('@/features/trainees/TraineeProfileView.vue'), props: { initialTab: 'workouts' } },
    { path: 'trainees/:traineeId/strength', name: 'trainee-strength', component: () => import('@/features/trainees/TraineeProfileView.vue'), props: { initialTab: 'strength' } },
    { path: 'trainees/:traineeId/measurements', name: 'trainee-measurements', component: () => import('@/features/trainees/TraineeProfileView.vue'), props: { initialTab: 'measurements' } },
    { path: 'trainees/:traineeId/plans', name: 'trainee-plans', component: () => import('@/features/trainees/TraineeProfileView.vue'), props: { initialTab: 'plans' } },
    { path: 'trainees/:traineeId/reports', name: 'trainee-reports', component: () => import('@/features/trainees/TraineeProfileView.vue'), props: { initialTab: 'reports' } },
    { path: 'relationships', redirect: { name: 'invitations' } },
    { path: 'plans', name: 'plans', component: () => import('@/features/plans/PlansView.vue') },
    { path: 'plans/new', name: 'plan-new', component: () => import('@/features/plans/PlanEditorView.vue') },
    { path: 'plans/:planId', name: 'plan-detail', component: () => import('@/features/plans/PlanEditorView.vue') },
    { path: 'reports/templates', name: 'report-templates', component: () => import('@/features/reports/ReportTemplatesView.vue') },
    { path: 'reports/templates/new', name: 'report-template-new', component: () => import('@/features/reports/ReportTemplateEditorView.vue') },
    { path: 'reports/templates/:templateId', redirect: { name: 'report-templates' } },
    { path: 'reports/assignments', name: 'report-assignments', component: () => import('@/features/reports/ReportAssignmentsView.vue') },
    { path: 'reports/submissions', name: 'report-submissions', component: () => import('@/features/reports/ReportSubmissionsView.vue') },
    { path: 'reports/submissions/:submissionId', name: 'report-submission-detail', component: () => import('@/features/reports/ReportSubmissionsView.vue') },
    { path: 'reports/recurring-rules', name: 'recurring-rules', component: () => import('@/features/reports/RecurringRulesView.vue') },
    { path: 'exercises', name: 'exercises', component: () => import('@/features/exercises/ExercisesView.vue') },
    { path: 'muscle-groups', name: 'muscle-groups', component: () => import('@/features/exercises/MuscleGroupsView.vue') },
    { path: 'ranking', name: 'ranking', component: () => import('@/features/elo/RankingView.vue') },
    { path: 'settings', name: 'settings', component: () => import('@/features/settings/SettingsView.vue') },
    { path: 'about', name: 'about', component: () => import('@/features/settings/AboutView.vue') },
  ] },
]

export const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const session = useSessionStore()
  if (!session.user && session.token && !session.isRestoring) await session.restore().catch(() => session.logout())
  if (!to.meta.public && !session.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath.startsWith('/') ? to.fullPath : '/' } }
  if (to.meta.public && session.isAuthenticated) return { name: 'dashboard' }
  return true
})
