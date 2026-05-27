export interface CapRow {
  cap: string
  citta: string
  mediaEspresso: number
  deltaPct: number
}

export default function TableSection({ rows }: { rows: CapRow[] }) {
  return (
    <section id="dati" style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 2.5vw, 28px)',
        fontWeight: 400, color: 'var(--espresso)', marginBottom: '0.5rem', letterSpacing: '-0.2px',
      }}>
        Prezzi espresso per CAP
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Media dei prezzi rilevati per codice di avviamento postale, ordinati dal più caro al più economico.
      </p>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '280px' }}>
        <caption style={{ display: 'none' }}>Prezzi medi dell&apos;espresso al bancone per CAP in area Milano</caption>
        <thead>
          <tr>
            {['CAP', 'espresso', 'vs. media'].map((h, i) => (
              <th key={h} style={{
                fontSize: '11px', color: 'var(--muted)', fontWeight: 400,
                textAlign: i === 0 ? 'left' : 'right',
                padding: '0 0 8px', borderBottom: '1px solid var(--border)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1
            const deltaColor = row.deltaPct > 2 ? 'var(--danger)' : row.deltaPct < -2 ? 'var(--success)' : 'var(--muted)'
            const deltaLabel = row.deltaPct > 0 ? `+${row.deltaPct}%` : `${row.deltaPct}%`
            return (
              <tr key={row.cap}>
                <td style={{ padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--black)' }}>{row.cap}</span>
                  {row.citta && (
                    <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '6px' }}>{row.citta}</span>
                  )}
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right', borderBottom: isLast ? 'none' : '1px solid var(--border)', fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--espresso)' }}>
                  €{row.mediaEspresso.toFixed(2)}
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right', borderBottom: isLast ? 'none' : '1px solid var(--border)', fontSize: '12px', color: deltaColor }}>
                  {deltaLabel}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </section>
  )
}
