'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-ok')) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem('cookie-ok', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        .cookie-btn-accept:hover { opacity: 0.85; }
        .cookie-btn-minimal:hover { border-color: rgba(255,255,255,0.4) !important; }
      `}</style>
      <div
        role="dialog"
        aria-label="Cookie policy"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 1000,
          background: 'var(--espresso)',
          color: '#e8d9c8',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <p style={{ fontSize: '13px', lineHeight: 1.5, flex: 1, minWidth: '200px', color: '#c8b89a' }}>
          Questo sito usa solo cookie tecnici necessari al funzionamento. Nessun cookie di profilazione, nessuna pubblicità.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={dismiss} className="cookie-btn-accept" style={{
            background: 'var(--caramel)', color: 'white', border: 'none',
            padding: '7px 18px', borderRadius: '4px',
            fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}>
            accetta
          </button>
          <button onClick={dismiss} className="cookie-btn-minimal" style={{
            background: 'transparent', color: '#c8b89a',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '7px 18px', borderRadius: '4px',
            fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}>
            solo necessari
          </button>
        </div>
      </div>
    </>
  )
}
