'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../lib/store'
import { midiToFreq } from '../lib/music'

export default function PlayBar() {
  const { playing, bpm, timeSignature, chords, setPlaying, setBpm, setTimeSignature } = useAppStore()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const schedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextBeatRef = useRef(0)
  const beatIdxRef = useRef(0)
  const chordIdxRef = useRef(0)
  const beatsPerBar = parseInt(timeSignature.split('/')[0])

  function getAC() {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
    return audioCtxRef.current
  }

  function playNote(freq: number, time: number, dur: number) {
    const ac = getAC()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.exponentialRampToValueAtTime(0.2, time + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(time)
    osc.stop(time + dur + 0.05)
  }

  const schedule = useCallback(() => {
    const ac = getAC()
    while (nextBeatRef.current < ac.currentTime + 0.12) {
      const secPerBeat = 60 / bpm
      if (beatIdxRef.current === 0 && chords.length) {
        const chord = chords[chordIdxRef.current % chords.length]
        chord.midi.forEach(m => playNote(midiToFreq(m), nextBeatRef.current, 0.5))
        chordIdxRef.current++
      }
      const click = getAC().createOscillator()
      const cg = getAC().createGain()
      click.frequency.value = beatIdxRef.current === 0 ? 1100 : 900
      cg.gain.setValueAtTime(0.1, nextBeatRef.current)
      cg.gain.exponentialRampToValueAtTime(0.001, nextBeatRef.current + 0.03)
      click.connect(cg)
      cg.connect(getAC().destination)
      click.start(nextBeatRef.current)
      click.stop(nextBeatRef.current + 0.04)
      beatIdxRef.current = (beatIdxRef.current + 1) % beatsPerBar
      nextBeatRef.current += secPerBeat
    }
    schedTimerRef.current = setTimeout(schedule, 50)
  }, [bpm, beatsPerBar, chords])

  useEffect(() => {
    if (playing) {
      const ac = getAC()
      ac.resume()
      nextBeatRef.current = ac.currentTime + 0.05
      beatIdxRef.current = 0
      chordIdxRef.current = 0
      schedule()
    } else {
      if (schedTimerRef.current) clearTimeout(schedTimerRef.current)
    }
    return () => { if (schedTimerRef.current) clearTimeout(schedTimerRef.current) }
  }, [playing])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        setPlaying(!playing)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [playing])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 flex-wrap">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center flex-shrink-0"
      >
        {playing
          ? <span className="flex gap-1"><span className="w-1 h-3 bg-white rounded-sm"/><span className="w-1 h-3 bg-white rounded-sm"/></span>
          : <span className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[11px] border-transparent border-l-white ml-0.5"/>
        }
      </button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={40} max={280}
          value={bpm}
          onChange={e => setBpm(parseInt(e.target.value) || 120)}
          className="w-14 h-9 text-center border border-gray-200 rounded-lg text-sm font-medium"
        />
        <span className="text-xs text-gray-400 tracking-widest">BPM</span>
      </div>

      <select
        value={timeSignature}
        onChange={e => setTimeSignature(e.target.value)}
        className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white"
      >
        {['4/4','3/4','6/8','2/4','5/4'].map(ts => (
          <option key={ts}>{ts}</option>
        ))}
      </select>

      <div className="flex-1" />
      <span className="text-xs text-gray-400 tracking-widest">METRONOME</span>
      <MetroDots playing={playing} bpm={bpm} beatsPerBar={beatsPerBar} />
    </div>
  )
}

function MetroDots({ playing, bpm, beatsPerBar }: { playing: boolean, bpm: number, beatsPerBar: number }) {
  const beatRef = useRef(0)
  const [activeBeat, setActiveBeat] = useState(0)

  useEffect(() => {
    if (!playing) { setActiveBeat(-1); return }
    const interval = setInterval(() => {
      setActiveBeat(beatRef.current % beatsPerBar)
      beatRef.current++
    }, (60 / bpm) * 1000)
    return () => clearInterval(interval)
  }, [playing, bpm, beatsPerBar])

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: beatsPerBar }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${activeBeat === i ? 'bg-blue-500' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

import { useState } from 'react'
