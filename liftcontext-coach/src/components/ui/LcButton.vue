<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; loading?: boolean; type?: 'button' | 'submit' | 'reset' }>()
</script>
<template>
  <button :type="type ?? 'button'" :disabled="loading" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-lc px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60" :class="{ 'bg-contextDark text-white hover:bg-context': !variant || variant === 'primary', 'border border-border bg-surface text-contextDark hover:bg-surfaceMuted': variant === 'secondary', 'bg-danger text-white hover:brightness-95': variant === 'danger', 'text-contextDark hover:bg-surfaceMuted': variant === 'ghost' }">
    <span v-if="loading" aria-hidden="true" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
    <slot />
  </button>
</template>
