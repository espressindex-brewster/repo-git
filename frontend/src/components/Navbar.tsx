'use client'

import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'mappa', href: '#mappa' },
    { label: 'dati', href: '#dati' },
    { label: 'come funziona', href: '#come-funziona' },
  ]

  return (
    <>
      <style>{`
        .nav-link:hover { color: var(--black) !important; }
        .btn-caffe:hover { background: #eedbbf !important; }
      `}</style>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,247,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem', height: '56px', maxWidth: '1200px', margin: '0 auto',
        }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--espresso)', letterSpacing: '-0.3px' }}>
            ☕ espress<span style={{ color: 'var(--caramel)', fontStyle: 'italic' }}>index</span>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex" style={{ alignItems: 'center', gap: '1.5rem', listStyle: 'none' }}>
            {links.map(({ label, href }) => (
              <li key={href}>
                <a href={href} className="nav-link" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}>{label}</a>
              </li>
            ))}
            <li>
              <a
                href="https://www.paypal.com/paypalme/Zeno"
                target="_blank"
                rel="noopener"
                className="btn-caffe"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontFamily: 'var(--font-sans)',
                  color: 'var(--warning)', background: 'var(--caramel-light)',
                  border: '1px solid rgba(200,135,58,0.25)',
                  borderRadius: '20px', padding: '6px 14px',
                  textDecoration: 'none', transition: 'background 0.15s',
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--espresso)' }}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden" style={{
            background: 'rgba(250,250,247,0.98)',
            borderTop: '1px solid var(--border)',
            padding: '0.75rem 1rem 1rem',
          }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {links.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="nav-link"
                    style={{ display: 'block', padding: '0.6rem 0', fontSize: '15px', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li style={{ paddingTop: '0.75rem' }}>
                <a
                  href="https://www.paypal.com/paypalme/Zeno"
                  target="_blank"
                  rel="noopener"
                  className="btn-caffe"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontFamily: 'var(--font-sans)',
                    color: 'var(--warning)', background: 'var(--caramel-light)',
                    border: '1px solid rgba(200,135,58,0.25)',
                    borderRadius: '20px', padding: '8px 16px',
                    textDecoration: 'none',
                  }}
                >
                  ☕ offrimi un caffè
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  )
}
