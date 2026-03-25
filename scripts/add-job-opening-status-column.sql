-- Migration: Add job_opening_status column to lf_jobs
-- Run this in Supabase SQL Editor
-- This adds the new job opening status field that tracks whether a job is
-- Open, Hired, Reserved, Pending, or Coming Soon.

-- Add the column with a default of 'open'
ALTER TABLE lf_jobs
ADD COLUMN IF NOT EXISTS job_opening_status TEXT NOT NULL DEFAULT 'open';

-- Add a check constraint to ensure only valid values
ALTER TABLE lf_jobs
ADD CONSTRAINT lf_jobs_job_opening_status_check
CHECK (job_opening_status IN ('open', 'hired', 'reserved', 'pending', 'coming_soon'));

-- Add a comment for documentation
COMMENT ON COLUMN lf_jobs.job_opening_status IS 'Job opening status: open (accepting applications), hired (filled but visible), reserved (mostly spoken for, backup apps accepted), pending (in progress, no apps), coming_soon (not open yet)';
