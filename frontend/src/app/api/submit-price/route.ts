import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function parsePrezzo(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? null : n
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

  const supabase = await createServiceClient()

  const { error } = await supabase.from('submissions').insert({
    bar_id:    bar_id ?? null,
    bar_nome:  bar_nome.trim(),
    espresso:  esp,
    cappuccino: capp,
    fonte:     fonte === 'gestore' ? 'gestore' : 'cliente',
    ip,
  })

  if (error) {
    console.error('submit-price insert:', error.message)
    return NextResponse.json({ error: 'errore interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
