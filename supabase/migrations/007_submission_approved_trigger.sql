-- Quando una submission passa a 'approvato' e ha un bar_id noto,
-- copia automaticamente il prezzo in prices (usato dalla mappa).
CREATE OR REPLACE FUNCTION sync_submission_to_prices()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stato = 'approvato' AND OLD.stato != 'approvato' AND NEW.bar_id IS NOT NULL THEN
    INSERT INTO prices (bar_id, call_id, espresso_bancone, cappuccino_bancone, outlier)
    VALUES (NEW.bar_id, NULL, NEW.espresso, NEW.cappuccino, false);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_submission_approved
AFTER UPDATE ON submissions
FOR EACH ROW EXECUTE FUNCTION sync_submission_to_prices();
