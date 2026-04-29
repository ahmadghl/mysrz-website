import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import {
  Plus, Trash2, Send, Bot, User, ExternalLink,
  MessageSquare, Pencil, Check, X, Loader2, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { url: string; title: string; similarity: number }[]
  created_at: string
}

interface Session {
  id: string
  title: string
  updated_at: string
}

// Simple markdown renderer (bold, code, links, line breaks)
function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-surface-border/60 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\[(\d+)\]/g, '<span class="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-brand-600/20 text-brand-400 rounded-full font-mono font-medium mx-0.5">$1</span>')
    .replace(/\n/g, '<br/>')
}

export default function Chat() {
  const qc = useQueryClient()
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
  const token = (() => {
    try { return JSON.parse(localStorage.getItem('auth-store') || '{}').state?.token } catch { return '' }
  })()

  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamBuffer, setStreamBuffer] = useState('')
  const [streamSources, setStreamSources] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.listSessions().then(r => r.data),
    refetchInterval: 10_000,
  })

  // Load messages when session changes
  useEffect(() => {
    if (!activeSession) return
    chatApi.getMessages(activeSession).then(r => setMessages(r.data))
  }, [activeSession])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamBuffer])

  const createSession = useMutation({
    mutationFn: () => chatApi.createSession('New chat'),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['chat-sessions'] })
      setActiveSession(res.data.id)
      setMessages([])
    },
  })

  const deleteSession = useMutation({
    mutationFn: (id: string) => chatApi.deleteSession(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['chat-sessions'] })
      if (activeSession === id) { setActiveSession(null); setMessages([]) }
    },
  })

  const renameSession = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => chatApi.renameSession(id, title),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chat-sessions'] }); setEditingId(null) },
  })

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeSession || streaming) return
    const question = input.trim()
    setInput('')
    setStreaming(true)
    setStreamBuffer('')
    setStreamSources([])

    // Optimistically add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const resp = await fetch(`${BASE_URL}/api/v1/chat/sessions/${activeSession}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question, stream: true }),
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      if (!resp.body) throw new Error('No response body')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ''
      let sources: any[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'token') {
              fullAnswer += data.content
              setStreamBuffer(fullAnswer)
            } else if (data.type === 'sources') {
              sources = data.sources
              setStreamSources(sources)
            } else if (data.type === 'done' || data.type === 'error') {
              break
            }
          } catch {}
        }
      }

      // Commit final message
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullAnswer,
        sources,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setStreamBuffer('')
      setStreamSources([])
      qc.invalidateQueries({ queryKey: ['chat-sessions'] })

    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.message}. Please try again.`,
        created_at: new Date().toISOString(),
      }])
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }, [input, activeSession, streaming, BASE_URL, token])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sessions sidebar ──────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-surface-border flex flex-col bg-surface-card">
        <div className="px-3 pt-4 pb-2 border-b border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Chats</span>
          </div>
          <button
            onClick={() => createSession.mutate()}
            className="btn-primary w-full justify-center text-sm"
          >
            <Plus size={14} /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {sessions.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">No chats yet</p>
          )}
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => { setActiveSession(session.id); chatApi.getMessages(session.id).then(r => setMessages(r.data)) }}
              className={clsx(
                'group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors',
                activeSession === session.id
                  ? 'bg-brand-600/15 text-slate-200'
                  : 'text-slate-400 hover:bg-surface-muted hover:text-slate-300'
              )}
            >
              <MessageSquare size={13} className="flex-shrink-0" />

              {editingId === session.id ? (
                <input
                  className="flex-1 bg-surface border border-brand-500 rounded px-1.5 py-0.5 text-xs text-slate-100 outline-none min-w-0"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') renameSession.mutate({ id: session.id, title: editTitle })
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-xs truncate min-w-0">{session.title}</span>
              )}

              <div className={clsx('flex gap-0.5 flex-shrink-0', editingId === session.id ? 'flex' : 'hidden group-hover:flex')}>
                {editingId === session.id ? (
                  <>
                    <button onClick={e => { e.stopPropagation(); renameSession.mutate({ id: session.id, title: editTitle }) }} className="p-0.5 text-emerald-400 hover:text-emerald-300"><Check size={12} /></button>
                    <button onClick={e => { e.stopPropagation(); setEditingId(null) }} className="p-0.5 text-slate-500 hover:text-slate-300"><X size={12} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={e => { e.stopPropagation(); setEditingId(session.id); setEditTitle(session.title) }} className="p-0.5 text-slate-600 hover:text-slate-300"><Pencil size={11} /></button>
                    <button onClick={e => { e.stopPropagation(); if (confirm('Delete this chat?')) deleteSession.mutate(session.id) }} className="p-0.5 text-slate-600 hover:text-red-400"><Trash2 size={11} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* No session selected */}
        {!activeSession && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/15 border border-brand-600/20 flex items-center justify-center">
              <Bot size={24} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">RAG Chat</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Ask questions about your crawled pages. Answers are grounded in your data with source citations.
              </p>
            </div>
            <button onClick={() => createSession.mutate()} className="btn-primary">
              <Plus size={14} /> Start a new chat
            </button>
          </div>
        )}

        {/* Chat messages */}
        {activeSession && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {messages.length === 0 && !streaming && (
                <div className="text-center py-12 text-slate-600 text-sm">
                  <Bot size={28} className="mx-auto mb-2 opacity-40" />
                  Ask anything about your crawled content.
                </div>
              )}

              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {/* Streaming assistant message */}
              {streaming && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    {streamSources.length > 0 && (
                      <SourceList sources={streamSources} />
                    )}
                    <div className="text-sm text-slate-200 leading-relaxed">
                      {streamBuffer ? (
                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(streamBuffer) }} />
                      ) : (
                        <span className="flex items-center gap-2 text-slate-500">
                          <Loader2 size={14} className="animate-spin" />
                          Searching your content...
                        </span>
                      )}
                      {streamBuffer && <span className="inline-block w-0.5 h-4 bg-brand-400 animate-pulse ml-0.5 align-middle" />}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex gap-3 items-end bg-surface-card border border-surface-border rounded-xl p-3">
                <textarea
                  ref={inputRef}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 resize-none outline-none max-h-32 min-h-[40px] leading-relaxed"
                  placeholder="Ask about your crawled pages... (Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{ height: 'auto' }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement
                    t.style.height = 'auto'
                    t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming}
                  className={clsx(
                    'p-2 rounded-lg transition-all flex-shrink-0',
                    input.trim() && !streaming
                      ? 'bg-brand-600 hover:bg-brand-700 text-white'
                      : 'bg-surface-border text-slate-600 cursor-not-allowed'
                  )}
                >
                  {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-2 text-center">
                Answers are grounded in your crawled pages with citations. Always verify important information.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={clsx(
        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
        isUser ? 'bg-slate-700' : 'bg-brand-600/20'
      )}>
        {isUser ? <User size={14} className="text-slate-300" /> : <Bot size={14} className="text-brand-400" />}
      </div>
      <div className={clsx('flex-1 space-y-2', isUser && 'items-end flex flex-col')}>
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <SourceList sources={msg.sources} />
        )}
        <div className={clsx(
          'text-sm leading-relaxed rounded-xl px-4 py-3 max-w-[85%]',
          isUser
            ? 'bg-brand-600/20 text-slate-200 border border-brand-600/20'
            : 'bg-surface-card border border-surface-border text-slate-200'
        )}>
          {isUser
            ? <p>{msg.content}</p>
            : <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
          }
        </div>
        <span className="text-xs text-slate-600 px-1">
          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}

function SourceList({ sources }: { sources: { url: string; title: string; similarity: number }[] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? sources : sources.slice(0, 3)

  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500 font-medium">Sources used:</p>
      <div className="flex flex-wrap gap-1.5">
        {shown.map((s, i) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-surface-muted border border-surface-border hover:border-brand-500/40 rounded-lg text-xs text-slate-400 hover:text-brand-400 transition-colors max-w-[240px]"
          >
            <span className="text-brand-500 font-mono font-medium">[{i + 1}]</span>
            <span className="truncate">{s.title || s.url}</span>
            <ExternalLink size={10} className="flex-shrink-0 opacity-50" />
          </a>
        ))}
        {sources.length > 3 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronRight size={12} className={clsx('transition-transform', expanded && 'rotate-90')} />
            {expanded ? 'Show less' : `+${sources.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  )
}
