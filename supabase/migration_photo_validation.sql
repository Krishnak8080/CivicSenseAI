-- RUN THIS FILE IN YOUR SUPABASE SQL EDITOR TO SUPPORT PHOTO VALIDATION

-- 1. Add photo validation fields to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS 
  photo_validation_status TEXT CHECK (photo_validation_status IN ('verified', 'flagged', 'rejected', 'pending'));

ALTER TABLE reports ADD COLUMN IF NOT EXISTS 
  photo_validation_confidence INTEGER CHECK (photo_validation_confidence >= 0 AND photo_validation_confidence <= 100);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS 
  photo_validation_warnings TEXT[]; -- Array of warning messages

ALTER TABLE reports ADD COLUMN IF NOT EXISTS 
  photo_validation_data JSONB; -- Full validation result for admin review

ALTER TABLE reports ADD COLUMN IF NOT EXISTS 
  requires_manual_review BOOLEAN DEFAULT FALSE;

-- 2. Index for filtering flagged reports
CREATE INDEX IF NOT EXISTS idx_reports_requires_review 
  ON reports(requires_manual_review) 
  WHERE requires_manual_review = TRUE;
