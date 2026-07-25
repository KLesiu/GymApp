<script setup lang="ts">
defineProps<{ tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'reference' }>()
</script>
<template><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" :class="{ 'bg-surfaceMuted text-textMuted': !tone || tone === 'neutral', 'bg-success/10 text-success': tone === 'success', 'bg-warning/10 text-warning': tone === 'warning', 'bg-danger/10 text-danger': tone === 'danger', 'bg-info/10 text-info': tone === 'info', 'bg-reference text-ink': tone === 'reference' }"><slot /></span></template>
