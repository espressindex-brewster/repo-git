-- ============================================================
-- 001_init.sql — Schema iniziale Espressindex
-- ============================================================

-- Enum disponibilita chiamata
CREATE TYPE disponibilita AS ENUM (
  'completa',
  'parziale',
  'rifiuto',
  'non_risponde',
  'richiamare'
);

-- ------------------------------------------------------------
-- bars — anagrafica bar
-- ------------------------------------------------------------
CREATE TABLE bars (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT        NOT NULL,
  citta            TEXT        NOT NULL,
  regione          TEXT        NOT NULL,
  lat              NUMERIC(9,6) NOT NULL,
  lng              NUMERIC(9,6) NOT NULL,
  telefono         TEXT,
  google_place_id  TEXT        UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bars_citta_idx ON bars (citta);
CREATE INDEX bars_regione_idx ON bars (regione);

-- ------------------------------------------------------------
-- calls — log ogni chiamata effettuata da Giulia
-- ------------------------------------------------------------
CREATE TABLE calls (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id         UUID         NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  chiamata_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  durata_sec     INTEGER      CHECK (durata_sec BETWEEN 0 AND 180),
  disponibilita  disponibilita NOT NULL,
  note           TEXT
);

CREATE INDEX calls_bar_id_idx      ON calls (bar_id);
CREATE INDEX calls_chiamata_at_idx ON calls (chiamata_at DESC);

-- ------------------------------------------------------------
-- prices — prezzi rilevati da ogni chiamata
-- numeric(4,2): max 99.99 € — mai float per i soldi
-- NULL = non rilevato, mai 0
-- ------------------------------------------------------------
CREATE TABLE prices (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id             UUID        NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  bar_id              UUID        NOT NULL REFERENCES bars(id)  ON DELETE CASCADE,
  espresso_bancone    NUMERIC(4,2) CHECK (espresso_bancone > 0),
  cappuccino_bancone  NUMERIC(4,2) CHECK (cappuccino_bancone > 0),
  outlier             BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX prices_bar_id_idx  ON prices (bar_id);
CREATE INDEX prices_call_id_idx ON prices (call_id);
CREATE INDEX prices_outlier_idx ON prices (bar_id) WHERE outlier = TRUE;

-- ------------------------------------------------------------
-- stats_zona — materialized view aggregata per città
-- Aggiornata ogni notte; esclusi outlier dai calcoli
-- REFRESH MATERIALIZED VIEW CONCURRENTLY stats_zona
-- ------------------------------------------------------------
CREATE MATERIALIZED VIEW stats_zona AS
SELECT
  b.citta,
  b.regione,
  ROUND(AVG(p.espresso_bancone)::numeric, 2)                                              AS media_espresso,
  ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY p.espresso_bancone))::numeric, 2)   AS mediana_espresso,
  ROUND(AVG(p.cappuccino_bancone)::numeric, 2)                                            AS media_cappuccino,
  ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY p.cappuccino_bancone))::numeric, 2) AS mediana_cappuccino,
  COUNT(DISTINCT b.id)                                                                    AS n_bar,
  NOW()                                                                                   AS aggiornata_at
FROM bars b
LEFT JOIN prices p ON p.bar_id = b.id AND NOT p.outlier
GROUP BY b.citta, b.regione
WITH DATA;

-- Indice necessario per REFRESH CONCURRENTLY
CREATE UNIQUE INDEX stats_zona_citta_idx ON stats_zona (citta);

-- ------------------------------------------------------------
-- bar_sopra_media — view usata dalla mappa pubblica
-- Ultimo prezzo non-outlier per bar + flag confronto media città
-- ------------------------------------------------------------
CREATE VIEW bar_sopra_media AS
SELECT
  b.*,
  last_p.espresso_bancone   AS ultimo_espresso,
  last_p.cappuccino_bancone AS ultimo_cappuccino,
  (last_p.espresso_bancone > sz.media_espresso) AS sopra_media
FROM bars b
JOIN LATERAL (
  SELECT p.espresso_bancone, p.cappuccino_bancone
  FROM prices p
  JOIN calls c ON c.id = p.call_id
  WHERE p.bar_id = b.id
    AND NOT p.outlier
  ORDER BY c.chiamata_at DESC
  LIMIT 1
) last_p ON TRUE
LEFT JOIN stats_zona sz ON sz.citta = b.citta;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
ALTER TABLE bars   ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls  ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica: bars e prices visibili sulla mappa
CREATE POLICY "bars_public_read"   ON bars   FOR SELECT USING (TRUE);
CREATE POLICY "prices_public_read" ON prices FOR SELECT USING (TRUE);

-- calls: solo il service role (backend) — anon non può leggere
CREATE POLICY "calls_service_only" ON calls FOR SELECT USING (FALSE);

-- Scrittura: solo service role (bypassa RLS automaticamente)

-- ------------------------------------------------------------
-- pg_cron: refresh notturno stats_zona (abilitare in Supabase dashboard)
-- SELECT cron.schedule('refresh-stats-zona', '0 3 * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY stats_zona');
-- ------------------------------------------------------------
