import { createClient } from '@supabase/supabase-js'

const RETELL_API_KEY  = process.env.RETELL_API_KEY!
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID!
const FROM_NUMBER     = process.env.TWILIO_PHONE_NUMBER!
const maxTentativiArg = parseInt(process.argv.find(a => a.startsWith('--max-tentativi='))?.split('=')[1] ?? '2', 10)
const MAX_TENTATIVI   = isNaN(maxTentativiArg) ? 2 : maxTentativiArg

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function toE164IT(raw: string): string {
  let n = raw.replace(/[\s\-().]/g, '')
  if (n.startsWith('+')) return n
  if (n.startsWith('00')) return '+' + n.slice(2)
  return '+39' + n
}

function orarioConsentito(): boolean {
  const ora = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(new Date())
  const h = Number(ora.find((p) => p.type === 'hour')?.value ?? 0)
  const m = Number(ora.find((p) => p.type === 'minute')?.value ?? 0)
  const tot = h * 60 + m
  return (tot >= 8*60 && tot <= 11*60+30) || (tot >= 15*60 && tot <= 17*60+30)
}

async function chiamaBar(bar: { id: string; nome: string; telefono: string; citta: string }): Promise<'avviata' | 'saltata' | 'errore'> {
  const { count } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('bar_id', bar.id)

  if ((count ?? 0) >= MAX_TENTATIVI) {
    console.log(`  ↷ ${bar.nome} — già ${count} tentativi, saltato`)
    return 'saltata'
  }

  const toNumber = toE164IT(bar.telefono)
  const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RETELL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from_number: FROM_NUMBER,
      to_number:   toNumber,
      agent_id:    RETELL_AGENT_ID,
      metadata:    { bar_id: bar.id, bar_nome: bar.nome, citta: bar.citta },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.log(`  ✗ ${bar.nome} (${toNumber}) — ${err}`)
    return 'errore'
  }

  const { call_id } = await res.json() as { call_id: string }
  console.log(`  ✓ ${bar.nome} (${toNumber}) — ${call_id}`)
  return 'avviata'
}

// Numeri fissi italiani: iniziano con 0 (es. 02, 06, 011)
// Cellulari italiani: iniziano con 3 (es. 328, 347) o +39 3xx
function isMobile(tel: string): boolean {
  const n = tel.replace(/[\s\-().]/g, '').replace(/^\+39/, '').replace(/^0039/, '')
  return n.startsWith('3')
}

async function selezionaDistribuito(max: number, soloFissi = false, prioritaCap: string[] = [], citta?: string): Promise<{ id: string; nome: string; telefono: string; citta: string }[]> {
  let query = supabase
    .from('bars')
    .select('id, nome, telefono, citta, cap')
    .not('telefono', 'is', null)
    .not('cap', 'is', null)
    .not('telefono', 'ilike', '800%')
    .not('telefono', 'ilike', '840%')
    .not('telefono', 'ilike', '199%')
    .not('telefono', 'ilike', '892%')
    .not('telefono', 'ilike', '899%')

  if (citta) query = query.ilike('citta', citta)
  // @ts-ignore — Supabase type inference troppo profonda con .not() multipli e colonna cap
  if (soloFissi) query = query.not('telefono', 'ilike', '3%').not('telefono', 'ilike', '+39 3%')

  type BarRow = { id: string; nome: string; telefono: string; citta: string; cap: string }
  const { data: tutti } = await (query as any).limit(10000) as { data: BarRow[] | null }
  if (!tutti || tutti.length === 0) return []

  const ids = tutti.map((b) => b.id)
  const { data: chiamate } = await supabase
    .from('calls')
    .select('bar_id')
    .in('bar_id', ids)
    .limit(50000)

  const contatoreChiamate: Record<string, number> = {}
  for (const c of chiamate ?? []) {
    contatoreChiamate[c.bar_id] = (contatoreChiamate[c.bar_id] ?? 0) + 1
  }

  // Somma chiamate per CAP (su tutti i bar, non solo disponibili)
  const chiamatePerCap: Record<string, number> = {}
  for (const b of tutti) {
    chiamatePerCap[b.cap] = (chiamatePerCap[b.cap] ?? 0) + (contatoreChiamate[b.id] ?? 0)
  }

  // Raggruppa per CAP i bar ancora disponibili
  const perCap: Record<string, BarRow[]> = {}
  for (const b of tutti) {
    if ((contatoreChiamate[b.id] ?? 0) >= MAX_TENTATIVI) continue
    if (!perCap[b.cap]) perCap[b.cap] = []
    perCap[b.cap].push(b)
  }

  const sortByCalls = (a: string, b: string) => (chiamatePerCap[a] ?? 0) - (chiamatePerCap[b] ?? 0)

  const prioritaSet = new Set(prioritaCap)
  const capsPrioritari = Object.keys(perCap).filter(c => prioritaSet.has(c)).sort(sortByCalls)
  const capsAltri     = Object.keys(perCap).filter(c => !prioritaSet.has(c)).sort(sortByCalls)
  const capsOrdinati  = [...capsPrioritari, ...capsAltri]

  const top5 = capsOrdinati.slice(0, 5).map(c => `${c}[${chiamatePerCap[c] ?? 0}]`).join(', ')
  console.log(`  CAP disponibili: ${capsOrdinati.length} (prioritari: ${capsPrioritari.length}, top 5: ${top5})`)

  const selezionati: { id: string; nome: string; telefono: string; citta: string }[] = []
  const pointers: Record<string, number> = {}

  function roundRobin(caps: string[], fino: number) {
    outer: while (true) {
      let aggiunto = false
      for (const cap of caps) {
        if (selezionati.length >= fino) break outer
        const ptr = pointers[cap] ?? 0
        if (ptr < perCap[cap].length) {
          const b = perCap[cap][ptr]
          selezionati.push({ id: b.id, nome: b.nome, telefono: b.telefono, citta: b.citta })
          pointers[cap] = ptr + 1
          aggiunto = true
        }
      }
      if (!aggiunto) break
    }
  }

  if (capsPrioritari.length > 0) {
    // Fase 1: 60% degli slot ai CAP prioritari
    const budgetPrioritari = Math.round(max * 0.6)
    roundRobin(capsPrioritari, budgetPrioritari)
    console.log(`  Fase 1 (prioritari): ${selezionati.length} bar da ${capsPrioritari.join(', ')}`)
  }

  // Fase 2: slot rimanenti su tutti i CAP (prioritari inclusi)
  roundRobin(capsOrdinati, max)
  console.log(`  Fase 2 (tutti): ${selezionati.length} bar totali`)

  return selezionati
}

async function selezionaBarPerCitta(citta: string, max: number, cap?: string, soloFissi = false): Promise<{ id: string; nome: string; telefono: string; citta: string }[]> {
  // Prende bar con telefono che hanno ricevuto meno di MAX_TENTATIVI chiamate
  let query = supabase
    .from('bars')
    .select('id, nome, telefono, citta')
    .ilike('citta', citta)
    .not('telefono', 'is', null)
    .not('telefono', 'ilike', '800%')
    .not('telefono', 'ilike', '840%')
    .not('telefono', 'ilike', '199%')
    .not('telefono', 'ilike', '892%')
    .not('telefono', 'ilike', '899%')

  if (cap) query = query.eq('cap', cap)
  // Fissi: esclude numeri che iniziano con 3 o +39 3
  if (soloFissi) query = query.not('telefono', 'ilike', '3%').not('telefono', 'ilike', '+39 3%')

  const { data: tutti } = await query
    .limit(max * 4) // margine: molti avranno già raggiunto MAX_TENTATIVI

  if (!tutti || tutti.length === 0) return []

  // Conta chiamate già fatte per ciascun bar
  const ids = tutti.map((b) => b.id)
  const { data: chiamate } = await supabase
    .from('calls')
    .select('bar_id')
    .in('bar_id', ids)
    .limit(50000)

  const contatoreChiamate: Record<string, number> = {}
  for (const c of chiamate ?? []) {
    contatoreChiamate[c.bar_id] = (contatoreChiamate[c.bar_id] ?? 0) + 1
  }

  return tutti
    .filter((b) => (contatoreChiamate[b.id] ?? 0) < MAX_TENTATIVI)
    .slice(0, max) as { id: string; nome: string; telefono: string; citta: string }[]
}

async function selezionaBarDaRichiamare(): Promise<{ id: string; nome: string; telefono: string; citta: string }[]> {
  // Prendi tutte le chiamate con disponibilita = 'richiamare'
  const { data: candidati } = await supabase
    .from('calls')
    .select('bar_id, chiamata_at')
    .eq('disponibilita', 'richiamare')
    .limit(50000)

  if (!candidati || candidati.length === 0) return []

  // Ultima chiamata 'richiamare' per bar_id
  const ultimaRichiamare: Record<string, string> = {}
  for (const c of candidati) {
    if (!ultimaRichiamare[c.bar_id] || c.chiamata_at > ultimaRichiamare[c.bar_id]) {
      ultimaRichiamare[c.bar_id] = c.chiamata_at
    }
  }

  const barIds = Object.keys(ultimaRichiamare)

  // Per ogni bar, verifica che non ci sia una chiamata più recente con altro esito
  const { data: tutteChiamate } = await supabase
    .from('calls')
    .select('bar_id, chiamata_at, disponibilita')
    .in('bar_id', barIds)
    .limit(50000)

  const ultimaChiamata: Record<string, { chiamata_at: string; disponibilita: string }> = {}
  for (const c of tutteChiamate ?? []) {
    const prev = ultimaChiamata[c.bar_id]
    if (!prev || c.chiamata_at > prev.chiamata_at) {
      ultimaChiamata[c.bar_id] = { chiamata_at: c.chiamata_at, disponibilita: c.disponibilita }
    }
  }

  const daRichiamare = barIds.filter(
    (id) => ultimaChiamata[id]?.disponibilita === 'richiamare',
  )

  if (daRichiamare.length === 0) return []

  const { data: bars } = await supabase
    .from('bars')
    .select('id, nome, telefono, citta')
    .in('id', daRichiamare)
    .not('telefono', 'is', null)

  return (bars ?? []) as { id: string; nome: string; telefono: string; citta: string }[]
}

async function main() {
  const force = process.argv.includes('--force')
  const soloFissi = process.argv.includes('--solo-fissi')
  if (!force && !orarioConsentito()) {
    const ora = new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' })
    console.error(`Fuori orario (${ora} IT). Chiama tra 08:00–11:30 o 15:00–17:30. Usa --force per ignorare.`)
    process.exit(1)
  }

  const barIds = process.argv.find(a => a.startsWith('--ids='))?.split('=')[1]?.split(',') ?? []
  const cittaArg = process.argv.find(a => a.startsWith('--citta='))?.split('=').slice(1).join('=')
  const capArg = process.argv.find(a => a.startsWith('--cap='))?.split('=')[1]
  const maxArg = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] ?? '50', 10)
  const distribuitoArg = process.argv.find(a => a.startsWith('--distribuito='))?.split('=')[1]
  const distribuitoMax = distribuitoArg ? parseInt(distribuitoArg, 10) : null
  const prioritaCapArg = process.argv.find(a => a.startsWith('--priorita-cap='))?.split('=')[1]
  const prioritaCap = prioritaCapArg ? prioritaCapArg.split(',').map(s => s.trim()) : []

  if (barIds.length === 0 && !cittaArg && !capArg && distribuitoMax === null) {
    console.error('Uso:')
    console.error('  npm run batch:calls -- --ids=uuid1,uuid2,...')
    console.error('  npm run batch:calls -- --citta=Milano [--max=50]')
    console.error('  npm run batch:calls -- --cap=20121 [--max=50] [--solo-fissi]')
    console.error('  npm run batch:calls -- --distribuito=100 [--citta=Milano] [--priorita-cap=20121,20122] [--solo-fissi]')
    process.exit(1)
  }

  let bars: { id: string; nome: string; telefono: string; citta: string }[]

  if (distribuitoMax !== null) {
    bars = await selezionaDistribuito(distribuitoMax, soloFissi, prioritaCap, cittaArg)
    if (bars.length === 0) {
      console.error(`Nessun bar disponibile per la distribuzione (tutti hanno già ${MAX_TENTATIVI} tentativi o manca il CAP).`)
      process.exit(0)
    }
  } else if (cittaArg || capArg) {
    bars = await selezionaBarPerCitta(cittaArg ?? 'Milano', maxArg, capArg, soloFissi)
    if (bars.length === 0) {
      const label = capArg ? `CAP ${capArg}` : `"${cittaArg}"`
      console.error(`Nessun bar da chiamare per ${label} (tutti hanno già ${MAX_TENTATIVI} tentativi o non hanno telefono).`)
      process.exit(0)
    }
  } else {
    const { data } = await supabase
      .from('bars')
      .select('id, nome, telefono, citta')
      .in('id', barIds)
      .not('telefono', 'is', null)
    bars = (data ?? []) as { id: string; nome: string; telefono: string; citta: string }[]
  }

  const fissiLabel = soloFissi ? ', solo fissi' : ''
  const label = distribuitoMax !== null
    ? `distribuito su CAP, max ${distribuitoMax}${fissiLabel}`
    : capArg ? `CAP ${capArg} (auto-select, max ${maxArg}${fissiLabel})` : cittaArg ? `${cittaArg} (auto-select, max ${maxArg}${fissiLabel})` : `${bars.length} bar da --ids`
  console.log(`\nBatch chiamate — ${bars.length} bar — ${label}\n${'─'.repeat(50)}`)

  let avviate = 0, saltate = 0, errori = 0

  for (const bar of bars) {
    const esito = await chiamaBar(bar)
    if (esito === 'avviata') avviate++
    else if (esito === 'saltata') saltate++
    else errori++
    if (esito === 'avviata') await new Promise(r => setTimeout(r, 3000))
  }

  const ora1 = new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' })
  console.log(`\n${'═'.repeat(50)}`)
  console.log(`RECAP CHIAMATE NUOVE  (${ora1})`)
  console.log(`  Processati : ${bars.length}`)
  console.log(`  Avviate    : ${avviate}`)
  console.log(`  Saltate    : ${saltate}`)
  console.log(`  Errori     : ${errori}`)
  console.log(`${'═'.repeat(50)}`)

  if (distribuitoMax !== null) {
    const daRichiamare = await selezionaBarDaRichiamare()
    if (daRichiamare.length > 0) {
      console.log(`\nRichiami — ${daRichiamare.length} bar\n${'─'.repeat(50)}`)
      let rAvviate = 0, rSaltate = 0, rErrori = 0
      for (const bar of daRichiamare) {
        const esito = await chiamaBar(bar)
        if (esito === 'avviata') rAvviate++
        else if (esito === 'saltata') rSaltate++
        else rErrori++
        if (esito === 'avviata') await new Promise(r => setTimeout(r, 3000))
      }
      const ora2 = new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' })
      console.log(`\n${'═'.repeat(50)}`)
      console.log(`RECAP RICHIAMI  (${ora2})`)
      console.log(`  Processati : ${daRichiamare.length}`)
      console.log(`  Avviate    : ${rAvviate}`)
      console.log(`  Saltate    : ${rSaltate}`)
      console.log(`  Errori     : ${rErrori}`)
      console.log(`${'═'.repeat(50)}`)
    } else {
      console.log('\nNessun bar da richiamare.')
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })
