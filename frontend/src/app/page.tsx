export const revalidate = 3600

import { createClient } from '@/lib/supabase/server'
import CookieBanner from '@/components/CookieBanner'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Metrics from '@/components/Metrics'
import MapSection from '@/components/MapSection'
import Insight from '@/components/Insight'
import TableSection from '@/components/TableSection'
import type { CapRow } from '@/components/TableSection'
import ComeFunziona from '@/components/ComeFunziona'
import Footer from '@/components/Footer'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: barsRaw }, { data: statsZona }, { data: statsCap }] = await Promise.all([
    supabase.from('bar_sopra_media').select('id'),
    supabase.from('stats_zona').select('citta, media_espresso, n_bar').order('media_espresso', { ascending: false }),
    supabase.from('stats_cap').select('cap, citta, media_espresso, n_bar').order('media_espresso', { ascending: false }),
  ])

  const nBar = barsRaw?.length ?? 0

  // Metriche dai CAP (boxes in alto)
  const caps = (statsCap ?? []).filter((s) => s.media_espresso != null)
  const allMediasCap = caps.map((s) => Number(s.media_espresso))
  const mediaGlobale = allMediasCap.length > 0 ? allMediasCap.reduce((a, b) => a + b, 0) / allMediasCap.length : null
  const piuCaro = caps[0] ?? null
  const piuEcon = caps[caps.length - 1] ?? null
  const differenzaPct = piuCaro && piuEcon && Number(piuEcon.media_espresso) > 0
    ? Math.round(((Number(piuCaro.media_espresso) - Number(piuEcon.media_espresso)) / Number(piuEcon.media_espresso)) * 100)
    : null

  const metricsProps = {
    mediaEspresso: mediaGlobale ? `€${mediaGlobale.toFixed(2)}` : '—',
    cittaPiuCara: piuCaro?.cap ?? '—',
    mediaCaraSub: piuCaro ? `media €${Number(piuCaro.media_espresso).toFixed(2)}` : 'dati in arrivo',
    cittaPiuEcon: piuEcon?.cap ?? '—',
    mediaEconSub: piuEcon ? `media €${Number(piuEcon.media_espresso).toFixed(2)}` : 'dati in arrivo',
    differenza: differenzaPct ? `+${differenzaPct}%` : '—',
  }

  // Tabella per CAP (top 20 ordinati per prezzo decrescente)
  const tableRows: CapRow[] = caps
    .filter((s) => s.media_espresso != null)
    .slice(0, 20)
    .map((s) => {
      const media = Number(s.media_espresso)
      const delta = mediaGlobale ? Math.round(((media - mediaGlobale) / mediaGlobale) * 100) : 0
      return { cap: s.cap ?? '', citta: s.citta ?? '', mediaEspresso: media, deltaPct: delta }
    })

  const insightText =
    piuCaro && piuEcon && differenzaPct && piuCaro.cap !== piuEcon.cap
      ? `Il CAP <strong>${piuCaro.cap}</strong> è <strong>il ${differenzaPct}% più caro</strong> del CAP ${piuEcon.cap}. Un espresso costa €${Number(piuCaro.media_espresso).toFixed(2)} contro €${Number(piuEcon.media_espresso).toFixed(2)}.`
      : null

  return (
    <>
      <CookieBanner />
      <Navbar />
      <main>
        <Hero nBar={nBar} />
        <Metrics {...metricsProps} />
        <MapSection />
        {insightText && <Insight text={insightText} />}
        {tableRows.length > 0 && <TableSection rows={tableRows} />}
        <ComeFunziona />
      </main>
      <Footer />
    </>
  )
}
