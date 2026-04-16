import ChordSelector from './components/ChordSelector'
import ChordList from './components/ChordList'
import PlayBar from './components/PlayBar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-50 bg-gray-50 pt-4 px-6">
          <PlayBar />
        </div>
        <div className="px-6 pb-6 pt-4">
          <ChordSelector />
          <ChordList />
        </div>
      </div>
    </div>
  )
}