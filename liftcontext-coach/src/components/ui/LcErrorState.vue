<script setup lang="ts">
defineProps<{ title?: string; message?: string }>()
defineEmits<{ retry: [] }>()
</script>
<template><div class="rounded-xl border border-danger/30 bg-danger/5 p-5"><h3 class="font-display text-lg font-bold text-danger">{{ title ?? 'Could not load data' }}</h3><p class="mt-2 text-sm text-textMuted">{{ message ?? 'Try again. If the problem persists, check the API connection.' }}</p><button class="mt-4 text-sm font-bold text-contextDark" @click="$emit('retry')">Retry</button></div></template>
