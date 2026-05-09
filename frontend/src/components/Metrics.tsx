interface MetricCardProps {
  label: string
  value: string
  sub: string
}

function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div style={{ background: 'var(--white)', padding: '1.5rem 2rem' }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--espresso)', lineHeight: 1, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{sub}</div>
    </div>
  )
}

interface MetricsProps {
  mediaEspresso: string
  cittaPiuCara: string
  mediaCaraSub: string
  cittaPiuEcon: string
  mediaEconSub: string
  differenza: string
}

export default function Metrics({ mediaEspresso, cittaPiuCara, mediaCaraSub, cittaPiuEcon, mediaEconSub, differenza }: MetricsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1px',
      background: 'var(--border)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <MetricCard label="media nazionale" value={mediaEspresso} sub="espresso al bancone" />
      <MetricCard label="città più cara" value={cittaPiuCara} sub={mediaCaraSub} />
      <MetricCard label="città più economica" value={cittaPiuEcon} sub={mediaEconSub} />
      <MetricCard label="differenza max-min" value={differenza} sub="tra le città rilevate" />
    </div>
  )
}
