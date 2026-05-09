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
    <div
      role="dialog"
      aria-label="Cookie policy"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
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
        Questo sito usa solo cookie tecnici necessari al funzionamento. Nessun cookie di profilazione, nessuna pubblicità.{' '}
        <a href="#" style={{ color: 'var(--caramel)', textUnderlineOffset: '3px' }}>Cookie policy</a>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={dismiss} style={{
          background: 'var(--caramel)', color: 'white', border: 'none',
          padding: '7px 18px', borderRadius: '4px',
          fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer',
        }}>
          accetta
        </button>
        <button onClick={dismiss} style={{
          background: 'transparent', color: '#c8b89a',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '7px 18px', borderRadius: '4px',
          fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer',
        }}>
          solo necessari
        </button>
      </div>
    </div>
  )
}
