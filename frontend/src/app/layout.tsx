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

export const metadata: Metadata = {
  title: 'Espressindex — Il prezzo del caffè in Italia',
  description: 'Quanto costa un caffè al bancone vicino a te? Mappa aggiornata dei prezzi di espresso e cappuccino nei bar italiani.',
  metadataBase: new URL('https://espressindex.com'),
  openGraph: {
    title: 'Espressindex — Il prezzo del caffè in Italia',
    description: 'Quanto costa un caffè al bancone vicino a te? Mappa aggiornata dei prezzi di espresso e cappuccino nei bar italiani.',
    url: 'https://espressindex.com',
    siteName: 'Espressindex',
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espressindex — Il prezzo del caffè in Italia',
    description: 'Quanto costa un caffè al bancone vicino a te? Mappa aggiornata dei prezzi di espresso e cappuccino nei bar italiani.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
