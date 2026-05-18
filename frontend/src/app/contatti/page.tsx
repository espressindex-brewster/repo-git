import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contatti | Espressindex',
  description: 'Contatta il team di Espressindex per segnalazioni, collaborazioni o domande sul progetto.',
  robots: { index: true, follow: true },
}

const rows = [
  { label: 'Progetto', value: 'Zeno Tomiolo' },
  { label: 'Email', value: <a href="mailto:espressindex@gmail.com" style={{ color: 'var(--caramel)', textDecoration: 'none' }}>espressindex@gmail.com</a> },
  { label: 'LinkedIn', value: <a href="https://www.linkedin.com/in/ztomiolo/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--caramel)', textDecoration: 'none' }}>linkedin.com/in/ztomiolo ↗</a> },
]

export default function ContattiPage() {
  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Link href="/" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>
        ← torna alla mappa
      </Link>

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400, color: 'var(--espresso)', margin: '2rem 0 3rem' }}>
        Contatti
      </h1>

      {rows.map(({ label, value }) => (
        <div key={label} style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.5rem' }}>
            {label}
          </p>
          <p style={{ fontSize: '15px' }}>{value}</p>
        </div>
      ))}
    </main>
  )
}
