import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
type Disponibilita = Database['public']['Enums']['disponibilita']

// ── Tipi Retell ───────────────────────────────────────────
interface GiuliaOutput {
  disponibilita: Disponibilita
  espresso_bancone: string | number | null
  cappuccino_bancone: string | number | null
  outlier: boolean
  note: string | null
}

interface RetellCall {
  call_id: string
  start_timestamp: number // ms
  end_timestamp: number   // ms
  metadata?: {
    bar_id?: string
    bar_nome?: string
    citta?: string
  }
  call_analysis?: {
    custom_analysis_data?: GiuliaOutput
  }
}

interface RetellPayload {
  event: 'call_started' | 'call_ended' | 'call_analyzed'
  call: RetellCall
}

// ── Helpers ───────────────────────────────────────────────
function verificaFirma(body: string, signatureHeader: string): boolean {
  const key = process.env.RETELL_API_KEY!
  const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')))
  const timestamp = parts['v']
  const digest    = parts['d']
  if (!timestamp || !digest) return false
  const expected = createHmac('sha256', key).update(body + timestamp).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(expected))
  } catch {
    return false
  }
}

function parsePrezzo(v: string | number | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? null : n
}

// ── Handler ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const firma = req.headers.get('x-retell-signature') ?? ''

  if (!verificaFirma(rawBody, firma)) {
    const key = process.env.RETELL_API_KEY!
    const parts = Object.fromEntries(firma.split(',').map((p) => p.split('=')))
    const ts = parts['v'], dg = parts['d']
    const expHex = createHmac('sha256', key).update(rawBody + (ts ?? '')).digest('hex')
    console.error('FIRMA FAIL | header:', firma, '| ts:', ts, '| dg:', dg, '| exp:', expHex)
    return NextResponse.json({ error: 'firma non valida' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody) as RetellPayload

  // call_ended: salva la chiamata senza prezzi (analisi non ancora pronta)
  if (payload.event === 'call_ended') {
    const { call } = payload
    const barId = call.metadata?.bar_id
    if (!barId) return NextResponse.json({ ok: true })

    const supabase = await createServiceClient()
    const durataSec = Math.round((call.end_timestamp - call.start_timestamp) / 1000)

    const { error } = await supabase.from('calls').insert({
      bar_id:        barId,
      chiamata_at:   new Date(call.start_timestamp).toISOString(),
      durata_sec:    durataSec,
      disponibilita: 'non_risponde',
      note:          null,
    })

    if (error) console.error('retell-webhook call_ended insert:', error.message)
    return NextResponse.json({ ok: true })
  }

  // call_analyzed: aggiorna la chiamata con i dati estratti e inserisce i prezzi
  if (payload.event === 'call_analyzed') {
    const { call } = payload
    const barId = call.metadata?.bar_id
    if (!barId) return NextResponse.json({ ok: true })

    const analisi = call.call_analysis?.custom_analysis_data
    const supabase = await createServiceClient()
    const chiamataAt = new Date(call.start_timestamp).toISOString()

    // Aggiorna la chiamata salvata da call_ended
    const { data: callRecord } = await supabase
      .from('calls')
      .update({
        disponibilita: analisi?.disponibilita ?? 'non_risponde',
        note:          analisi?.note ?? null,
      })
      .eq('bar_id', barId)
      .eq('chiamata_at', chiamataAt)
      .select('id')
      .single()

    if (!callRecord) {
      console.error('retell-webhook call_analyzed: nessun record calls trovato per', call.call_id)
      return NextResponse.json({ ok: true })
    }

    const disponibilitaConPrezzo: Disponibilita[] = ['completa', 'parziale']
    const espresso = parsePrezzo(analisi?.espresso_bancone)
    const cappuccino = parsePrezzo(analisi?.cappuccino_bancone)

    if (analisi && disponibilitaConPrezzo.includes(analisi.disponibilita) && (espresso != null || cappuccino != null)) {
      const { error: priceErr } = await supabase.from('prices').insert({
        call_id:            callRecord.id,
        bar_id:             barId,
        espresso_bancone:   espresso,
        cappuccino_bancone: cappuccino,
        outlier:            analisi.outlier ?? false,
      })
      if (priceErr) console.error('retell-webhook prices insert:', priceErr.message)
    }

    console.log(`retell-webhook: ${call.call_id} → ${analisi?.disponibilita ?? 'non_risponde'} | espresso ${espresso} | cappuccino ${cappuccino}`)
    return NextResponse.json({ ok: true, call_id: call.call_id })
  }

  return NextResponse.json({ ok: true })
}
