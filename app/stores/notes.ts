import { defineStore } from 'pinia'
import type { Note, NotesState, TodoItem } from "../types";

const STORAGE_KEY = 'noteflow.notes.v1'

const createId = () => crypto.randomUUID()

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  const byId = (id: string) => notes.value.find((n) => n.id === id)

  function loadFromStorage() {
    if (typeof window === 'undefined') {
      return
    }
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }
    try {
      const parsed = JSON.parse(raw) as NotesState
      if (Array.isArray(parsed.notes)) {
        notes.value = parsed.notes.map((note) => ({
          ...note,
          todos: Array.isArray(note.todos) ? note.todos : []
        }))
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    if (typeof window === 'undefined') {
      return
    }
    const payload: NotesState = {
      notes: notes.value
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  function upsertNote(payload: { id?: string; title: string; todos: TodoItem[] }) {
    const now = Date.now()
    if (!payload.title.trim() && payload.todos.length === 0) {
      return
    }
    if (payload.id) {
      const index = notes.value.findIndex((n) => n.id === payload.id)
      const normalized: Note = {
        id: payload.id,
        title: payload.title.trim() || 'Без названия',
        todos: payload.todos.map((t) => ({
          ...t,
          text: t.text.trim()
        })),
        updatedAt: now
      }
      if (index === -1) {
        notes.value.unshift(normalized)
      } else {
        notes.value.splice(index, 1, normalized)
      }
    } else {
      const id = createId()
      const note: Note = {
        id,
        title: payload.title.trim() || 'Без названия',
        todos: payload.todos.map((t) => ({
          ...t,
          id: t.id || createId(),
          text: t.text.trim()
        })),
        updatedAt: now
      }
      notes.value.unshift(note)
    }
    persist()
  }

  function deleteNote(id: string) {
    const index = notes.value.findIndex((n) => n.id === id)
    if (index === -1) {
      return
    }
    notes.value.splice(index, 1)
    persist()
  }

  return {
    notes,
    byId,
    loadFromStorage,
    persist,
    upsertNote,
    deleteNote
  }
})
