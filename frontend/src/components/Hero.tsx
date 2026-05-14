import SubmitPriceButton from '@/components/SubmitPriceButton'

export default function Hero({ nBar }: { nBar: number }) {
  const nBarLabel = nBar > 0 ? `${nBar.toLocaleString('it-IT')} bar mappati` : '12.847 bar mappati'

  return (
    <section style={{ padding: '5rem 2rem 4rem', borderBottom: '1px solid var(--border)', maxWidth: '800px' }}>
      <style>{`
        .btn-primary:hover { opacity: 0.85; }
        .btn-secondary:hover { border-color: rgba(0,0,0,0.2) !important; color: var(--black) !important; }
      `}</style>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', color: 'var(--success)',
        background: '#e8f5ee', border: '1px solid rgba(46,125,82,0.2)',
        padding: '3px 10px', borderRadius: '20px',
        marginBottom: '1.5rem', letterSpacing: '0.2px',
      }}>
        <span style={{
          width: '6px', height: '6px', background: 'var(--success)',
          borderRadius: '50%', display: 'inline-block',
          animation: 'pulse-dot 2s infinite',
        }} />
        aggiornato oggi — {nBarLabel}
      </div>

      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(32px, 5vw, 52px)',
        fontWeight: 400,
        lineHeight: 1.1,
        letterSpacing: '-0.5px',
        color: 'var(--espresso)',
        marginBottom: '1.25rem',
      }}>
        Quanto costa un caffè<br />nel tuo <em style={{ fontStyle: 'italic', color: 'var(--caramel)' }}>quartiere?</em>
      </h1>

      <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.65 }}>
        Mappiamo i prezzi di espresso e cappuccino in tutta Italia, partendo da Milano. Nessuna legge, nessuna multa, solo trasparenza.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a href="#mappa" className="btn-primary" style={{
          fontFamily: 'var(--font-sans)', fontSize: '14px',
          background: 'var(--espresso)', color: 'white',
          border: 'none', padding: '10px 22px', borderRadius: '4px',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
          transition: 'opacity 0.15s',
        }}>
          esplora la mappa →
        </a>
        <a href="#come-funziona" className="btn-secondary" style={{
          fontFamily: 'var(--font-sans)', fontSize: '14px',
          background: 'transparent', color: 'var(--muted)',
          border: '1px solid var(--border)', padding: '10px 22px', borderRadius: '4px',
          textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s',
        }}>
          come funziona
        </a>
      </div>
      <SubmitPriceButton />
    </section>
  )
}
