<script setup lang="ts">
defineProps<{ label: string; modelValue: string; options: { label: string; value: string }[]; error?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template><label class="grid gap-1 text-sm font-semibold"><span>{{ label }}</span><select :value="modelValue" class="min-h-12 rounded-lg border border-border bg-surface px-3 py-2 font-normal" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select><span v-if="error" class="text-xs text-danger">{{ error }}</span></label></template>
