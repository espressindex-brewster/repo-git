-- Fix: bar_sopra_media escludeva i prezzi da submission web (call_id = NULL)
-- perché il JOIN su calls richiedeva call_id non nullo.
-- Ora usa LEFT JOIN + COALESCE per includere sia prezzi da chiamata che da web.
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
  last_p.aggiornato_at      AS ultimo_aggiornamento,
  (last_p.espresso_bancone > sz.media_espresso) AS sopra_media
FROM bars b
JOIN LATERAL (
  SELECT
    p.espresso_bancone,
    p.cappuccino_bancone,
    COALESCE(c.chiamata_at, p.created_at) AS aggiornato_at
  FROM prices p
  LEFT JOIN calls c ON c.id = p.call_id
  WHERE p.bar_id = b.id
    AND NOT p.outlier
  ORDER BY aggiornato_at DESC
  LIMIT 1
) last_p ON TRUE
LEFT JOIN stats_zona sz ON sz.citta = b.citta;
