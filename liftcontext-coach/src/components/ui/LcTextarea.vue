<script setup lang="ts">
defineProps<{ label: string; modelValue: string; error?: string; rows?: number }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template><label class="grid gap-1 text-sm font-semibold"><span>{{ label }}</span><textarea :value="modelValue" :rows="rows ?? 4" class="rounded-lg border border-border bg-surface px-3 py-2 font-normal" @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" /><span v-if="error" class="text-xs text-danger">{{ error }}</span></label></template>
