'use client'

import { useState } from 'react'
import { useAppStore } from '../lib/store'
import { noteName, buildChord } from '../lib/music'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SCALE_MODES = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian']
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const SCALE_INTERVALS: Record<string, number[]> = {
  Ionian:     [0,2,4,5,7,9,11],
  Dorian:     [0,2,3,5,7,9,10],
  Phrygian:   [0,1,3,5,7,8,10],
  Lydian:     [0,2,4,6,7,9,11],
  Mixolydian: [0,2,4,5,7,9,10],
  Aeolian:    [0,2,3,5,7,8,10],
  Locrian:    [0,1,3,5,6,8,10],
}

function getScaleNotes(root: string, mode: string): string[] {
  const base = NOTES.indexOf(root)
  return SCALE_INTERVALS[mode].map(i => NOTES[(base + i) % 12])
}

function ScaleRow({ root }: { root: string }) {
  const [mode, setMode] = useState('Ionian')
  const notes = getScaleNotes(root, mode)
  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-gray-50 last:border-0">
      <select
        value={mode}
        onChange={e => setMode(e.target.value)}
        className="h-7 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-full"
      >
        {SCALE_MODES.map(m => <option key={m}>{m}</option>)}
      </select>
      <div className="flex gap-1 flex-wrap justify-end">
        {notes.map(n => (
          <span key={n} className="text-xs font-medium text-blue-500 min-w-5 text-center">{n}</span>
        ))}
      </div>
    </div>
  )
}

function BeatsSelector({ chordId, beats }: { chordId: string, beats: number }) {
  const { timeSignature, updateBeats } = useAppStore()
  const beatsPerBar = parseInt(timeSignature.split('/')[0])
  const options = Array.from({ length: beatsPerBar }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-xs text-gray-400">BEATS</span>
      <select
        value={beats}
        onChange={e => updateBeats(chordId, parseInt(e.target.value))}
        className="h-6 px-2 border border-gray-200 rounded text-xs text-gray-600 bg-white"
      >
        {options.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  )
}

function SortableChordRow({ chord }: { chord: any }) {
  const { selectedNotes, removeChord, toggleNote, duplicateChord } = useAppStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chord.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 mt-1">
          <button
            onClick={() => removeChord(chord.id)}
            className="text-gray-300 hover:text-gray-500 text-sm leading-none"
          >🗑</button>
          <button
            onClick={() => duplicateChord(chord.id)}
            className="text-gray-300 hover:text-blue-400 text-sm leading-none"
            title="Duplicate"
          >⧉</button>
          <button
            {...attributes}
            {...listeners}
            className="text-gray-300 hover:text-gray-500 text-sm leading-none cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >⇅</button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-lg font-medium w-16 flex-shrink-0 text-gray-800">
              <span className="font-bold">{chord.root}</span>
              <span className="text-sm font-normal">{chord.quality}</span>
              {chord.bass && <span className="text-xs text-gray-400">/{chord.bass}</span>}
            </p>
            <div className="flex gap-2 flex-wrap">
              {chord.midi.map((midi: number) => {
                const selected = selectedNotes[chord.id]?.includes(midi)
                return (
                  <button
                    key={midi}
                    onClick={() => toggleNote(chord.id, midi)}
                    className={`w-9 h-9 rounded-full border text-xs font-medium transition-colors
                      ${selected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    {noteName(midi)}
                  </button>
                )
              })}
            </div>
          </div>
          <BeatsSelector chordId={chord.id} beats={chord.beats} />
        </div>
      </div>
    </div>
  )
}

export default function ChordList() {
  const { chords, clearChords, reorderChords } = useAppStore()
  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = chords.findIndex(c => c.id === active.id)
      const newIndex = chords.findIndex(c => c.id === over.id)
      reorderChords(arrayMove(chords, oldIndex, newIndex))
    }
  }

  if (!chords.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={clearChords}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          🗑 CLEAR CHORDS
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-gray-400 tracking-widest mb-3">CHORD NOTES</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chords.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {chords.map(chord => (
                <SortableChordRow key={chord.id} chord={chord} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 tracking-widest mb-3 text-right">SCALES</p>
          <div className="flex flex-col gap-3">
            {chords.map((chord) => (
              <ScaleRow key={chord.id} root={chord.root} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-6 pt-4 border-t border-gray-50">
        <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
          💾 SAVE PROGRESSION
        </button>
        <span className="text-xs text-gray-400 tracking-widest">VOICE LEADING ACTIVE</span>
      </div>
    </div>
  )
}