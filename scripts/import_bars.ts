import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ── Args ─────────────────────────────────────────────────
// Accetta --cap=20121 (singolo) o --cap=20121-20162 (range)
const capArg = process.argv.find((a) => a.startsWith('--cap='))?.split('=')[1]
if (!capArg) {
  console.error('Uso: npm run import:bars -- --cap=20121')
  console.error('     npm run import:bars -- --cap=20121-20162')
  process.exit(1)
}

function parseCaps(arg: string): string[] {
  if (arg.includes('-') && arg.split('-').length === 2) {
    const [from, to] = arg.split('-').map(Number)
    if (isNaN(from) || isNaN(to) || from > to) {
      console.error(`Range non valido: ${arg}`)
      process.exit(1)
    }
    return Array.from({ length: to - from + 1 }, (_, i) =>
      String(from + i).padStart(5, '0'),
    )
  }
  return [arg]
}

const caps = parseCaps(capArg)

// ── Google Maps types ─────────────────────────────────────
interface PlaceResult {
  place_id: string
  name: string
  geometry: { location: { lat: number; lng: number } }
}

interface AddressComponent {
  long_name: string
  types: string[]
}

interface PlaceDetail {
  formatted_phone_number?: string
  address_components?: AddressComponent[]
}

// ── API helpers ───────────────────────────────────────────
async function textSearch(
  query: string,
  pageToken?: string,
): Promise<{ results: PlaceResult[]; next_page_token?: string }> {
  const params = new URLSearchParams({
    query,
    type: 'cafe',
    language: 'it',
    key: GOOGLE_KEY,
  })
  if (pageToken) params.set('pagetoken', pageToken)

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`,
  )
  return res.json() as Promise<{ results: PlaceResult[]; next_page_token?: string }>
}

async function getDetails(placeId: string): Promise<PlaceDetail> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_phone_number,address_components,postal_code',
    language: 'it',
    key: GOOGLE_KEY,
  })
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
  )
  const data = (await res.json()) as { result: PlaceDetail }
  return data.result ?? {}
}

function extractCityRegionCap(components: AddressComponent[] = []): {
  citta: string
  regione: string
  cap: string | null
} {
  let citta = ''
  let regione = ''
  let cap: string | null = null
  for (const c of components) {
    if (c.types.includes('locality')) citta = c.long_name
    if (c.types.includes('administrative_area_level_1')) regione = c.long_name
    if (c.types.includes('postal_code')) cap = c.long_name
  }
  return { citta, regione, cap }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── Import singolo CAP ────────────────────────────────────
async function importCap(cap: string): Promise<{ imported: number; skipped: number; errors: number }> {
  let pageToken: string | undefined
  let page = 0
  let imported = 0
  let skipped = 0
  let errors = 0

  do {
    page++
    const data = await textSearch(`bar caffè ${cap} Italia`, pageToken)
    pageToken = data.next_page_token

    for (const place of data.results ?? []) {
      const detail = await getDetails(place.place_id)
      await delay(200)

      const { citta, regione, cap } = extractCityRegionCap(detail.address_components)

      if (!citta || !regione) {
        console.warn(`    ⚠ skip ${place.name} — city/region non rilevabili`)
        skipped++
        continue
      }

      const telefono = detail.formatted_phone_number ?? null
      const telefonoValido = telefono && !/^(800|840|199|892|899)/.test(telefono.replace(/[\s\-().]/g, ''))
        ? telefono : null

      const { error } = await supabase.from('bars').upsert(
        {
          nome: place.name,
          citta,
          regione,
          cap,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          telefono: telefonoValido,
          google_place_id: place.place_id,
        },
        { onConflict: 'google_place_id' },
      )

      if (error) {
        console.error(`    ✗ ${place.name}: ${error.message}`)
        errors++
      } else {
        console.log(`    ✓ ${place.name} — ${citta}`)
        imported++
      }
    }

    if (pageToken) await delay(2000)
  } while (pageToken && page < 3) // max 60 risultati per CAP

  return { imported, skipped, errors }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log(`\nImport bar — ${caps.length} CAP (${caps[0]}–${caps[caps.length - 1]})`)
  console.log('─'.repeat(50))

  let totImported = 0
  let totSkipped = 0
  let totErrors = 0

  for (let i = 0; i < caps.length; i++) {
    const cap = caps[i]
    console.log(`\n[${i + 1}/${caps.length}] CAP ${cap}`)

    const { imported, skipped, errors } = await importCap(cap)
    totImported += imported
    totSkipped += skipped
    totErrors += errors

    console.log(`  → ${imported} importati, ${skipped} saltati, ${errors} errori`)

    // Pausa tra CAP per non saturare la quota Google
    if (i < caps.length - 1) await delay(1000)
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`Totale: ${totImported} importati, ${totSkipped} saltati, ${totErrors} errori`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
