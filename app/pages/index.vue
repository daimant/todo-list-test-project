<script setup lang="ts">
import type { Note, TodoItem } from '../types'
import { useNotesStore } from '../stores/notes';
import { watchEffect } from "vue";

const notesStore = useNotesStore()
const notes = computed(() => notesStore.notes)
const PREVIEW_COUNT = 3
const showDeleteModal = ref(false)
let noteToDelete: Note | null = null

function previewTodos(todos: TodoItem[]) {
  return todos.slice(0, PREVIEW_COUNT)
}

function doneCount(todos: TodoItem[]) {
  return todos.filter((t) => t.done).length
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function openDeleteModal(note: Note) {
  noteToDelete = note
  showDeleteModal.value = true
}

function confirmDelete() {
  if (noteToDelete) {
    notesStore.deleteNote(noteToDelete.id)
    noteToDelete = null
  }
  showDeleteModal.value = false
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Заметки</h1>
        <p class="page__subtitle">Список всех заметок и задач</p>
      </div>

      <div class="page__actions">
        <NuxtLink to="/note/new" class="btn btn--primary">
          Создать заметку
        </NuxtLink>
      </div>
    </div>

    <client-only>
      <div v-if="!notes.length" class="card card--muted">
        <p class="page__subtitle">Нет заметок. Создайте первую.</p>

        <NuxtLink to="/note/new" class="btn btn--primary" style="margin-top: 0.75rem">
          Создать заметку
        </NuxtLink>
      </div>

      <div v-else class="note-grid">
        <article v-for="note in notes" :key="note.id" class="card">
          <div>
            <h3 class="note-card__title">{{ note.title }}</h3>

            <div class="note-card__meta">
              <span class="badge badge--accent">{{ note.todos.length }} задач</span>
              <span class="pill">{{ formatDate(note.updatedAt) }}</span>
            </div>

            <div class="note-card__preview">
              <div v-for="(todo, i) in previewTodos(note.todos)" :key="todo.id" class="note-card__preview-item">
                <span class="note-card__preview-dot"/>
                <span :class="{ 'todo-row__input--done': todo.done }">{{ todo.text || 'Без текста' }}</span>
              </div>
            </div>
          </div>

          <div class="note-card__footer">
            <span class="pill pill--success">{{ doneCount(note.todos) }} выполнено</span>

            <div class="note-card__footer-actions">
              <NuxtLink :to="`/note/${note.id}`" class="btn btn--ghost">Изменить</NuxtLink>
              <button type="button" class="btn btn--danger" @click="openDeleteModal(note)">
                Удалить
              </button>
            </div>
          </div>
        </article>
      </div>
    </client-only>

    <AppModal v-model="showDeleteModal" title="Удалить заметку?" text="Эту заметку нельзя будет восстановить.">
      <template #actions>
        <button type="button" class="btn btn--ghost" @click="showDeleteModal = false">Отмена</button>
        <button type="button" class="btn btn--danger" @click="confirmDelete">Удалить</button>
      </template>
    </AppModal>
  </div>
</template>

<style lang="scss" scoped>

.note-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 960px) {
  .note-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .note-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.note-card {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
    gap: 0.4rem;
    flex-flow: wrap;
  }

  &__preview {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  &__preview-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: $text-muted;
  }

  &__preview-dot {
    width: 0.28rem;
    height: 0.28rem;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.8);
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.3rem;
    flex-flow: wrap;
  }

  &__footer-actions {
    display: flex;
    gap: 0.35rem;
    flex-flow: wrap;
  }
}

.pill {
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  font-size: 0.7rem;
  color: $text-muted;
  white-space: nowrap;
}

.pill--success {
  border-color: rgba(52, 211, 153, 0.8);
  color: #6ee7b7;
}

</style>