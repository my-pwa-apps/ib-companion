'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { flashcards as flashcardsApi } from '@/lib/api'
import type { FlashcardDeck, Flashcard } from '@/lib/types'
import { SUBJECTS } from '@/lib/utils'
import { Brain, Plus, Loader2, ChevronLeft, ChevronRight, Trash2, Layers } from 'lucide-react'

type ViewState = 'list' | 'generate' | 'study'

export default function FlashcardsPage() {
  const [view, setView] = useState<ViewState>('list')
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [activeDeck, setActiveDeck] = useState<{ deck: FlashcardDeck; cards: Flashcard[] } | null>(null)
  const [loading, setLoading] = useState(false)

  // Generate form
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [cardCount, setCardCount] = useState(15)

  useEffect(() => {
    flashcardsApi.decks().then(res => setDecks(res.data)).catch(() => {})
  }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await flashcardsApi.generate(topic, subject, cardCount)
      toast.success('Flashcards generated!')
      const res = await flashcardsApi.decks()
      setDecks(res.data)
      setTopic(''); setSubject('')
      setView('list')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleStudy(deck: FlashcardDeck) {
    const res = await flashcardsApi.deck(deck.id)
    setActiveDeck(res.data)
    setView('study')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deck?')) return
    await flashcardsApi.deleteDeck(id)
    setDecks(d => d.filter(dd => dd.id !== id))
    toast.success('Deck deleted')
  }

  if (view === 'study' && activeDeck) {
    return <StudyView deck={activeDeck.deck} cards={activeDeck.cards} onBack={() => setView('list')} />
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
          <p className="text-slate-500 mt-1">AI-generated flashcards with spaced repetition.</p>
        </div>
        <button onClick={() => setView(v => v === 'generate' ? 'list' : 'generate')} className="btn-primary">
          <Plus size={16} /> New deck
        </button>
      </div>

      {/* Generate form */}
      {view === 'generate' && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Generate Flashcards</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Subject</label>
                <select className="input" value={subject} onChange={e => setSubject(e.target.value)} required>
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cards to generate</label>
                <select className="input" value={cardCount} onChange={e => setCardCount(Number(e.target.value))}>
                  {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} cards</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Topic</label>
              <input
                className="input"
                placeholder="e.g. Krebs cycle, World War I causes, Econometric models…"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Brain size={16} /> Generate</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setView('list')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Decks list */}
      {decks.length === 0 && view !== 'generate' ? (
        <div className="card text-center py-16">
          <Layers size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No flashcard decks yet. Generate your first!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(deck => (
            <div key={deck.id} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="inline-flex p-2 rounded-lg bg-emerald-50">
                  <Brain size={16} className="text-emerald-600" />
                </div>
                <button
                  onClick={() => handleDelete(deck.id)}
                  className="btn-ghost p-1.5 text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">{deck.title}</h3>
              <p className="text-xs text-slate-500 mb-3">{deck.card_count} cards · {deck.subject}</p>
              <button onClick={() => handleStudy(deck)} className="btn-primary w-full text-xs py-2">
                Study now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StudyView({ deck, cards, onBack }: { deck: FlashcardDeck; cards: Flashcard[]; onBack: () => void }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const card = cards[index]

  async function handleRate(quality: number) {
    if (!card) return
    await flashcardsApi.review(card.id, quality).catch(() => {})
    setFlipped(false)
    setReviewed(r => r + 1)
    if (index < cards.length - 1) setIndex(i => i + 1)
    else toast.success(`Session complete! Reviewed ${reviewed + 1} cards.`)
  }

  if (!card) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
        <Brain size={40} className="text-emerald-400 mb-4" />
        <p className="text-xl font-bold text-slate-900 mb-2">All done! 🎉</p>
        <p className="text-slate-500 mb-6">You reviewed all {cards.length} cards.</p>
        <button onClick={onBack} className="btn-primary">Back to decks</button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="btn-ghost"><ChevronLeft size={16} /> Back</button>
        <h2 className="font-semibold text-slate-900">{deck.title}</h2>
        <span className="badge-gray ml-auto">{index + 1}/{cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${((index) / cards.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div
        className="card min-h-64 cursor-pointer select-none flex flex-col items-center justify-center text-center p-8 mb-6 hover:shadow-card-hover transition-all"
        onClick={() => setFlipped(f => !f)}
      >
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-4">{flipped ? 'Answer' : 'Question'}</p>
        <p className="text-lg font-medium text-slate-900 leading-relaxed">
          {flipped ? card.back : card.front}
        </p>
        {!flipped && <p className="text-xs text-slate-400 mt-6">Tap to reveal answer</p>}
      </div>

      {/* Rating buttons (only after flip) */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { quality: 0, label: 'Blackout', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
            { quality: 2, label: 'Hard',     color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
            { quality: 3, label: 'Good',     color: 'bg-brand-100 text-brand-700 hover:bg-brand-200' },
            { quality: 5, label: 'Easy',     color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
          ].map(r => (
            <button
              key={r.quality}
              onClick={() => handleRate(r.quality)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${r.color}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
