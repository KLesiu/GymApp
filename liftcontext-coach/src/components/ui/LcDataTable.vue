<script setup lang="ts">
defineProps<{ columns: string[]; rows: Record<string, unknown>[] }>()
</script>
<template><div class="overflow-x-auto rounded-xl border border-border bg-surface"><table class="min-w-full text-left text-sm"><thead class="bg-surfaceMuted text-xs uppercase text-textMuted"><tr><th v-for="column in columns" :key="column" class="px-4 py-3">{{ column }}</th></tr></thead><tbody><tr v-for="(row, index) in rows" :key="index" class="border-t border-border"><td v-for="column in columns" :key="column" class="px-4 py-3">{{ row[column] }}</td></tr></tbody></table></div></template>
