import { defineStore } from 'pinia'

export type ToastKind = 'success' | 'error' | 'info'
export type ToastMessage = { id: number; kind: ToastKind; text: string }

export const useToastStore = defineStore('toast', {
  state: () => ({ messages: [] as ToastMessage[], nextId: 1 }),
  actions: {
    push(kind: ToastKind, text: string) {
      const id = this.nextId++
      this.messages.push({ id, kind, text })
      window.setTimeout(() => this.dismiss(id), 4000)
    },
    dismiss(id: number) { this.messages = this.messages.filter((message) => message.id !== id) },
  },
})
