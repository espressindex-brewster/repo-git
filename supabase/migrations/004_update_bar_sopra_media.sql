-- Ricrea bar_sopra_media con: cap, ultimo_aggiornamento
-- Necessario perché b.* in 001_init non include cap (aggiunto in 002)
-- CREATE OR REPLACE non supporta cambio di ordine colonne → DROP + CREATE
DROP VIEW IF EXISTS bar_sopra_media;
CREATE VIEW bar_sopra_media AS
SELECT
  b.id,
  b.nome,
  b.citta,
  b.regione,
  b.cap,
  b.lat,
  b.lng,
  b.telefono,
  b.google_place_id,
  b.created_at,
  last_p.espresso_bancone   AS ultimo_espresso,
  last_p.cappuccino_bancone AS ultimo_cappuccino,
  last_p.chiamata_at        AS ultimo_aggiornamento,
  (last_p.espresso_bancone > sz.media_espresso) AS sopra_media
FROM bars b
JOIN LATERAL (
  SELECT p.espresso_bancone, p.cappuccino_bancone, c.chiamata_at
  FROM prices p
  JOIN calls c ON c.id = p.call_id
  WHERE p.bar_id = b.id
    AND NOT p.outlier
  ORDER BY c.chiamata_at DESC
  LIMIT 1
) last_p ON TRUE
LEFT JOIN stats_zona sz ON sz.citta = b.citta;
