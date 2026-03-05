import { describe, expect, it } from 'vitest'
import { useHistory } from './useHistory'

describe('useHistory', () => {
  it('initializes with present', () => {
    const h = useHistory({ x: 1 })
    expect(h.state.value.present).toEqual({ x: 1 })
    expect(h.state.value.past).toEqual([])
    expect(h.state.value.future).toEqual([])
    expect(h.canUndo.value).toBe(false)
    expect(h.canRedo.value).toBe(false)
  })

  it('push adds to past and clears future', () => {
    const h = useHistory({ n: 0 })
    h.push({ n: 1 })
    expect(h.state.value.present).toEqual({ n: 1 })
    expect(h.state.value.past).toHaveLength(1)
    expect(h.state.value.past[0]).toEqual({ n: 0 })
    expect(h.state.value.future).toEqual([])
    expect(h.canUndo.value).toBe(true)
    expect(h.canRedo.value).toBe(false)
  })

  it('undo restores previous and adds current to future', () => {
    const h = useHistory({ n: 0 })
    h.push({ n: 1 })
    h.push({ n: 2 })
    h.undo()
    expect(h.state.value.present).toEqual({ n: 1 })
    h.undo()
    expect(h.state.value.present).toEqual({ n: 0 })
    expect(h.canUndo.value).toBe(false)
    expect(h.canRedo.value).toBe(true)
  })

  it('redo restores from future', () => {
    const h = useHistory({ n: 0 })
    h.push({ n: 1 })
    h.undo()
    expect(h.state.value.present).toEqual({ n: 0 })
    h.redo()
    expect(h.state.value.present).toEqual({ n: 1 })
    expect(h.canRedo.value).toBe(false)
  })

  it('replaceInitial resets history', () => {
    const h = useHistory({ n: 0 })
    h.push({ n: 1 })
    h.replaceInitial({ n: 99 })
    expect(h.state.value.present).toEqual({ n: 99 })
    expect(h.state.value.past).toEqual([])
    expect(h.state.value.future).toEqual([])
  })
})
