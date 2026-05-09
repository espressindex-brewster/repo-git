import { createClient } from '@supabase/supabase-js'

// ── Config ────────────────────────────────────────────────
const RETELL_API_KEY   = process.env.RETELL_API_KEY!
const RETELL_AGENT_ID  = process.env.RETELL_AGENT_ID!
const FROM_NUMBER      = process.env.TWILIO_PHONE_NUMBER!

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const MAX_TENTATIVI = 2

function toE164IT(raw: string): string {
  let n = raw.replace(/[\s\-().]/g, '')
  if (n.startsWith('+')) return n
  if (n.startsWith('00')) return '+' + n.slice(2)
  return '+39' + n
}

// ── Orari consentiti (ora italiana) ───────────────────────
const FASCE_ORARIE = [
  { start: 8 * 60,      end: 12 * 60 }, // 08:00–12:00
  { start: 15 * 60,     end: 17 * 60 + 30 }, // 15:00–17:30
]

function orarioConsentito(): boolean {
  const ora = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date())

  const h = Number(ora.find((p) => p.type === 'hour')?.value ?? 0)
  const m = Number(ora.find((p) => p.type === 'minute')?.value ?? 0)
  const tot = h * 60 + m

  return FASCE_ORARIE.some(({ start, end }) => tot >= start && tot <= end)
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  const barId = process.argv.find((a) => a.startsWith('--bar_id='))?.split('=')[1]
  if (!barId) {
    console.error('Uso: npm run call:test -- --bar_id=<uuid>')
    process.exit(1)
  }

  // Controllo orario
  const force = process.argv.includes('--force')
  if (!force && !orarioConsentito()) {
    const ora = new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome' })
    console.error(`Fuori orario (${ora} IT). Chiama tra 08:00–12:00 o 15:00–17:30. Usa --force per ignorare.`)
    process.exit(1)
  }

  // Fetch bar
  const { data: bar, error: barErr } = await supabase
    .from('bars')
    .select('id, nome, telefono, citta')
    .eq('id', barId)
    .single()

  if (barErr || !bar) {
    console.error('Bar non trovato:', barErr?.message)
    process.exit(1)
  }

  if (!bar.telefono) {
    console.error(`"${bar.nome}" non ha numero di telefono.`)
    process.exit(1)
  }

  // Controllo tentativi precedenti
  const { count } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('bar_id', barId)

  if ((count ?? 0) >= MAX_TENTATIVI) {
    console.error(`"${bar.nome}" ha già ${count} tentativi (max ${MAX_TENTATIVI}).`)
    process.exit(1)
  }

  const toNumber = toE164IT(bar.telefono)
  console.log(`\nChiamata a: ${bar.nome} — ${bar.citta}`)
  console.log(`Numero:     ${bar.telefono} → ${toNumber}`)
  console.log(`Tentativo:  ${(count ?? 0) + 1}/${MAX_TENTATIVI}\n`)

  // Avvia chiamata via Retell AI
  const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from_number: FROM_NUMBER,
      to_number:   toNumber,
      agent_id:    RETELL_AGENT_ID,
      metadata: {
        bar_id:   bar.id,
        bar_nome: bar.nome,
        citta:    bar.citta,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Errore Retell API:', err)
    process.exit(1)
  }

  const { call_id } = (await res.json()) as { call_id: string }
  console.log(`Chiamata avviata. call_id: ${call_id}`)
  console.log('Il risultato arriverà via webhook → /api/retell-webhook')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
