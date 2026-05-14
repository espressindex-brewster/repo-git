'use client'

import { useState, useEffect, useRef } from 'react'

interface BarSuggestion {
  id: string
  nome: string
  cap: string | null
  citta: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  barId?: string | null
  barNome?: string | null
  fonte?: 'gestore' | 'cliente'
}

export default function SubmitPriceModal({ isOpen, onClose, barId, barNome, fonte = 'cliente' }: Props) {
  const [query, setQuery] = useState(barNome ?? '')
  const [selectedId, setSelectedId] = useState(barId ?? '')
  const [suggestions, setSuggestions] = useState<BarSuggestion[]>([])
  const [showSugg, setShowSugg] = useState(false)
  const [espresso, setEspresso] = useState('')
  const [cappuccino, setCappuccino] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPrecompiled = !!barId

  useEffect(() => {
    if (isOpen) {
      setQuery(barNome ?? '')
      setSelectedId(barId ?? '')
      setEspresso('')
      setCappuccino('')
      setSubmitted(false)
      setError('')
    }
  }, [isOpen, barId, barNome])

  useEffect(() => {
    if (isPrecompiled || query.length < 2) { setSuggestions([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/bars?q=${encodeURIComponent(query)}`)
      if (res.ok) setSuggestions(await res.json())
    }, 280)
  }, [query, isPrecompiled])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!query.trim()) { setError('Inserisci il nome del bar'); return }
    if (!espresso && !cappuccino) { setError('Inserisci almeno un prezzo'); return }

    setSubmitting(true)
    const res = await fetch('/api/submit-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bar_id:    selectedId || null,
        bar_nome:  query.trim(),
        espresso:  espresso || null,
        cappuccino: cappuccino || null,
        fonte,
      }),
    })
    setSubmitting(false)
    if (res.ok) { setSubmitted(true) }
    else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Errore, riprova')
    }
  }

  if (!isOpen) return null

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: '14px',
    border: '1px solid var(--border)', borderRadius: '4px',
    fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px',
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: 'var(--white)', borderRadius: '8px',
        maxWidth: '420px', width: '100%', padding: '2rem',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
        >×</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--espresso)', marginBottom: '0.75rem' }}>
              Grazie!
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
              La tua segnalazione è stata ricevuta e verrà verificata prima di apparire sulla mappa.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: '1.5rem', background: 'var(--espresso)', color: 'white',
                border: 'none', padding: '9px 24px', borderRadius: '4px',
                fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >Chiudi</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: 'var(--espresso)', marginBottom: '0.25rem' }}>
              {fonte === 'gestore' ? 'Aggiungi il tuo bar' : 'Segnala il prezzo'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {fonte === 'gestore'
                ? 'Sei un gestore? Inserisci i prezzi del tuo bar e li pubblichiamo sulla mappa.'
                : 'Conosci il prezzo di questo bar? Aiutaci a tenerlo aggiornato.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Nome bar */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Bar</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedId(''); setShowSugg(true) }}
                  onFocus={() => setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                  placeholder="Nome del bar"
                  readOnly={isPrecompiled}
                  style={{ ...inputStyle, background: isPrecompiled ? '#f9f6f3' : 'white' }}
                />
                {showSugg && suggestions.length > 0 && (
                  <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', border: '1px solid var(--border)',
                    borderRadius: '4px', listStyle: 'none', margin: 0, padding: 0,
                    zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {suggestions.map((s) => (
                      <li
                        key={s.id}
                        onMouseDown={() => { setQuery(s.nome); setSelectedId(s.id); setSuggestions([]); setShowSugg(false) }}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid var(--border)' }}
                      >
                        <span style={{ color: 'var(--black)' }}>{s.nome}</span>
                        <span style={{ color: 'var(--muted)', marginLeft: '6px', fontSize: '11px' }}>{s.cap ?? s.citta}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Prezzi */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Espresso al bancone</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>€</span>
                    <input
                      type="number" step="0.10" min="0.50" max="5.00"
                      value={espresso}
                      onChange={(e) => setEspresso(e.target.value)}
                      placeholder="1.10"
                      style={{ ...inputStyle, paddingLeft: '24px' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Cappuccino (opz.)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '14px' }}>€</span>
                    <input
                      type="number" step="0.10" min="0.50" max="8.00"
                      value={cappuccino}
                      onChange={(e) => setCappuccino(e.target.value)}
                      placeholder="1.40"
                      style={{ ...inputStyle, paddingLeft: '24px' }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: '13px', color: 'var(--danger)', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'var(--espresso)', color: 'white', border: 'none',
                  padding: '10px', borderRadius: '4px', fontSize: '14px',
                  cursor: submitting ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-sans)', opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Invio in corso…' : 'Invia segnalazione'}
              </button>

              <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Le segnalazioni vengono verificate prima di apparire sulla mappa.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
