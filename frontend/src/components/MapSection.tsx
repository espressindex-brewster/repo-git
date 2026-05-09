import { createClient } from '@/lib/supabase/server'
import type { BarPin } from '@/components/map/PrezziMap'
import PrezziMap from '@/components/map/PrezziMap'

export default async function MapSection() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('bar_sopra_media')
    .select('id, nome, citta, lat, lng, ultimo_espresso, ultimo_cappuccino')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const bars: BarPin[] = (data ?? []).map((b) => ({
    id: b.id!,
    nome: b.nome!,
    citta: b.citta!,
    lat: b.lat!,
    lng: b.lng!,
    espresso: b.ultimo_espresso ?? null,
    cappuccino: b.ultimo_cappuccino ?? null,
    ultimoAggiornamento: null,
  }))

  return (
    <section id="mappa" style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '480px',
        display: 'flex',
      }}>
        <PrezziMap bars={bars} />
      </div>
    </section>
  )
}
