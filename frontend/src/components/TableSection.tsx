export interface CapRow {
  cap: string
  citta: string
  mediaEspresso: number
  deltaPct: number
}

export default function TableSection({ rows }: { rows: CapRow[] }) {
  return (
    <section id="dati" style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        fontSize: '12px', color: 'var(--muted)',
        textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1rem',
      }}>
        prezzi per CAP
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '280px' }}>
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
