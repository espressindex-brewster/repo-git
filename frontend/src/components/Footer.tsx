export default function Footer() {
  return (
    <>
      <style>{`
        .footer-link:hover { color: var(--black) !important; }
        .footer-credit-link:hover { text-decoration: underline; }
      `}</style>
      <footer style={{ padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '8px', marginBottom: '12px',
          paddingBottom: '12px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            espressindex.com — dati pubblici, nessun cookie di profilazione
          </span>
          <ul style={{ display: 'flex', gap: '1.25rem', listStyle: 'none' }}>
            {[
              { label: 'privacy & cookie policy', href: '/privacy' },
              { label: 'contatti', href: '/contatti' },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="footer-link"
                  style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: '11px', color: '#b0a89a' }}>
          Espressindex è un progetto dimostrativo di{' '}
          <a href="https://www.linkedin.com/in/ztomiolo/" target="_blank" rel="noopener" className="footer-credit-link" style={{ color: 'var(--caramel)', textDecoration: 'none' }}>
            Zeno Tomiolo ↗
          </a>
        </p>
      </footer>
    </>
  )
}
