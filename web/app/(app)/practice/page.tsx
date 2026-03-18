'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { practice as practiceApi } from '@/lib/api'
import type { ChatMessage, AISessionFeedback, PracticeType } from '@/lib/types'
import { SUBJECTS } from '@/lib/utils'
import { Mic, MicOff, Send, Loader2, StopCircle, ChevronLeft, TrendingUp } from 'lucide-react'
import { cn, scoreColor } from '@/lib/utils'

type Stage = 'setup' | 'chat' | 'results'

// ─── Speech Recognition Hook ─────────────────────────────────────────────────

type SpeechRecognitionInstance = InstanceType<typeof window.webkitSpeechRecognition> | null

function useSpeechRecognition(onResult: (transcript: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance>(null)

  useEffect(() => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.webkitSpeechRecognition; webkitSpeechRecognition?: typeof window.webkitSpeechRecognition }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: typeof window.webkitSpeechRecognition }).webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognitionRef.current = recognition
    }
  }, [])

  const start = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    let finalTranscript = ''

    recognition.onresult = (event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } } }) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!
        if (result.isFinal) {
          finalTranscript += result[0]!.transcript
        } else {
          interim += result[0]!.transcript
        }
      }
      onResult(finalTranscript + interim)
    }

    recognition.onerror = (event: { error: string }) => {
      if (event.error !== 'aborted') {
        toast.error(`Microphone error: ${event.error}`)
      }
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    try {
      recognition.start()
      setListening(true)
    } catch {
      toast.error('Could not start microphone')
    }
  }, [onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  return { listening, supported, toggle, stop }
}

export default function PracticePage() {
  const [stage, setStage] = useState<Stage>('setup')
  const [type, setType] = useState<PracticeType>('oral')
  const [subject, setSubject] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<AISessionFeedback | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleSpeechResult = useCallback((transcript: string) => {
    setInput(transcript)
  }, [])
  const speech = useSpeechRecognition(handleSpeechResult)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!subject) { toast.error('Please select a subject'); return }
    setLoading(true)
    try {
      const res = await practiceApi.start(type, subject)
      setSessionId(res.data.session_id)
      setMessages([res.data.message])
      setStage('chat')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !sessionId) return
    speech.stop()
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await practiceApi.message(sessionId, input)
      setMessages(m => [...m, res.data.message])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnd() {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await practiceApi.end(sessionId)
      setFeedback(res.data.feedback)
      setStage('results')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to end session')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'setup') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Oral Practice</h1>
          <p className="text-slate-500 mt-1">Practice with an AI examiner that asks follow-up questions and evaluates your performance.</p>
        </div>
        <div className="card">
          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="label">Practice type</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'oral', label: 'Language Oral' },
                  { value: 'exam', label: 'Exam Discussion' },
                  { value: 'presentation', label: 'Presentation' },
                ] as const).map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      'px-3 py-2.5 rounded-lg text-sm font-medium border transition-all',
                      type === t.value
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-slate-600 border-surface-border hover:border-brand-300',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="p-subject">Subject</label>
              <select id="p-subject" className="input" value={subject} onChange={e => setSubject(e.target.value)} required>
                <option value="">Select subject…</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Starting session…</> : <><Mic size={16} /> Start Practice</>}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (stage === 'results' && feedback) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setStage('setup'); setMessages([]); setFeedback(null) }} className="btn-ghost">
            <ChevronLeft size={16} /> New session
          </button>
          <h1 className="font-bold text-slate-900">Session Feedback</h1>
        </div>

        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Overall Score</h2>
            <span className={cn('text-3xl font-bold', scoreColor(feedback.overall_score))}>
              {feedback.overall_score}<span className="text-base text-slate-400">/100</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Fluency',   value: feedback.fluency_score },
              { label: 'Content',   value: feedback.content_score },
              { label: 'Structure', value: feedback.structure_score },
              { label: 'Language',  value: feedback.language_score },
            ].map(s => (
              <div key={s.label} className="bg-surface-muted rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={cn('text-xl font-bold', scoreColor(s.value))}>{s.value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600">{feedback.detailed_feedback}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Strengths
            </h3>
            <ul className="space-y-1.5">
              {feedback.strengths.map((s, i) => <li key={i} className="text-xs text-slate-600">✓ {s}</li>)}
            </ul>
          </div>
          <div className="card">
            <h3 className="font-semibold text-sm text-slate-900 mb-3">Improve</h3>
            <ul className="space-y-1.5">
              {feedback.areas_to_improve.map((a, i) => <li key={i} className="text-xs text-slate-600">→ {a}</li>)}
            </ul>
          </div>
          {feedback.vocabulary_suggestions.length > 0 && (
            <div className="card sm:col-span-2">
              <h3 className="font-semibold text-sm text-slate-900 mb-3">Vocabulary suggestions</h3>
              <div className="flex flex-wrap gap-1.5">
                {feedback.vocabulary_suggestions.map(v => <span key={v} className="badge-blue">{v}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Chat stage
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-border bg-white">
        <button onClick={handleEnd} className="btn-ghost text-sm">
          <StopCircle size={15} className="text-red-400" /> End session
        </button>
        <span className="text-sm text-slate-500 ml-auto">{speech.supported ? 'Type or speak your response' : 'Type your response below'}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-brand-500 text-white rounded-br-sm'
                : 'bg-white border border-surface-border text-slate-700 rounded-bl-sm shadow-card',
            )}>
              {msg.role === 'assistant' && (
                <p className="text-xs font-semibold text-brand-500 mb-1">Examiner</p>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-surface-border rounded-xl rounded-bl-sm px-4 py-3 shadow-card">
              <Loader2 size={16} className="animate-spin text-brand-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-surface-border bg-white">
        {speech.listening && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs text-red-600 font-medium">Listening… speak now</span>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3">
          <textarea
            className="textarea flex-1 h-12 resize-none py-3"
            placeholder={speech.listening ? 'Listening…' : 'Type your response…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
            disabled={loading}
          />
          {speech.supported && (
            <button
              type="button"
              onClick={speech.toggle}
              className={cn(
                'px-4 rounded-xl transition-all',
                speech.listening
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/25'
                  : 'btn-secondary',
              )}
              aria-label={speech.listening ? 'Stop listening' : 'Start voice input'}
            >
              {speech.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
          <button type="submit" className="btn-primary px-4" disabled={loading || !input.trim()} aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
