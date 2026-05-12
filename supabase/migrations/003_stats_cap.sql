-- ============================================================
-- 003_stats_cap.sql — Materialized view aggregata per CAP
-- Stessa logica di stats_zona ma raggruppata per CAP
-- REFRESH MATERIALIZED VIEW CONCURRENTLY stats_cap
-- ============================================================

CREATE MATERIALIZED VIEW stats_cap AS
SELECT
  b.cap,
  MAX(b.citta)                                                                            AS citta,
  MAX(b.regione)                                                                          AS regione,
  ROUND(AVG(p.espresso_bancone)::numeric, 2)                                              AS media_espresso,
  ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY p.espresso_bancone))::numeric, 2)   AS mediana_espresso,
  ROUND(AVG(p.cappuccino_bancone)::numeric, 2)                                            AS media_cappuccino,
  ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY p.cappuccino_bancone))::numeric, 2) AS mediana_cappuccino,
  COUNT(DISTINCT b.id)                                                                    AS n_bar,
  NOW()                                                                                   AS aggiornata_at
FROM bars b
LEFT JOIN prices p ON p.bar_id = b.id AND NOT p.outlier
WHERE b.cap IS NOT NULL
GROUP BY b.cap
WITH DATA;

-- Indice necessario per REFRESH CONCURRENTLY
CREATE UNIQUE INDEX stats_cap_cap_idx ON stats_cap (cap);

-- pg_cron: aggiungere accanto al refresh di stats_zona
-- SELECT cron.schedule('refresh-stats-cap', '0 3 * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY stats_cap');
