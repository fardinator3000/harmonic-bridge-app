'use client'

import { useState } from 'react'
import { useAppStore } from '../lib/store'

const KEY_LAYOUT = [
  { type: 'natural', note: 'C' },
  { type: 'accidental', flat: 'Db', sharp: 'C#' },
  { type: 'natural', note: 'D' },
  { type: 'accidental', flat: 'Eb', sharp: 'D#' },
  { type: 'natural', note: 'E' },
  { type: 'natural', note: 'F' },
  { type: 'accidental', flat: 'Gb', sharp: 'F#' },
  { type: 'natural', note: 'G' },
  { type: 'accidental', flat: 'Ab', sharp: 'G#' },
  { type: 'natural', note: 'A' },
  { type: 'accidental', flat: 'Bb', sharp: 'A#' },
  { type: 'natural', note: 'B' },
]

const ENHARMONIC: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#'
}

const QUALITIES = [
  { value: 'maj', label: 'MAJ' },
  { value: 'min', label: 'MIN' },
  { value: '7', label: '7' },
  { value: 'maj7', label: 'MAJ7' },
  { value: 'min7', label: 'MIN7' },
  { value: 'dim', label: 'DIM' },
  { value: 'aug', label: 'AUG' },
  { value: 'sus2', label: 'SUS2' },
  { value: 'sus4', label: 'SUS4' },
  { value: 'add9', label: 'ADD9' },
]

export default function ChordSelector() {
  const [selectedKey, setSelectedKey] = useState('C')
  const [quality, setQuality] = useState('maj')
  const [bass, setBass] = useState('')
  const addChord = useAppStore(s => s.addChord)

  const canonicalKey = ENHARMONIC[selectedKey] ?? selectedKey

  const isSelected = (note: string) => {
    const canon = ENHARMONIC[note] ?? note
    return canon === canonicalKey
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex gap-2 flex-wrap mb-4">
        {KEY_LAYOUT.map((key, i) => {
          if (key.type === 'natural') {
            return (
              <button
                key={key.note}
                onClick={() => setSelectedKey(key.note)}
                className={`w-12 h-12 rounded-lg text-sm font-medium border transition-colors
                  ${isSelected(key.note)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
              >
                {key.note}
              </button>
            )
          } else {
            return (
              <div key={key.flat} className="flex flex-col gap-0.5 w-12">
                <button
                  onClick={() => setSelectedKey(key.flat!)}
                  className={`h-[22px] rounded-md text-xs font-medium border transition-colors
                    ${isSelected(key.flat!)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                >
                  {key.flat}
                </button>
                <button
                  onClick={() => setSelectedKey(key.sharp!)}
                  className={`h-[22px] rounded-md text-xs font-medium border transition-colors
                    ${isSelected(key.sharp!)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                >
                  {key.sharp}
                </button>
              </div>
            )
          }
        })}
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <select
          value={quality}
          onChange={e => setQuality(e.target.value)}
          className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 flex-1 min-w-32"
        >
          {QUALITIES.map(q => (
            <option key={q.value} value={q.value}>{q.label}</option>
          ))}
        </select>

        <span className="text-gray-300">/</span>

        <select
          value={bass}
          onChange={e => setBass(e.target.value)}
          className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 flex-1 min-w-32"
        >
          <option value="">BASS NOTE (OPTIONAL)</option>
          {['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button
          onClick={() => addChord(canonicalKey, quality, bass || undefined)}
          className="h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + ADD CHORD
        </button>
      </div>
    </div>
  )
}