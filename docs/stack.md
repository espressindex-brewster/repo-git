# Stack tecnologico — Espressindex

Documento di riferimento per capire ogni tecnologia usata nel progetto: cosa fa, perché l'abbiamo scelta, come la usiamo.

---

## Architettura generale

```
Browser  ←→  Next.js (Vercel)  ←→  Supabase (PostgreSQL)
                                ←→  Retell AI (agent vocale)
                                ←→  Mapbox (mappa)
Scripts  →   Retell AI  →  Twilio  →  Bar italiani (telefonate)
```

---

## 1. Next.js 16 (`next`)

**Cos'è:** Framework React per applicazioni web con rendering server-side (SSR) e generazione statica (SSG).

**Perché:** Permette di leggere dati da Supabase sul server (senza esporre la service role key al browser) e di servire HTML già renderizzato — meglio per SEO e performance. Con il modello App Router, ogni componente è Server Component per default: fetcha dati, non scarica JavaScript inutile sul client.

**Come lo usiamo:**
- `src/app/page.tsx` è un **Server Component** asincrono: fetcha `bars` e `stats_zona` da Supabase e passa i dati come props ai componenti figli
- `src/app/api/retell-webhook/route.ts` è una **API Route**: riceve i POST di Retell al termine di ogni chiamata e salva i dati in Supabase
- I componenti interattivi (mappa, modal, cookie banner) usano `'use client'` per girare nel browser

---

## 2. React 19 (`react`, `react-dom`)

**Cos'è:** Libreria JavaScript per costruire interfacce utente a componenti.

**Perché:** È il layer UI di Next.js. Versione 19 introduce miglioramenti alle Server Actions e alla gestione del rendering asincrono.

**Come lo usiamo:** Ogni file `.tsx` è un componente React. I componenti server non hanno stato; quelli client usano `useState` e `useEffect` (es. `Footer`, `CookieBanner`, `PrezziMap`).

---

## 3. TypeScript (`typescript`)

**Cos'è:** Superset tipizzato di JavaScript. Il codice `.ts`/`.tsx` viene compilato in JS prima del deploy.

**Perché:** Previene errori a runtime (es. passare `null` dove ci si aspetta `string`). Fondamentale con Supabase i cui tipi generati riflettono esattamente lo schema del database.

**Come lo usiamo:** Tutto il codice è in TypeScript. I tipi del database vivono in `src/types/database.ts`, generati con `supabase gen types typescript`. Le interfacce dei componenti (es. `BarPin`, `CityRow`) sono dichiarate inline o nel file del componente.

---

## 4. Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

**Cos'è:** Backend-as-a-service basato su PostgreSQL. Fornisce database, autenticazione, storage e API REST/Realtime automatiche.

**Perché:** Ci serve un database PostgreSQL con Row Level Security (prezzi pubblici, chiamate solo backend), una API pronta senza scrivere un backend custom, e il supporto a materialized view per aggregare statistiche per città.

**Come lo usiamo:**
- `@supabase/supabase-js` — client base, usato negli script Node.js (import bar, test chiamate)
- `@supabase/ssr` — versione ottimizzata per Next.js App Router; gestisce i cookie di sessione in modo compatibile con Server Components e API Routes
- `src/lib/supabase/server.ts` — crea il client per Server Components (usa `SUPABASE_SERVICE_ROLE_KEY`, mai esposta al browser)
- `src/lib/supabase/client.ts` — crea il client per componenti browser (usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Tabelle principali:** `bars`, `calls`, `prices`, `stats_zona` (materialized view), `bar_sopra_media` (view).

---

## 5. Mapbox GL JS (`mapbox-gl`, `@types/mapbox-gl`)

**Cos'è:** Libreria JavaScript per mappe interattive vettoriali.

**Perché:** Permette heatmap, clustering dei marker, popup personalizzati e flyTo animato — tutto necessario per visualizzare centinaia di bar per città con colori per fascia di prezzo. Alternativa a Google Maps ma con stile più controllabile.

**Come lo usiamo:** In `src/components/map/PrezziMap.tsx` (componente `'use client'`):
- Il token viene da `NEXT_PUBLIC_MAPBOX_TOKEN` (pubblica, inizia con `pk.`)
- Stile base: `mapbox://styles/mapbox/light-v11`
- Layer aggiunti su `map.on('load')`: heatmap (zoom < 13), cluster circles, cluster count, marker individuali colorati
- Colori marker: verde `< €1.10`, giallo `€1.10–1.30`, arancione `€1.30–1.60`, rosso `> €1.60`
- Click su cluster → zoom in automatico; click su marker → popup con prezzi + link Google Maps

---

## 6. Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/postcss`)

**Cos'è:** Framework CSS utility-first. Le classi (`flex`, `text-xs`, `px-3`) vengono compilate in CSS solo se usate.

**Perché:** Usato principalmente per il layout della sidebar della mappa (flexbox, overflow, bordi) dove le classi utility sono più comode degli stili inline. Il resto del progetto usa stili inline con CSS variables.

**Come lo usiamo:** Importato in `globals.css` con `@import "tailwindcss"`. Usato in `PrezziMap.tsx` per la sidebar e la lista bar. Non sostituisce i CSS variables — convivono.

---

## 7. next/font/google (`Instrument Serif`, `DM Sans`)

**Cos'è:** Modulo built-in di Next.js per caricare font Google con zero layout shift e self-hosting automatico.

**Perché:** I font vengono scaricati a build time e serviti dallo stesso dominio Vercel — nessuna richiesta a Google al runtime, zero privacy issues, performance migliori.

**Come lo usiamo:** In `layout.tsx`, i font vengono dichiarati come variabili CSS (`--font-serif`, `--font-sans`) e iniettati sull'elemento `<html>`. Tutti i componenti li usano via `fontFamily: 'var(--font-serif)'`.

- **Instrument Serif** — font graziato elegante, usato per titoli, valori metrici, logo
- **DM Sans** — font sans-serif pulito, usato per testo, bottoni, etichette

---

## 8. Retell AI (`RETELL_API_KEY`, `RETELL_AGENT_ID`)

**Cos'è:** Piattaforma di orchestrazione per agenti vocali AI. Gestisce il ciclo di vita della chiamata: connessione, trascrizione in tempo reale, invio al modello LLM, sintesi vocale, rilevazione fine turno.

**Perché:** Permette di definire un agente (Giulia) in un system prompt e lasciare che Retell gestisca tutta la complessità della telefonata: latenza, interruzioni, silence detection. Senza Retell dovremmo integrare manualmente Twilio + Whisper + LLM + TTS.

**Come lo usiamo:**
- `agent/caller.ts` chiama `POST https://api.retellai.com/v2/create-phone-call` con il numero del bar e i metadati
- Retell chiama il bar via Twilio, esegue la conversazione con Giulia, poi invia i risultati al nostro webhook
- `src/app/api/retell-webhook/route.ts` riceve `call_ended` (dati base) e `call_analyzed` (analisi + JSON con prezzi) e li salva in Supabase

---

## 9. Claude Sonnet (`ANTHROPIC_API_KEY`)

**Cos'è:** LLM di Anthropic, il "cervello" dell'agente vocale Giulia.

**Perché:** Integrato in Retell come modello LLM. Gestisce la comprensione del parlato (trascritto da Retell), la generazione delle risposte di Giulia e l'estrazione strutturata dei prezzi in JSON alla fine della chiamata.

**Come lo usiamo:** Configurato nella dashboard Retell come provider LLM. Il system prompt completo è in `agent/system_prompt.md` — definisce persona, flusso, casi edge e formato JSON di output.

---

## 10. ElevenLabs (`ELEVENLABS_API_KEY`)

**Cos'è:** Servizio di Text-to-Speech (TTS) con voci realistiche.

**Perché:** La voce di Giulia deve sembrare umana e italiana per non far capire al barista che sta parlando con un AI — altrimenti rifiuterebbe di rispondere. ElevenLabs ha le voci italiane femminili più naturali disponibili.

**Come lo usiamo:** Configurato in Retell come provider TTS. Parametri: voce italiana femminile, style 0.65, velocità 1.0x, pausa risposta 350–500ms (simula il tempo di riflessione umano).

---

## 11. Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)

**Cos'è:** Piattaforma di comunicazione cloud. Fornisce numeri di telefono programmabili e infrastruttura VoIP.

**Perché:** Retell usa Twilio sotto il cappello per effettuare le chiamate telefoniche reali verso i bar italiani. Twilio gestisce la connessione PSTN (rete telefonica tradizionale).

**Come lo usiamo:** Le credenziali Twilio sono configurate in Retell dashboard. Il numero `TWILIO_PHONE_NUMBER` è il caller ID che appare sul telefono del bar. Nota: per chiamare numeri italiani è preferibile un numero +39.

---

## 12. Google Maps API (`GOOGLE_MAPS_API_KEY`)

**Cos'è:** API di Google per dati geografici, luoghi e geocoding.

**Perché:** Fonte dei dati anagrafici dei bar: nome, indirizzo, numero di telefono, coordinate GPS, `place_id` (usato come chiave di deduplicazione).

**Come lo usiamo:** In `scripts/import_bars.ts` con l'endpoint `Nearby Search` + `Place Details`. Dato un CAP, cerca bar nelle vicinanze, estrae i dati e fa upsert nella tabella `bars` di Supabase.

---

## 13. Vercel

**Cos'è:** Piattaforma di deploy per applicazioni Next.js (e non solo). Gestisce CDN, SSL, serverless functions, preview deployments.

**Perché:** Deploy automatico da GitHub push, edge network globale, zero configurazione per Next.js (riconosce il framework e ottimizza il build autonomamente).

**Come lo usiamo:** Il progetto `frontend/` è collegato a Vercel. Ogni push su `main` triggera un nuovo build. Le variabili d'ambiente sono configurate nella dashboard Vercel. Il dominio `espressindex.com` è puntato al deployment production.

---

## 14. tsx

**Cos'è:** Runtime TypeScript per Node.js. Permette di eseguire file `.ts` direttamente senza compilare prima.

**Perché:** Gli script (`import_bars.ts`, `caller.ts`) devono girare in Node.js ma sono scritti in TypeScript. `tsx` elimina il passaggio di compilazione intermedio.

**Come lo usiamo:** `node --import tsx/esm scripts/import_bars.ts` — il flag `--import` fa caricare `tsx` prima dell'esecuzione, che intercetta i file `.ts` e li transpila on-the-fly.

---

## 15. ESLint (`eslint`, `eslint-config-next`)

**Cos'è:** Linter JavaScript/TypeScript. Analizza il codice staticamente per trovare errori e pattern problematici.

**Perché:** `eslint-config-next` include regole specifiche per Next.js (es. uso corretto di `Image`, `Link`, regole di accessibilità base).

**Come lo usiamo:** `npm run lint` nel frontend. Gira anche automaticamente nel build Vercel.

---

## Variabili d'ambiente — riepilogo

| Variabile | Scope | Usata da |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend | Retell (LLM provider) |
| `RETELL_API_KEY` | Backend | `caller.ts` |
| `RETELL_AGENT_ID` | Backend | `caller.ts` |
| `ELEVENLABS_API_KEY` | Backend | Retell (TTS provider) |
| `TWILIO_ACCOUNT_SID` | Backend | Retell |
| `TWILIO_AUTH_TOKEN` | Backend | Retell |
| `TWILIO_PHONE_NUMBER` | Backend | Retell |
| `SUPABASE_URL` | Backend | Script Node.js |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Server Components, API Routes |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend (pubblica) | Client browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend (pubblica) | Client browser |
| `GOOGLE_MAPS_API_KEY` | Backend | `import_bars.ts` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Frontend (pubblica) | `PrezziMap.tsx` |

Le variabili `NEXT_PUBLIC_*` sono incorporate nel bundle JavaScript e visibili nel browser — mai metterci segreti. Le altre rimangono server-side.
