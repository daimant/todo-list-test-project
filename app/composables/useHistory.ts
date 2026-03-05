import { shallowRef, computed } from 'vue'

export type HistoryState<T> = {
  past: T[]
  present: T
  future: T[]
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

export const useHistory = <T>(initial: T) => {
  const state = shallowRef<HistoryState<T>>({
    past: [],
    present: deepClone(initial),
    future: []
  })

  const canUndo = computed(() => state.value.past.length > 0)
  const canRedo = computed(() => state.value.future.length > 0)

  const push = (next: T) => {
    if (Object.is(next, state.value.present)) {
      return
    }
    state.value = {
      past: [...state.value.past, deepClone(state.value.present)],
      present: deepClone(next),
      future: []
    }
  }

  const undo = () => {
    if (!state.value.past.length) {
      return
    }
    const previous = state.value.past[state.value.past.length - 1] as T
    const remaining = state.value.past.slice(0, -1)
    state.value = {
      past: remaining,
      present: previous,
      future: [deepClone(state.value.present), ...state.value.future]
    }
  }

  const redo = () => {
    if (!state.value.future.length) {
      return
    }
    const [next, ...rest] = state.value.future
    state.value = {
      past: [...state.value.past, deepClone(state.value.present)],
      present: next as T,
      future: rest
    }
  }

  const replaceInitial = (nextInitial: T) => {
    state.value = {
      past: [],
      present: deepClone(nextInitial),
      future: []
    }
  }

  return {
    state,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    replaceInitial
  }
}

