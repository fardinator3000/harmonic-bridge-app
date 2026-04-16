export interface Chord {
  id: string
  root: string
  quality: string
  bass?: string
  midi: number[]
  beats: number
  label: string
}

export interface Progression {
  id: string
  name: string
  bpm: number
  timeSignature: string
  chords: Chord[]
}
