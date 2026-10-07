-- Teacher Duties & Responsibilities (DB1)
-- Run in the Supabase SQL Editor against the primary project (ohczlooperjqpyllmabo).
-- Additive and idempotent: safe to re-run.

ALTER TABLE public.teacher_profiles
  ADD COLUMN IF NOT EXISTS teacher_duty TEXT,
  ADD COLUMN IF NOT EXISTS teacher_duty_club TEXT;