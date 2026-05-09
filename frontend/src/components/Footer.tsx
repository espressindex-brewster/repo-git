'use client'

import { useState } from 'react'

function Modal({ id, onClose, children }: { id: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      id={id}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ background: 'var(--white)', borderRadius: '8px', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '2.5rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

export default function Footer() {
  const [modal, setModal] = useState<'privacy' | 'contatti' | null>(null)

  return (
    <>
      <style>{`
        .footer-link:hover { color: var(--black) !important; }
        .footer-credit-link:hover { text-decoration: underline; }
      `}</style>
      <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)' }}>
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
              { label: 'privacy', action: () => setModal('privacy') },
              { label: 'cookie policy', action: () => setModal('privacy') },
              { label: 'contatti', action: () => setModal('contatti') },
            ].map(({ label, action }) => (
              <li key={label}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); action() }}
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

      {modal === 'privacy' && (
        <Modal id="modal-privacy" onClose={() => setModal(null)}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, color: 'var(--espresso)', marginBottom: '0.25rem' }}>Privacy Policy</h2>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2rem' }}>Ultimo aggiornamento: maggio 2026</p>

          {[
            { title: 'Titolare del trattamento', content: <>Zeno Tomiolo — <a href="mailto:espressindex@gmail.com" style={{ color: 'var(--caramel)' }}>espressindex@gmail.com</a></> },
            { title: 'Quali dati raccogliamo', content: 'Espressindex.com non raccoglie dati personali degli utenti. Non è richiesta registrazione, non vengono raccolti nome, email, indirizzo o qualsiasi altro dato identificativo per navigare il sito. I dati sui prezzi del caffè pubblicati si riferiscono esclusivamente a esercizi commerciali e non a persone fisiche.' },
            { title: 'Cookie', content: 'Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento. Non vengono installati cookie di profilazione, cookie di tracciamento o cookie di terze parti a fini pubblicitari. Non utilizziamo Google Analytics, Meta Pixel, o altri strumenti di tracciamento.' },
            { title: 'Dati di navigazione', content: 'I sistemi informatici acquisiscono automaticamente alcuni dati tecnici durante la navigazione: indirizzo IP, tipo di browser, sistema operativo, pagine visitate. Questi dati sono utilizzati esclusivamente per finalità tecniche e di sicurezza, vengono conservati per un massimo di 7 giorni e non sono mai associati a dati identificativi.' },
            { title: 'Base giuridica del trattamento dati telefonici', content: 'Espressindex raccoglie i prezzi dei prodotti chiamando esercizi commerciali. Tale attività si fonda sul legittimo interesse ai sensi dell\'art. 6.1.f GDPR. I prezzi rilevati sono informazioni commerciali pubbliche. Non vengono raccolti o pubblicati dati personali dei gestori o dei dipendenti.' },
            { title: 'Diritti degli utenti', content: <>Ai sensi del GDPR hai diritto di accesso, rettifica, cancellazione e opposizione al trattamento. Per esercitare questi diritti scrivi a <a href="mailto:espressindex@gmail.com" style={{ color: 'var(--caramel)' }}>espressindex@gmail.com</a>.</> },
          ].map(({ title, content }) => (
            <div key={title} style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.5rem' }}>{title}</p>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>{content}</p>
            </div>
          ))}
        </Modal>
      )}

      {modal === 'contatti' && (
        <Modal id="modal-contatti" onClose={() => setModal(null)}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, color: 'var(--espresso)', marginBottom: '2rem' }}>Contatti</h2>
          {[
            { label: 'Progetto', value: 'Zeno Tomiolo' },
            { label: 'Email', value: <a href="mailto:espressindex@gmail.com" style={{ color: 'var(--caramel)', textDecoration: 'none' }}>espressindex@gmail.com</a> },
            { label: 'LinkedIn', value: <a href="https://www.linkedin.com/in/ztomiolo/" target="_blank" rel="noopener" style={{ color: 'var(--caramel)', textDecoration: 'none' }}>linkedin.com/in/ztomiolo ↗</a> },
          ].map(({ label, value }) => (
            <div key={label} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontSize: '15px' }}>{value}</p>
            </div>
          ))}
        </Modal>
      )}
    </>
  )
}
