import { createClient } from '@supabase/supabase-js'

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface AddressComponent {
  long_name: string
  types: string[]
}

async function getCapFromPlaceId(placeId: string): Promise<string | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'address_components',
    language: 'it',
    key: GOOGLE_KEY,
  })
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`)
  const data = (await res.json()) as { result?: { address_components?: AddressComponent[] } }
  const components = data.result?.address_components ?? []
  return components.find((c) => c.types.includes('postal_code'))?.long_name ?? null
}

async function main() {
  // Prende bar senza CAP ancora popolato
  const { data: bars, error } = await supabase
    .from('bars')
    .select('id, nome, google_place_id')
    .is('cap', null)
    .not('google_place_id', 'is', null)

  if (error) { console.error(error.message); process.exit(1) }

  console.log(`\nPopola CAP — ${bars?.length ?? 0} bar da aggiornare\n${'─'.repeat(50)}`)

  let ok = 0, skip = 0, err = 0

  for (let i = 0; i < (bars?.length ?? 0); i++) {
    const bar = bars![i]
    const cap = await getCapFromPlaceId(bar.google_place_id!)
    await delay(150)

    if (!cap) {
      console.log(`  ⚠ ${bar.nome} — CAP non trovato`)
      skip++
      continue
    }

    const { error: upErr } = await supabase
      .from('bars')
      .update({ cap })
      .eq('id', bar.id)

    if (upErr) {
      console.error(`  ✗ ${bar.nome}: ${upErr.message}`)
      err++
    } else {
      console.log(`  ✓ ${bar.nome} — ${cap}`)
      ok++
    }

    // Ogni 50 bar stampa avanzamento
    if ((i + 1) % 50 === 0) {
      console.log(`\n[${i + 1}/${bars!.length}] ✓${ok} ⚠${skip} ✗${err}\n`)
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Completato: ${ok} aggiornati, ${skip} senza CAP, ${err} errori`)
}

main().catch((e) => { console.error(e); process.exit(1) })
