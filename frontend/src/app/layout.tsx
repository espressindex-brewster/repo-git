import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
})

const dmSans = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-sans',
})

const DESCRIPTION = 'Scopri quanto costa un espresso o un cappuccino al bancone nei bar italiani. Mappa aggiornata dei prezzi del caffè in Italia: confronta per quartiere, CAP e città.'

export const metadata: Metadata = {
  title: '☕ Espressindex — Il prezzo del caffè in Italia',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='32' font-size='32'>☕</text></svg>" },
  description: DESCRIPTION,
  metadataBase: new URL('https://espressindex.com'),
  alternates: {
    canonical: 'https://espressindex.com',
    languages: { it: 'https://espressindex.com' },
  },
  openGraph: {
    title: 'Espressindex — Il prezzo del caffè in Italia',
    description: DESCRIPTION,
    url: 'https://espressindex.com',
    siteName: 'Espressindex',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espressindex — Il prezzo del caffè in Italia',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    'geo.region': 'IT-MI',
    'geo.placename': 'Milano, Italia',
    'geo.position': '45.464;9.190',
    'ICBM': '45.464, 9.190',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://espressindex.com/#website',
      name: 'Espressindex',
      url: 'https://espressindex.com',
      description: DESCRIPTION,
      inLanguage: 'it-IT',
    },
    {
      '@type': 'Dataset',
      '@id': 'https://espressindex.com/#dataset',
      name: 'Prezzi del caffè nei bar italiani',
      description: 'Raccolta sistematica dei prezzi di espresso e cappuccino al bancone nei bar italiani, rilevati tramite chiamate telefoniche automatizzate.',
      url: 'https://espressindex.com',
      keywords: ['caffè', 'espresso', 'cappuccino', 'prezzi caffè Italia', 'bar italiani', 'prezzo espresso Milano'],
      creator: { '@type': 'Person', name: 'Zeno Tomiolo', url: 'https://www.linkedin.com/in/ztomiolo/' },
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      dateModified: new Date().toISOString().split('T')[0],
      spatialCoverage: { '@type': 'Place', name: 'Milano, Italia', geo: { '@type': 'GeoCoordinates', latitude: 45.464, longitude: 9.190 } },
      variableMeasured: [
        { '@type': 'PropertyValue', name: 'Prezzo espresso al bancone', unitCode: 'EUR' },
        { '@type': 'PropertyValue', name: 'Prezzo cappuccino al bancone', unitCode: 'EUR' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://espressindex.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'I dati sono affidabili?',
          acceptedAnswer: { '@type': 'Answer', text: 'Ogni rilevazione viene validata automaticamente: i prezzi anomali vengono segnalati e verificati prima di apparire sulla mappa. I dati vengono aggiornati periodicamente per riflettere le variazioni nel tempo.' },
        },
        {
          '@type': 'Question',
          name: 'È legale raccogliere i prezzi chiamando i bar?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sì. Chiamare un esercizio commerciale per raccogliere informazioni pubbliche come il prezzo di un prodotto rientra nel legittimo interesse. Il prezzo del caffè non è un dato personale: è un\'informazione pubblica che chiunque può ottenere semplicemente entrando in un bar.' },
        },
        {
          '@type': 'Question',
          name: 'Come vengono raccolti i prezzi?',
          acceptedAnswer: { '@type': 'Answer', text: 'Un agente vocale chiama direttamente i bar, chiede il prezzo di espresso e cappuccino al bancone e registra i dati in tempo reale. Nessun form da compilare, nessuna app da scaricare: i prezzi vengono raccolti alla fonte, dal barista, per telefono.' },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
