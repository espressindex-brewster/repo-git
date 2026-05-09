export default function Navbar() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(250,250,247,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '56px',
    }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--espresso)', letterSpacing: '-0.3px' }}>
        espresso<span style={{ color: 'var(--caramel)', fontStyle: 'italic' }}>index</span>
      </div>

      <ul style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', listStyle: 'none' }}>
        {[
          { label: 'mappa', href: '#mappa' },
          { label: 'dati', href: '#dati' },
          { label: 'come funziona', href: '#come-funziona' },
        ].map(({ label, href }) => (
          <li key={href}>
            <a href={href} style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>{label}</a>
          </li>
        ))}
        <li>
          <a
            href="https://www.paypal.com/donate"
            target="_blank"
            rel="noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontFamily: 'var(--font-sans)',
              color: 'var(--warning)', background: 'var(--caramel-light)',
              border: '1px solid rgba(200,135,58,0.25)',
              borderRadius: '20px', padding: '6px 14px',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            offrimi un caffè
          </a>
        </li>
      </ul>
    </nav>
  )
}
