-- Migration: add reservation fee fields and backfill
ALTER TABLE reservations 
  ADD COLUMN IF NOT EXISTS reservation_fee_amount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP NULL;

-- Backfill fee where already confirmed but fee is missing
UPDATE reservations 
SET reservation_fee_amount = 100 
WHERE status = 'confirmed' 
  AND (reservation_fee_amount IS NULL OR reservation_fee_amount = 0);

-- Backfill confirmed_at using updated_at (or created_at) if missing
UPDATE reservations 
SET confirmed_at = COALESCE(confirmed_at, updated_at, created_at)
WHERE status = 'confirmed' AND confirmed_at IS NULL;
