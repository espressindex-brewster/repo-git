# Espressindex.com

Agente AI che chiama bar italiani, raccoglie il prezzo di espresso e cappuccino al bancone, e pubblica una mappa pubblica dei prezzi per zona. Meccanica: trasparenza dei dati → pressione sociale → i gestori abbassano i prezzi da soli.

## Stack

- **Agente vocale**: Retell AI (orchestrazione) + Claude Sonnet (cervello) + ElevenLabs (voce Giulia) + Twilio (numero IT)
- **Database**: Supabase (PostgreSQL + Storage per audio)
- **Frontend**: Next.js + Mapbox (mappa pubblica)
- **Deploy**: Vercel
- **Versioning**: GitHub

## Struttura cartelle

```
espressindex/
├── CLAUDE.md
├── .env.local               # chiavi API — mai committare
├── supabase/
│   └── migrations/          # SQL in ordine numerico: 001_, 002_...
├── agent/
│   ├── system_prompt.md     # prompt Giulia (già scritto)
│   └── caller.ts            # script che chiama VAPI
├── scripts/
│   └── import_bars.ts       # importa bar da Google Maps API
├── frontend/
│   └── (Next.js app)
└── docs/
    └── schema.sql           # schema Supabase di riferimento
```

## Comandi principali

```bash
npm run dev          # frontend Next.js in locale
npm run call:test    # chiamata di test a un singolo bar
npm run import:bars  # importa lista bar da Google Maps per CAP
npx supabase db push # applica migrazioni al progetto Supabase
```

## Variabili d'ambiente richieste

```
ANTHROPIC_API_KEY
RETELL_API_KEY
RETELL_AGENT_ID
ELEVENLABS_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER       # numero italiano +39...
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY # solo backend — mai esporre al frontend
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
```

## Schema database (tabelle principali)

- `bars` — anagrafica bar (id, nome, città, regione, lat, lng, telefono, google_place_id)
- `calls` — log ogni chiamata (bar_id, chiamata_at, durata_sec, disponibilità, note)
- `prices` — prezzi estratti (call_id, bar_id, espresso_bancone, cappuccino_bancone, outlier)
- `stats_zona` — materialized view aggregata per città (media, mediana, n_bar)

Enum `disponibilità`: `completa | parziale | rifiuto | non_risponde | richiamare`

Per dettagli completi: `docs/schema.sql`

## Regole

- Mai committare `.env.local` o qualsiasi file con chiavi API
- Le migrazioni Supabase vanno sempre in `supabase/migrations/` con prefisso numerico
- I prezzi vanno in `numeric(4,2)` — mai float per i soldi
- Usa `null` per prezzi non rilevati, mai 0
- Le chiamate escono solo negli orari 08:00–11:30 e 15:00–17:30 (Italia)
- Ogni chiamata: massimo 180 secondi, massimo 2 tentativi per numero
- Prima di modificare lo schema: crea una nuova migration, non editare quelle esistenti

## Persona agente

L'agente si chiama Giulia, voce femminile italiana ~30 anni, tono solare e diretto.
System prompt completo: `agent/system_prompt.md`
Parametri ElevenLabs: voce italiana femminile, style 0.65, velocità 1.0x, pausa risposta 350–500ms.

## Workflow tipico

1. `npm run import:bars -- --cap=20121` → popola tabella `bars`
2. `npm run call:test -- --bar_id=<uuid>` → verifica che la chiamata funzioni
3. Avvia batch chiamate via Retell AI dashboard o script
4. Controlla outlier in Supabase: `SELECT * FROM prices WHERE outlier = true`
5. `REFRESH MATERIALIZED VIEW CONCURRENTLY stats_zona` (automatico ogni notte via cron)
6. Frontend legge `stats_zona` e `bar_sopra_media` per la mappa pubblica

## Note GDPR

Le chiamate a esercizi commerciali sono lecite come legittimo interesse (art. 6.1.f GDPR).
Se si registra l'audio, Giulia deve comunicarlo all'inizio della chiamata.
In alternativa: non salvare audio, tenere solo il JSON di output → zero problemi.
