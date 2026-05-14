-- Allow web submissions to insert prices without a call_id
ALTER TABLE prices ALTER COLUMN call_id DROP NOT NULL;
