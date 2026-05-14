-- Segnalazioni prezzi da web (gestori e clienti)
CREATE TABLE submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id      UUID        REFERENCES bars(id) ON DELETE SET NULL,
  bar_nome    TEXT        NOT NULL,
  espresso    NUMERIC(4,2) CHECK (espresso BETWEEN 0.50 AND 5.00),
  cappuccino  NUMERIC(4,2) CHECK (cappuccino BETWEEN 0.50 AND 8.00),
  fonte       TEXT        NOT NULL DEFAULT 'cliente' CHECK (fonte IN ('gestore', 'cliente')),
  stato       TEXT        NOT NULL DEFAULT 'pending' CHECK (stato IN ('pending', 'approvato', 'rifiutato')),
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_stato_idx ON submissions (stato);
CREATE INDEX submissions_bar_id_idx ON submissions (bar_id);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- Chiunque può inserire, solo service role può leggere/modificare
CREATE POLICY "submissions_public_insert" ON submissions FOR INSERT WITH CHECK (TRUE);
