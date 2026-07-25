<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>
<template><div class="fixed bottom-4 right-4 z-50 grid gap-2"><button v-for="message in toast.messages" :key="message.id" class="rounded-lc border border-border bg-surface px-4 py-3 text-left shadow-card" @click="toast.dismiss(message.id)"><strong class="mr-2" :class="{ 'text-success': message.kind === 'success', 'text-danger': message.kind === 'error', 'text-info': message.kind === 'info' }">{{ message.kind }}</strong>{{ message.text }}</button></div></template>
