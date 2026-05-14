import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function parsePrezzo(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? null : n
}

async function sendNotifica(barNome: string, esp: number | null, capp: number | null, fonte: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  const prezzi = [
    esp  != null ? `Espresso: €${esp.toFixed(2)}` : null,
    capp != null ? `Cappuccino: €${capp.toFixed(2)}` : null,
  ].filter(Boolean).join(' · ')

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'Espressindex <noreply@espressindex.com>',
      to:      ['espressindex@gmail.com'],
      subject: `Nuova segnalazione — ${barNome}`,
      html: `
        <p><strong>Bar:</strong> ${barNome}</p>
        <p><strong>Prezzi:</strong> ${prezzi}</p>
        <p><strong>Fonte:</strong> ${fonte}</p>
        <p><a href="https://supabase.com/dashboard/project/wbgwjwbqmnwgiiijajvf/editor" style="color:#6b4226">
          Approva in Supabase →
        </a></p>
      `,
    }),
  }).catch((err) => console.error('resend error:', err))
}

const ESP_MIN = 0.80
const ESP_MAX = 2.00
const CAPP_MIN = 0.80
const CAPP_MAX = 4.00

function inRange(esp: number | null, capp: number | null): boolean {
  if (esp != null && (esp < ESP_MIN || esp > ESP_MAX)) return false
  if (capp != null && (capp < CAPP_MIN || capp > CAPP_MAX)) return false
  return true
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'payload non valido' }, { status: 400 })

  const { bar_id, bar_nome, espresso, cappuccino, fonte } = body

  if (!bar_nome || typeof bar_nome !== 'string' || bar_nome.trim().length < 2) {
    return NextResponse.json({ error: 'nome bar mancante' }, { status: 400 })
  }

  const esp = parsePrezzo(espresso)
  const capp = parsePrezzo(cappuccino)

  if (esp == null && capp == null) {
    return NextResponse.json({ error: 'inserisci almeno un prezzo' }, { status: 400 })
  }
  if (esp != null && (esp < 0.5 || esp > 5)) {
    return NextResponse.json({ error: 'prezzo espresso non valido' }, { status: 400 })
  }
  if (capp != null && (capp < 0.5 || capp > 8)) {
    return NextResponse.json({ error: 'prezzo cappuccino non valido' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? null
  const fonteVal = fonte === 'gestore' ? 'gestore' : 'cliente'
  const autoApprove = inRange(esp, capp)

  const supabase = await createServiceClient()

  const { data: sub, error: subError } = await supabase
    .from('submissions')
    .insert({
      bar_id:     bar_id ?? null,
      bar_nome:   bar_nome.trim(),
      espresso:   esp,
      cappuccino: capp,
      fonte:      fonteVal,
      stato:      autoApprove ? 'approvato' : 'pending',
      ip,
    })
    .select('id')
    .single()

  if (subError) {
    console.error('submit-price insert:', subError.message)
    return NextResponse.json({ error: 'errore interno' }, { status: 500 })
  }

  if (autoApprove && bar_id) {
    const { error: priceError } = await supabase.from('prices').insert({
      bar_id,
      call_id:             null,
      espresso_bancone:    esp,
      cappuccino_bancone:  capp,
      outlier:             false,
    })
    if (priceError) {
      console.error('submit-price prices insert:', priceError.message)
    }
  }

  if (!autoApprove) {
    await sendNotifica(bar_nome.trim(), esp, capp, fonteVal)
  }

  return NextResponse.json({ ok: true })
}
