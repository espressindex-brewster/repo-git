import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy & Cookie Policy | Espressindex',
  description: 'Informativa sulla privacy e sui cookie di Espressindex.com. Nessun cookie di profilazione, nessun dato personale raccolto.',
  robots: { index: true, follow: true },
}

const sections = [
  {
    title: 'Titolare del trattamento',
    content: <>Zeno Tomiolo — <a href="mailto:espressindex@gmail.com" style={{ color: 'var(--caramel)' }}>espressindex@gmail.com</a></>,
  },
  {
    title: 'Quali dati raccogliamo',
    content: 'Espressindex.com non raccoglie dati personali degli utenti. Non è richiesta registrazione, non vengono raccolti nome, email, indirizzo o qualsiasi altro dato identificativo per navigare il sito. I dati sui prezzi del caffè pubblicati si riferiscono esclusivamente a esercizi commerciali e non a persone fisiche.',
  },
  {
    title: 'Cookie',
    content: 'Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento. Non vengono installati cookie di profilazione, cookie di tracciamento o cookie di terze parti a fini pubblicitari. Non utilizziamo Google Analytics, Meta Pixel, o altri strumenti di tracciamento.',
  },
  {
    title: 'Dati di navigazione',
    content: 'I sistemi informatici acquisiscono automaticamente alcuni dati tecnici durante la navigazione: indirizzo IP, tipo di browser, sistema operativo, pagine visitate. Questi dati sono utilizzati esclusivamente per finalità tecniche e di sicurezza, vengono conservati per un massimo di 7 giorni e non sono mai associati a dati identificativi.',
  },
  {
    title: 'Base giuridica del trattamento dati telefonici',
    content: "Espressindex raccoglie i prezzi dei prodotti chiamando esercizi commerciali. Tale attività si fonda sul legittimo interesse ai sensi dell'art. 6.1.f GDPR. I prezzi rilevati sono informazioni commerciali pubbliche. Non vengono raccolti o pubblicati dati personali dei gestori o dei dipendenti.",
  },
  {
    title: 'Diritti degli utenti',
    content: <>Ai sensi del GDPR hai diritto di accesso, rettifica, cancellazione e opposizione al trattamento. Per esercitare questi diritti scrivi a <a href="mailto:espressindex@gmail.com" style={{ color: 'var(--caramel)' }}>espressindex@gmail.com</a>.</>,
  },
]

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem' }}>
      <Link href="/" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>
        ← torna alla mappa
      </Link>

      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400, color: 'var(--espresso)', margin: '2rem 0 0.25rem' }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3rem' }}>Ultimo aggiornamento: maggio 2026</p>

      {sections.map(({ title, content }) => (
        <div key={title} style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.5rem' }}>
            {title}
          </p>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.75 }}>{content}</p>
        </div>
      ))}
    </main>
  )
}
