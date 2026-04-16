import { create } from 'zustand'
import { Chord, Progression } from './types'
import { buildChord, noteName } from './music'

interface AppState {
  chords: Chord[]
  bpm: number
  timeSignature: string
  playing: boolean
  selectedNotes: Record<string, number[]>
  addChord: (root: string, quality: string, bass?: string) => void
  removeChord: (id: string) => void
  clearChords: () => void
  updateBeats: (id: string, beats: number) => void
  toggleNote: (chordId: string, midi: number) => void
  setBpm: (bpm: number) => void
  setTimeSignature: (ts: string) => void
  setPlaying: (playing: boolean) => void
  loadProgression: (chords: Chord[], bpm: number) => void
duplicateChord: (id: string) => void
reorderChords: (chords: Chord[]) => void


}

export const useAppStore = create<AppState>((set) => ({
  chords: [],
  bpm: 120,
  timeSignature: '4/4',
  playing: false,
  selectedNotes: {},

  addChord: (root, quality, bass) => set((state) => {
    const midi = buildChord(root, quality)
    const label = root + quality
    const id = crypto.randomUUID()
    const chord: Chord = { id, root, quality, bass, midi, beats: 4, label }
    return { chords: [...state.chords, chord] }
  }),

  removeChord: (id) => set((state) => ({
    chords: state.chords.filter(c => c.id !== id),
    selectedNotes: Object.fromEntries(
      Object.entries(state.selectedNotes).filter(([k]) => k !== id)
    )
  })),

  clearChords: () => set({ chords: [], selectedNotes: {} }),

  updateBeats: (id, beats) => set((state) => ({
    chords: state.chords.map(c => c.id === id ? { ...c, beats } : c)
  })),

  toggleNote: (chordId, midi) => set((state) => {
    const current = state.selectedNotes[chordId] ?? []
    const next = current.includes(midi)
      ? current.filter(m => m !== midi)
      : [...current, midi]
    return { selectedNotes: { ...state.selectedNotes, [chordId]: next } }
  }),

  setBpm: (bpm) => set({ bpm }),
  setTimeSignature: (timeSignature) => set({ timeSignature }),
  setPlaying: (playing) => set({ playing }),

  loadProgression: (chords, bpm) => set({ chords, bpm, selectedNotes: {} }),
  duplicateChord: (id) => set((state) => {
    const chord = state.chords.find(c => c.id === id)
    if (!chord) return state
    const newChord = { ...chord, id: crypto.randomUUID() }
    const idx = state.chords.findIndex(c => c.id === id)
    const newChords = [...state.chords]
    newChords.splice(idx + 1, 0, newChord)
    return { chords: newChords }
  }),

  reorderChords: (chords) => set({ chords }),
}))