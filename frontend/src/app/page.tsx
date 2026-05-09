import { createClient } from '@/lib/supabase/server'
import CookieBanner from '@/components/CookieBanner'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Metrics from '@/components/Metrics'
import MapSection from '@/components/MapSection'
import Insight from '@/components/Insight'
import TableSection from '@/components/TableSection'
import type { CityRow } from '@/components/TableSection'
import ComeFunziona from '@/components/ComeFunziona'
import Footer from '@/components/Footer'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: barsRaw }, { data: statsZona }] = await Promise.all([
    supabase.from('bars').select('id').not('lat', 'is', null),
    supabase.from('stats_zona').select('citta, media_espresso, n_bar').order('media_espresso', { ascending: false }),
  ])

  const nBar = barsRaw?.length ?? 0

  // Compute metrics from stats_zona
  const stats = statsZona ?? []
  const allMedias = stats.map((s) => Number(s.media_espresso)).filter(Boolean)
  const mediaGlobale = allMedias.length > 0 ? allMedias.reduce((a, b) => a + b, 0) / allMedias.length : null
  const piuCaro = stats[0] ?? null
  const piuEcon = stats[stats.length - 1] ?? null
  const differenzaPct = piuCaro && piuEcon && Number(piuEcon.media_espresso) > 0
    ? Math.round(((Number(piuCaro.media_espresso) - Number(piuEcon.media_espresso)) / Number(piuEcon.media_espresso)) * 100)
    : null

  const metricsProps = {
    mediaEspresso: mediaGlobale ? `€${mediaGlobale.toFixed(2)}` : '—',
    cittaPiuCara: piuCaro?.citta ?? '—',
    mediaCaraSub: piuCaro ? `media €${Number(piuCaro.media_espresso).toFixed(2)}` : 'dati in arrivo',
    cittaPiuEcon: piuEcon?.citta ?? '—',
    mediaEconSub: piuEcon ? `media €${Number(piuEcon.media_espresso).toFixed(2)}` : 'dati in arrivo',
    differenza: differenzaPct ? `+${differenzaPct}%` : '—',
  }

  const tableRows: CityRow[] = stats.map((s) => {
    const media = Number(s.media_espresso)
    const delta = mediaGlobale ? Math.round(((media - mediaGlobale) / mediaGlobale) * 100) : 0
    return { citta: s.citta ?? '', mediaEspresso: media, deltaPct: delta }
  })

  const insightText =
    piuCaro && piuEcon && differenzaPct
      ? `${piuCaro.citta} è <strong>il ${differenzaPct}% più cara</strong> di ${piuEcon.citta}. Un espresso a ${piuCaro.citta} costa €${Number(piuCaro.media_espresso).toFixed(2)}, contro €${Number(piuEcon.media_espresso).toFixed(2)} a ${piuEcon.citta}.`
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
