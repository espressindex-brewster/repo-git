export default function Insight({ text }: { text: string }) {
  return (
    <section style={{ padding: 'clamp(1rem, 3vw, 2rem)', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        background: 'var(--cream)',
        borderLeft: '3px solid var(--caramel)',
        borderRadius: '0 8px 8px 0',
        padding: '1.25rem 1.5rem',
      }}>
        <div style={{
          fontSize: '10px', color: 'var(--caramel)',
          textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
        }}>
          dato della settimana
        </div>
        <p
          style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--espresso)', lineHeight: 1.4 }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </section>
  )
}
