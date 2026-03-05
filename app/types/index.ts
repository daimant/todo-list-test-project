export type TodoItem = {
  id: string
  text: string
  done: boolean
}

export type Note = {
  id: string
  title: string
  todos: TodoItem[]
  updatedAt: number
}

export type NotesState = {
  notes: Note[]
}
