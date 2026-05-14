'use client'

import { useState } from 'react'
import SubmitPriceModal from '@/components/SubmitPriceModal'

export default function SubmitPriceButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: '12px',
          background: 'transparent', color: 'var(--muted)',
          border: '1px solid var(--border)', padding: '6px 16px',
          borderRadius: '4px', cursor: 'pointer', marginTop: '0.75rem',
          transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--black)'; (e.target as HTMLElement).style.borderColor = 'rgba(0,0,0,0.2)' }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--muted)'; (e.target as HTMLElement).style.borderColor = 'var(--border)' }}
      >
        Sei un gestore? Aggiungi il prezzo del tuo bar →
      </button>
      <SubmitPriceModal isOpen={open} onClose={() => setOpen(false)} fonte="gestore" />
    </>
  )
}
