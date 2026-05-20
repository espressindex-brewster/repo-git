import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Espressindex — Il prezzo del caffè in Italia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#faf6f1',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px 100px',
        }}
      >
        {/* left column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
          {/* dot + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2e7d52' }} />
            <span style={{ fontSize: 16, color: '#2e7d52', letterSpacing: 1 }}>DATI IN TEMPO REALE</span>
          </div>

          {/* headline */}
          <div style={{ fontSize: 64, color: '#2c1a0e', fontWeight: 400, lineHeight: 1.1, marginBottom: 28 }}>
            Quanto costa un caffè
            <br />
            <span style={{ color: '#b5651d', fontStyle: 'italic' }}>nel tuo quartiere?</span>
          </div>

          {/* sub */}
          <div style={{ fontSize: 24, color: '#8b7355', marginBottom: 56, maxWidth: 600 }}>
            Mappa aggiornata dei prezzi di espresso e cappuccino in Italia
          </div>

          {/* domain */}
          <div
            style={{
              fontSize: 22,
              color: '#2e7d52',
              background: '#e8f5ee',
              border: '1px solid rgba(46,125,82,0.2)',
              padding: '8px 24px',
              borderRadius: 40,
            }}
          >
            espressindex.com
          </div>
        </div>

        {/* emoji */}
        <div style={{ fontSize: 220, lineHeight: 1, marginLeft: 60 }}>
          ☕
        </div>
      </div>
    ),
    { ...size },
  )
}
