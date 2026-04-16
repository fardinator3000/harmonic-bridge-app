'use client'

import { useRef, useEffect } from 'react'
import { useAppStore } from '../lib/store'
import { noteName, voiceLeadingPaths } from '../lib/music'

export default function VoiceLeadingVisualizer() {
  const { chords, selectedNotes, toggleNote } = useAppStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const COL_W = 120
  const ROW_H = 52
  const PAD_X = 40
  const PAD_Y = 48
  const NOTE_R = 18

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const maxNotes = Math.max(...chords.map(c => c.midi.length), 0)
    const W = Math.max(600, chords.length * COL_W + PAD_X * 2)
    const H = PAD_Y + maxNotes * ROW_H + 40
    canvas.width = W
    canvas.height = H

    ctx.clearRect(0, 0, W, H)

    const positions = chords.map((chord, ci) =>
      chord.midi.map((midi, ni) => ({
        x: PAD_X + ci * COL_W + COL_W / 2,
        y: PAD_Y + ni * ROW_H,
        midi, ci, ni
      }))
    )

    // Draw voice leading paths
    for (let ci = 0; ci < chords.length - 1; ci++) {
      const from = positions[ci]
      const to = positions[ci + 1]
      const paths = voiceLeadingPaths(
        chords[ci].midi,
        chords[ci + 1].midi
      )

      paths.forEach(path => {
        const fp = from.find(p => p.midi === path.from)
        const tp = to.find(p => p.midi === path.to)
        if (!fp || !tp) return

        const fromSelected = selectedNotes[chords[ci].id]?.includes(path.from)
        const toSelected = selectedNotes[chords[ci + 1].id]?.includes(path.to)
        const isHighlighted = fromSelected && toSelected

        ctx.beginPath()
        ctx.moveTo(fp.x + NOTE_R, fp.y)
        ctx.lineTo(tp.x - NOTE_R, tp.y)

        if (isHighlighted) {
          ctx.strokeStyle = '#3B82F6'
          ctx.lineWidth = 2
          ctx.setLineDash([])
        } else {
          ctx.strokeStyle = '#CBD5E1'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
        }
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Draw note circles
    positions.forEach((colNotes, ci) => {
      // Chord label
      ctx.font = '500 13px system-ui'
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.fillText(chords[ci].label, PAD_X + ci * COL_W + COL_W / 2, PAD_Y - 22)

      colNotes.forEach(({ x, y, midi, ni }) => {
        const isSelected = selectedNotes[chords[ci].id]?.includes(midi)

        ctx.beginPath()
        ctx.arc(x, y, NOTE_R, 0, Math.PI * 2)
        ctx.fillStyle = isSelected ? '#3B82F6' : '#F8FAFC'
        ctx.fill()
        ctx.strokeStyle = isSelected ? '#2563EB' : '#CBD5E1'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.font = '500 12px system-ui'
        ctx.fillStyle = isSelected ? '#ffffff' : '#374151'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(noteName(midi), x, y)
        ctx.textBaseline = 'alphabetic'
      })
    })
  }, [chords, selectedNotes])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    chords.forEach((chord, ci) => {
      chord.midi.forEach((midi, ni) => {
        const x = PAD_X + ci * COL_W + COL_W / 2
        const y = PAD_Y + ni * ROW_H
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
        if (dist < NOTE_R + 4) toggleNote(chord.id, midi)
      })
    })
  }

  if (!chords.length) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4">
      <p className="text-xs font-medium text-gray-400 tracking-widest mb-3">
        VOICE LEADING — <span className="font-normal">click notes to highlight paths</span>
      </p>
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="cursor-pointer"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    </div>
  )
}