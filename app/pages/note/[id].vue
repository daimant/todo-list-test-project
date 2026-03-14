<script setup lang="ts">
import type { Note, TodoItem } from '../../types'
import { useNotesStore } from '../../stores/notes'
import { useHistory } from '../../composables/useHistory'

type Draft = { title: string; todos: TodoItem[] }

const route = useRoute()
const router = useRouter()
const { byId, deleteNote, upsertNote } = useNotesStore()
const id = computed(() => {
  const p = route.params.id
  return (Array.isArray(p) ? p[0] : p) ?? ''
})
const isNew = computed(() => id.value === 'new')
const existing = computed(() => (isNew.value ? null : byId(id.value)))
const initialDraft = computed((): Draft => existing.value ? noteToDraft(existing.value) : emptyDraft())
const history = useHistory(initialDraft.value)
const { canUndo, canRedo, push, undo, redo, replaceInitial } = history
const cloneDraft = (value: Draft): Draft => JSON.parse(JSON.stringify(value))
const draft = ref<Draft>(cloneDraft(history.state.value.present))
const showCancelModal = ref(false)
const showDeleteModal = ref(false)

let pushTimer: ReturnType<typeof setTimeout> | null = null

function emptyDraft(): Draft {
  return { title: '', todos: [] }
}

function noteToDraft(note: Note): Draft {
  return {
    title: note.title,
    todos: note.todos.map((t: TodoItem) => ({ ...t }))
  }
}

function debouncedPush() {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    push(cloneDraft(draft.value))
    pushTimer = null
  }, 50)
}

function addTodo() {
  const next = cloneDraft(draft.value)
  next.todos.push({ id: crypto.randomUUID(), text: '', done: false })
  history.push(next)
}

function removeTodo(index: number) {
  const next = cloneDraft(draft.value)
  next.todos.splice(index, 1)
  history.push(next)
}

function toggleTodo(index: number) {
  const next = cloneDraft(draft.value)
  const item = next.todos[index]
  if (item) item.done = !item.done
  history.push(next)
}

function openCancelModal() {
  showCancelModal.value = true
}

function openDeleteModal() {
  showDeleteModal.value = true
}

function confirmCancel() {
  showCancelModal.value = false
  router.push('/')
}

function confirmDelete() {
  if (!isNew.value) deleteNote(id.value)
  showDeleteModal.value = false
  router.push('/')
}

function save() {
  const payload = {
    id: isNew.value ? undefined : id.value,
    title: draft.value.title,
    todos: draft.value.todos
  }
  upsertNote(payload)
  router.push('/')
}

function onKey(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) redo()
    else undo()
  }
}

watch(initialDraft, (next) => {
  replaceInitial(next)
  draft.value = cloneDraft(next)
}, { immediate: true })

watch(
  () => history.state.value.present,
  (present) => {
    draft.value = cloneDraft(present)
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">{{ isNew ? 'Новая заметка' : 'Редактирование' }}</h1>
        <p class="page__subtitle">{{ isNew ? 'Добавьте название и задачи' : 'Измените заметку и сохраните' }}</p>
      </div>
      <div class="page__actions">
        <button
          type="button"
          class="btn btn--ghost"
          :disabled="!canUndo"
          title="Отменить (Ctrl+Z)"
          @click="undo"
        >
          Отменить
        </button>
        <button
          type="button"
          class="btn btn--ghost"
          :disabled="!canRedo"
          title="Повторить (Ctrl+Shift+Z)"
          @click="redo"
        >
          Повторить
        </button>
        <button type="button" class="btn btn--ghost" @click="openCancelModal">Назад</button>
        <button type="button" class="btn btn--danger" @click="openDeleteModal">Удалить</button>
        <button type="button" class="btn btn--primary" @click="save">Сохранить</button>
      </div>
    </div>

    <div class="card">
      <div class="field" style="margin-bottom: 1rem">
        <label class="field__label">Название</label>
        <input
          v-model="draft.title"
          type="text"
          class="field__input"
          placeholder="Название заметки"
          @input="debouncedPush"
        />
      </div>

      <div class="field">
        <label class="field__label">Задачи</label>

        <div class="todos-list">
          <div v-for="(todo, index) in draft.todos" :key="todo.id" class="todo-row">
            <label class="todo-row__checkbox">
              <input type="checkbox" :checked="todo.done" @change="toggleTodo(index)"/>
            </label>

            <input
              v-model="draft.todos[index]!.text"
              type="text"
              class="todo-row__input"
              :class="{ 'todo-row__input--done': todo.done }"
              placeholder="Текст задачи"
              @input="debouncedPush"
            />

            <button type="button" class="btn btn--icon" title="Удалить" @click="removeTodo(index)">✕</button>
          </div>
        </div>
        <button type="button" class="btn btn--ghost" style="margin-top: 0.5rem" @click="addTodo">
          + Добавить задачу
        </button>
      </div>
    </div>

    <AppModal v-model="showCancelModal" title="Отменить редактирование?" text="Несохранённые изменения будут потеряны.">
      <template #actions>
        <button type="button" class="btn btn--ghost" @click="showCancelModal = false">Продолжить</button>
        <button type="button" class="btn btn--primary" @click="confirmCancel">Отменить редактирование</button>
      </template>
    </AppModal>

    <AppModal v-model="showDeleteModal" title="Удалить заметку?" text="Эту заметку нельзя будет восстановить.">
      <template #actions>
        <button type="button" class="btn btn--ghost" @click="showDeleteModal = false">Нет</button>
        <button type="button" class="btn btn--danger" @click="confirmDelete">Удалить</button>
      </template>
    </AppModal>
  </div>
</template>

<style lang="scss" scoped>

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &__label {
    font-size: 0.8rem;
    color: $text-muted;
  }

  &__input {
    width: 100%;
    padding: 0.65rem 0.8rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: rgba(15, 23, 42, 0.9);
    color: $text-main;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;

    ::placeholder {
      color: rgba(148, 163, 184, 0.7);
    }

    :focus-visible {
      border-color: rgba(56, 189, 248, 0.9);
      box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.8);
      background: rgba(15, 23, 42, 1);
    }
  }
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.65rem;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(30, 64, 175, 0.8);

  &__checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 0.4rem;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: rgba(2, 6, 23, 0.9);
    cursor: pointer;

    input {
      appearance: none;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: transparent;
      cursor: inherit;
      margin: 0;

      &:checked {
        background: radial-gradient(circle at top left, #38bdf8, #0ea5e9);
        border-color: transparent;
      }

      &:focus-visible {
        outline: 2px solid rgba(56, 189, 248, 0.9);
        outline-offset: 2px;
      }
    }
  }

  &__input {
    border: none;
    background: transparent;
    color: $text-main;
    font-size: 0.9rem;
    outline: none;

    &::placeholder {
      color: rgba(148, 163, 184, 0.7);
    }

    &--done {
      color: $text-muted;
      text-decoration: line-through;
    }
  }
}

</style>
