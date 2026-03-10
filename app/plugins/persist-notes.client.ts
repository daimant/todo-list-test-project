import { useNotesStore } from '../stores/notes'
import { storeToRefs } from "pinia";

export default defineNuxtPlugin(() => {
  const { loadFromStorage, persist } = useNotesStore()
  const { notes } = storeToRefs(useNotesStore())
  loadFromStorage()

  watch(() => notes, persist, { deep: true })
})

