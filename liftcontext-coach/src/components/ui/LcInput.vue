<script setup lang="ts">
defineProps<{ label: string; modelValue: string | number; type?: string; error?: string; hint?: string; required?: boolean; autocomplete?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <label class="grid gap-1 text-sm font-semibold text-ink">
    <span>{{ label }} <span v-if="required" class="text-danger">*</span></span>
    <input :value="modelValue" :type="type ?? 'text'" :autocomplete="autocomplete" :aria-invalid="Boolean(error)" :aria-describedby="error ? `${label}-error` : undefined" class="min-h-12 rounded-lg border border-border bg-surface px-3 py-2 font-normal outline-none transition focus:border-contextDark" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <span v-if="hint && !error" class="text-xs font-medium text-textMuted">{{ hint }}</span>
    <span v-if="error" :id="`${label}-error`" class="text-xs font-medium text-danger">{{ error }}</span>
  </label>
</template>
