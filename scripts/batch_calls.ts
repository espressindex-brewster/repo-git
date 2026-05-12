import { createClient } from '@supabase/supabase-js'

const RETELL_API_KEY  = process.env.RETELL_API_KEY!
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID!
const FROM_NUMBER     = process.env.TWILIO_PHONE_NUMBER!
const MAX_TENTATIVI   = 2

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

async function selezionaBarPerCitta(citta: string, max: number): Promise<{ id: string; nome: string; telefono: string; citta: string }[]> {
  // Prende bar con telefono che hanno ricevuto meno di MAX_TENTATIVI chiamate
  const { data: tutti } = await supabase
    .from('bars')
    .select('id, nome, telefono, citta')
    .ilike('citta', citta)
    .not('telefono', 'is', null)
    .not('telefono', 'ilike', '800%')
    .not('telefono', 'ilike', '840%')
    .not('telefono', 'ilike', '199%')
    .not('telefono', 'ilike', '892%')
    .not('telefono', 'ilike', '899%')
    .limit(max * 4) // margine: molti avranno già raggiunto MAX_TENTATIVI

  if (!tutti || tutti.length === 0) return []

  // Conta chiamate già fatte per ciascun bar
  const ids = tutti.map((b) => b.id)
  const { data: chiamate } = await supabase
    .from('calls')
    .select('bar_id')
    .in('bar_id', ids)

  const contatoreChiamate: Record<string, number> = {}
  for (const c of chiamate ?? []) {
    contatoreChiamate[c.bar_id] = (contatoreChiamate[c.bar_id] ?? 0) + 1
  }

  return tutti
    .filter((b) => (contatoreChiamate[b.id] ?? 0) < MAX_TENTATIVI)
    .slice(0, max) as { id: string; nome: string; telefono: string; citta: string }[]
}

async function main() {
  const force = process.argv.includes('--force')
  if (!force && !orarioConsentito()) {
    const ora = new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' })
    console.error(`Fuori orario (${ora} IT). Chiama tra 08:00–11:30 o 15:00–17:30. Usa --force per ignorare.`)
    process.exit(1)
  }

  const barIds = process.argv.find(a => a.startsWith('--ids='))?.split('=')[1]?.split(',') ?? []
  const cittaArg = process.argv.find(a => a.startsWith('--citta='))?.split('=').slice(1).join('=')
  const maxArg = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] ?? '50', 10)

  if (barIds.length === 0 && !cittaArg) {
    console.error('Uso:')
    console.error('  npm run batch:calls -- --ids=uuid1,uuid2,...')
    console.error('  npm run batch:calls -- --citta=Milano [--max=50]')
    process.exit(1)
  }

  let bars: { id: string; nome: string; telefono: string; citta: string }[]

  if (cittaArg) {
    bars = await selezionaBarPerCitta(cittaArg, maxArg)
    if (bars.length === 0) {
      console.error(`Nessun bar da chiamare a "${cittaArg}" (tutti hanno già ${MAX_TENTATIVI} tentativi o non hanno telefono).`)
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

  const label = cittaArg ? `${cittaArg} (auto-select, max ${maxArg})` : `${bars.length} bar da --ids`
  console.log(`\nBatch chiamate — ${bars.length} bar — ${label}\n${'─'.repeat(50)}`)

  let avviate = 0, saltate = 0, errori = 0

  for (const bar of bars) {
    const esito = await chiamaBar(bar)
    if (esito === 'avviata') avviate++
    else if (esito === 'saltata') saltate++
    else errori++
    if (esito === 'avviata') await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Avviate: ${avviate} | Saltate: ${saltate} | Errori: ${errori}`)
}

main().catch(err => { console.error(err); process.exit(1) })
