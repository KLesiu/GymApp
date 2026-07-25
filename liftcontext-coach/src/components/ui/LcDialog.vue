<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
defineEmits<{ close: [] }>()
</script>
<template><Teleport to="body"><div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true"><section class="w-full max-w-lg rounded-xl bg-surface p-6 shadow-card"><div class="mb-4 flex items-start justify-between gap-4"><h2 class="font-display text-xl font-bold">{{ title }}</h2><button class="rounded p-1 text-textMuted" @click="$emit('close')">Close</button></div><slot /></section></div></Teleport></template>
