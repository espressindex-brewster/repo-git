import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Nearby Search: raggio 500m, griglia 3×3 attorno al centroide del CAP
const RADIUS = 500
// ~450m in latitudine a 45°N, ~350m in longitudine
const D_LAT = 0.004
const D_LNG = 0.005

// ── Args ─────────────────────────────────────────────────
const capArg = process.argv.find((a) => a.startsWith('--cap='))?.split('=')[1]
if (!capArg) {
  console.error('Uso: npx tsx scripts/import_nearby.ts --cap=20121')
  console.error('     npx tsx scripts/import_nearby.ts --cap=20121-20162')
  process.exit(1)
}

function parseCaps(arg: string): string[] {
  if (arg.includes('-') && arg.split('-').length === 2) {
    const [from, to] = arg.split('-').map(Number)
    return Array.from({ length: to - from + 1 }, (_, i) =>
      String(from + i).padStart(5, '0'),
    )
  }
  return [arg]
}

const caps = parseCaps(capArg)

// ── Google Maps types ─────────────────────────────────────
interface NearbyResult {
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
async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url)
    } catch (err) {
      if (i === attempts - 1) throw err
      await delay(2000 * (i + 1))
    }
  }
  throw new Error('unreachable')
}

async function nearbySearch(
  lat: number,
  lng: number,
  type: string,
  pageToken?: string,
): Promise<{ results: NearbyResult[]; next_page_token?: string }> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(RADIUS),
    type,
    language: 'it',
    key: GOOGLE_KEY,
  })
  if (pageToken) params.set('pagetoken', pageToken)
  const res = await fetchWithRetry(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
  )
  return res.json() as Promise<{ results: NearbyResult[]; next_page_token?: string }>
}

async function getDetails(placeId: string): Promise<PlaceDetail> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_phone_number,address_components',
    language: 'it',
    key: GOOGLE_KEY,
  })
  const res = await fetchWithRetry(
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

function gridPoints(lat: number, lng: number) {
  return [
    { lat,           lng           },
    { lat: lat+D_LAT, lng          },
    { lat: lat-D_LAT, lng          },
    { lat,           lng: lng+D_LNG },
    { lat,           lng: lng-D_LNG },
    { lat: lat+D_LAT, lng: lng+D_LNG },
    { lat: lat+D_LAT, lng: lng-D_LNG },
    { lat: lat-D_LAT, lng: lng+D_LNG },
    { lat: lat-D_LAT, lng: lng-D_LNG },
  ]
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── Import singolo CAP ────────────────────────────────────
async function importCapNearby(cap: string): Promise<{ imported: number; skipped: number; errors: number }> {
  // Centroide dai bar già in DB per questo CAP
  const { data: existing } = await supabase
    .from('bars')
    .select('lat, lng')
    .eq('cap', cap)

  let centroidLat: number
  let centroidLng: number

  if (existing && existing.length > 0) {
    centroidLat = existing.reduce((s, b) => s + b.lat, 0) / existing.length
    centroidLng = existing.reduce((s, b) => s + b.lng, 0) / existing.length
  } else {
    // Fallback: centro di Milano
    centroidLat = 45.4654
    centroidLng = 9.1866
  }

  // Place ID già presenti per evitare chiamate details inutili
  const { data: existingIds } = await supabase.from('bars').select('google_place_id')
  const knownIds = new Set((existingIds ?? []).map((b) => b.google_place_id).filter(Boolean))

  const points = gridPoints(centroidLat, centroidLng)
  const types = ['cafe', 'bar']

  let imported = 0
  let skipped = 0
  let errors = 0
  const seenInRun = new Set<string>()

  for (const type of types) {
    for (const pt of points) {
      let pageToken: string | undefined
      let page = 0

      do {
        page++
        const data = await nearbySearch(pt.lat, pt.lng, type, pageToken)
        pageToken = data.next_page_token

        for (const place of data.results ?? []) {
          if (seenInRun.has(place.place_id)) continue
          seenInRun.add(place.place_id)

          if (knownIds.has(place.place_id)) {
            skipped++
            continue
          }

          await delay(150)
          const detail = await getDetails(place.place_id)
          const { citta, regione, cap: capResult } = extractCityRegionCap(detail.address_components)

          if (!citta || !regione) {
            skipped++
            continue
          }

          const telefono = detail.formatted_phone_number ?? null
          const telefonoValido =
            telefono && !/^(800|840|199|892|899)/.test(telefono.replace(/[\s\-().]/g, ''))
              ? telefono
              : null

          const { error } = await supabase.from('bars').upsert(
            {
              nome: place.name,
              citta,
              regione,
              cap: capResult,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              telefono: telefonoValido,
              google_place_id: place.place_id,
            },
            { onConflict: 'google_place_id' },
          )

          if (error) {
            errors++
          } else {
            knownIds.add(place.place_id)
            imported++
            console.log(`    ✓ ${place.name} — ${citta} (${capResult ?? '?'})`)
          }
        }

        if (pageToken) await delay(2000)
      } while (pageToken && page < 3)

      await delay(300)
    }
  }

  return { imported, skipped, errors }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log(`\nImport nearby — ${caps.length} CAP (${caps[0]}–${caps[caps.length - 1]})`)
  console.log('─'.repeat(50))

  let totImported = 0
  let totSkipped = 0
  let totErrors = 0

  for (let i = 0; i < caps.length; i++) {
    const cap = caps[i]
    process.stdout.write(`[${i + 1}/${caps.length}] CAP ${cap} ... `)

    const { imported, skipped, errors } = await importCapNearby(cap)
    totImported += imported
    totSkipped += skipped
    totErrors += errors

    console.log(`+${imported} nuovi, ${skipped} già presenti, ${errors} errori`)

    if (i < caps.length - 1) await delay(500)
  }

  console.log('\n' + '─'.repeat(50))
  console.log(`Totale: ${totImported} importati, ${totSkipped} saltati, ${totErrors} errori`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
