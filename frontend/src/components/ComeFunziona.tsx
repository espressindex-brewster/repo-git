const FAQ = [
  {
    q: 'I dati sono affidabili?',
    a: 'Ogni rilevazione viene validata automaticamente: i prezzi anomali vengono segnalati e verificati prima di apparire sulla mappa. I dati vengono aggiornati periodicamente per riflettere le variazioni nel tempo.',
  },
  {
    q: 'È legale raccogliere i prezzi chiamando i bar?',
    a: 'Sì. Chiamare un esercizio commerciale per raccogliere informazioni pubbliche come il prezzo di un prodotto rientra nel legittimo interesse. Il prezzo del caffè non è un dato personale: è un\'informazione pubblica che chiunque può ottenere semplicemente entrando in un bar.',
  },
  {
    q: 'Come vengono raccolti i prezzi?',
    a: 'Un agente vocale chiama direttamente i bar, chiede il prezzo di espresso e cappuccino al bancone e registra i dati in tempo reale. Nessun form da compilare, nessuna app da scaricare: i prezzi vengono raccolti alla fonte, dal barista, per telefono.',
  },
]

export default function ComeFunziona() {
  return (
    <section id="come-funziona" style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border)', maxWidth: '680px' }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(24px, 3vw, 36px)',
        fontWeight: 400, color: 'var(--espresso)',
        marginBottom: '1.5rem', letterSpacing: '-0.3px',
      }}>
        Come funziona Espressindex
      </h2>

      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
        Espressindex mappa i prezzi del caffè nei bar italiani attraverso un sistema di rilevazione automatica. Un agente vocale chiama i locali, chiede il prezzo di espresso e cappuccino al bancone, e registra i dati in tempo reale su una mappa pubblica accessibile a tutti.
      </p>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
        Nessun form da compilare, nessuna app da scaricare. I prezzi vengono raccolti direttamente alla fonte: dal barista, per telefono, come farebbe qualsiasi cliente curioso.
      </p>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, color: 'var(--espresso)', margin: '2.5rem 0 0.75rem' }}>
        Perché lo facciamo
      </h3>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
        Il prezzo del caffè in Italia varia enormemente da città a città, da quartiere a quartiere, a volte da un isolato all&apos;altro. Eppure non esiste nessuno strumento che renda questa informazione pubblica e confrontabile. Espressindex colma questo vuoto.
      </p>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
        La nostra tesi è semplice: la trasparenza dei prezzi genera pressione sociale virtuosa. Quando un bar sa di essere mappato e confrontato con i vicini, ha un incentivo naturale a restare competitivo. Nessuna legge, nessuna multa: solo informazione pubblica.
      </p>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, color: 'var(--espresso)', margin: '2.5rem 0 0.75rem' }}>
        Domande frequenti
      </h3>

      {FAQ.map((item, i) => (
        <div key={i} style={{
          borderTop: '1px solid var(--border)',
          padding: '1.25rem 0',
          ...(i === FAQ.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
        }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--black)', marginBottom: '0.5rem' }}>{item.q}</p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.a}</p>
        </div>
      ))}
    </section>
  )
}
