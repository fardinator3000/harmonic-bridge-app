export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

export const INTERVALS: Record<string, number[]> = {
  maj:   [0, 4, 7],
  min:   [0, 3, 7],
  dim:   [0, 3, 6],
  aug:   [0, 4, 8],
  sus2:  [0, 2, 7],
  sus4:  [0, 5, 7],
  '7':   [0, 4, 7, 10],
  maj7:  [0, 4, 7, 11],
  min7:  [0, 3, 7, 10],
  dim7:  [0, 3, 6, 9],
  '9':   [0, 4, 7, 10, 14],
  add9:  [0, 4, 7, 14],
  '6':   [0, 4, 7, 9],
}

export const MIDI_BASE: Record<string, number> = {
  C:60, 'C#':61, D:62, 'D#':63, E:64, F:65,
  'F#':66, G:67, 'G#':68, A:69, 'A#':70, B:71
}

export function buildChord(root: string, quality: string): number[] {
  const base = MIDI_BASE[root]
  return (INTERVALS[quality] ?? [0, 4, 7]).map(i => base + i)
}

export function noteName(midi: number): string {
  return NOTES[midi % 12]
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function voiceLeadingPaths(
  from: number[],
  to: number[]
): Array<{ from: number; to: number; distance: number }> {
  return from.map(f => {
    let best = to[0]
    let bestDist = 999
    to.forEach(t => {
      const d = Math.abs(f - t)
      if (d < bestDist) { bestDist = d; best = t }
    })
    return { from: f, to: best, distance: bestDist }
  })
}