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
  title: 'Espressindex — Il prezzo del caffè in Italia',
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
