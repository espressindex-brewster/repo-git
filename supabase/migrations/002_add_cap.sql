-- ============================================================
-- 002_add_cap.sql — Aggiunge colonna CAP alla tabella bars
-- ============================================================

ALTER TABLE bars ADD COLUMN IF NOT EXISTS cap TEXT;

CREATE INDEX IF NOT EXISTS bars_cap_idx ON bars (cap);
