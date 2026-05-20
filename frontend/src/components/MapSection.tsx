import { createClient } from '@/lib/supabase/server'
import type { BarPin } from '@/components/map/PrezziMap'
import PrezziMap from '@/components/map/PrezziMap'

export default async function MapSection() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('bar_sopra_media')
    .select('id, nome, citta, cap, lat, lng, ultimo_espresso, ultimo_cappuccino, ultimo_aggiornamento, google_place_id')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .not('ultimo_espresso', 'is', null)

  const bars: BarPin[] = (data ?? []).map((b) => ({
    id: b.id!,
    nome: b.nome!,
    citta: b.citta!,
    cap: b.cap ?? null,
    lat: b.lat!,
    lng: b.lng!,
    espresso: b.ultimo_espresso ?? null,
    cappuccino: b.ultimo_cappuccino ?? null,
    ultimoAggiornamento: b.ultimo_aggiornamento ?? null,
    googlePlaceId: b.google_place_id ?? null,
  }))

  return (
    <section id="mappa" style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        height: 'min(480px, 70vh)',
        display: 'flex',
      }}>
        <PrezziMap bars={bars} />
      </div>
    </section>
  )
}
