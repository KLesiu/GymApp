<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import LcLogo from './LcLogo.vue'

const session = useSessionStore()
const nav = [{ to: '/', label: 'Start' }, { to: '/invitations', label: 'Invitations' }, { to: '/trainees', label: 'Trainees' }, { to: '/plans', label: 'Plans' }, { to: '/reports/templates', label: 'Reports' }, { to: '/exercises', label: 'Exercises' }, { to: '/about', label: 'More' }]
</script>
<template><div class="min-h-screen bg-canvas"><aside class="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-surface p-5 lg:block"><LcLogo/><nav class="mt-8 grid gap-1"><RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="rounded-lg px-3 py-2 text-sm font-bold text-textMuted hover:bg-surfaceMuted" active-class="!bg-contextDark !text-white">{{ item.label }}</RouterLink></nav><button class="absolute bottom-5 left-5 right-5 rounded-lc border border-border px-4 py-3 text-sm font-bold text-contextDark" @click="session.logout()">Log out</button></aside><main class="lg:pl-72"><header class="sticky top-0 z-30 border-b border-border bg-canvas/95 p-4 backdrop-blur lg:hidden"><LcLogo/></header><div class="w-full p-4 md:p-8"><RouterView/></div></main></div></template>
