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
          fontFamily: 'var(--font-sans)', fontSize: '14px',
          background: 'var(--espresso)', color: 'white',
          border: 'none', padding: '10px 22px',
          borderRadius: '4px', cursor: 'pointer', marginTop: '0.75rem',
          transition: 'opacity 0.15s', display: 'inline-flex', alignItems: 'center',
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.85' }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
      >
        Sei un gestore? Aggiungi il prezzo del tuo bar →
      </button>
      <SubmitPriceModal isOpen={open} onClose={() => setOpen(false)} fonte="gestore" />
    </>
  )
}
