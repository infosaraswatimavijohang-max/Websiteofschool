-- ====================================================================
-- ADVANCED FEE MANAGEMENT SYSTEM - COMPLETE SCHEMA SETUP
-- ====================================================================
-- This script sets up a complete advanced fee management system with:
-- - Dynamic fee categories and structures
-- - Student-specific fee assignments  
-- - Payment tracking with multiple payment modes
-- - Fee discounts and exemptions
-- - Payment reminders and notifications
-- - Comprehensive financial reporting
-- ====================================================================

-- ====================================================================
-- TABLE 1: FEE_CATEGORIES (Master list of fee types)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.fee_categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  category_code TEXT UNIQUE,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'Annual', -- Annual, Monthly, Quarterly, One-Time, Per-Installment
  applicable_to_classes TEXT, -- JSON array or comma-separated: ["9", "10", "11", "12"] or "All"
  is_mandatory BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABLE 2: FEE_STRUCTURES (Standard fee amounts per category per class)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fee_category_id BIGINT NOT NULL,
  class_name TEXT NOT NULL, -- e.g., "Grade 9", "Grade 10"
  standard_amount NUMERIC(10, 2) NOT NULL,
  academic_year TEXT, -- e.g., "2024-2025"
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  FOREIGN KEY (fee_category_id) REFERENCES public.fee_categories(id) ON DELETE CASCADE,
  UNIQUE(fee_category_id, class_name, academic_year)
);

-- ====================================================================
-- TABLE 3: STUDENT_FEES (Fees assigned to individual students)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.student_fees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_roll INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  fee_category_id BIGINT NOT NULL,
  category_name TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  academic_year TEXT, -- e.g., "2024-2025"
  due_date DATE,
  description TEXT,
  installment_number INTEGER DEFAULT 1,
  total_installments INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, partial, cleared, overdue, exempted
  assigned_by TEXT, -- Admin email who assigned
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  FOREIGN KEY (student_roll) REFERENCES public.students_registry(roll) ON DELETE CASCADE,
  FOREIGN KEY (fee_category_id) REFERENCES public.fee_categories(id) ON DELETE CASCADE
);

-- ====================================================================
-- TABLE 4: STUDENT_PAYMENTS (Track individual payments received)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.student_payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_roll INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  student_fee_id BIGINT,
  payment_mode TEXT NOT NULL, -- Online, Cheque, Cash, Bank Transfer, UPI
  amount_paid NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  transaction_id TEXT UNIQUE, -- Bank/Gateway transaction ID
  payment_reference TEXT, -- Receipt or reference number
  bank_name TEXT,
  cheque_number TEXT,
  payment_notes TEXT,
  recorded_by TEXT, -- Admin email who recorded payment
  status TEXT NOT NULL DEFAULT 'verified', -- pending, verified, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  FOREIGN KEY (student_roll) REFERENCES public.students_registry(roll) ON DELETE CASCADE,
  FOREIGN KEY (student_fee_id) REFERENCES public.student_fees(id) ON DELETE SET NULL
);

-- ====================================================================
-- TABLE 5: STUDENT_FEE_DISCOUNTS (Discounts and exemptions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.student_fee_discounts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_roll INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  student_fee_id BIGINT,
  discount_type TEXT NOT NULL, -- Percentage, Fixed Amount, Merit, Need-Based, Scholarship
  discount_percentage NUMERIC(5, 2), -- If percentage-based
  discount_amount NUMERIC(10, 2), -- If fixed amount
  reason TEXT,
  applied_by TEXT, -- Admin email
  approved_by TEXT, -- Principal/HOD approval
  approval_date DATE,
  is_approved BOOLEAN DEFAULT FALSE,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  FOREIGN KEY (student_roll) REFERENCES public.students_registry(roll) ON DELETE CASCADE,
  FOREIGN KEY (student_fee_id) REFERENCES public.student_fees(id) ON DELETE SET NULL
);

-- ====================================================================
-- TABLE 6: FEE_PAYMENT_REMINDERS (Notification tracking)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.fee_payment_reminders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_roll INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  student_fee_id BIGINT,
  reminder_type TEXT NOT NULL, -- due_15_days_before, due_on_date, overdue_7_days, overdue_30_days
  message TEXT,
  sent_date TIMESTAMP WITH TIME ZONE,
  sent_via TEXT, -- email, sms, portal
  is_sent BOOLEAN DEFAULT FALSE,
  parent_notification BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  FOREIGN KEY (student_roll) REFERENCES public.students_registry(roll) ON DELETE CASCADE,
  FOREIGN KEY (student_fee_id) REFERENCES public.student_fees(id) ON DELETE SET NULL
);

-- ====================================================================
-- TABLE 7: FEE_STATISTICS_SNAPSHOT (For reporting & analytics)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.fee_statistics_snapshot (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  academic_year TEXT,
  total_students INTEGER,
  total_due_amount NUMERIC(15, 2),
  total_collected_amount NUMERIC(15, 2),
  total_pending_amount NUMERIC(15, 2),
  collection_percentage NUMERIC(5, 2),
  students_fully_cleared INTEGER,
  students_partially_cleared INTEGER,
  students_pending INTEGER,
  students_overdue INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  UNIQUE(snapshot_date, academic_year)
);

-- ====================================================================
-- TABLE 8: BULK_FEE_IMPORT_LOG (For batch fee uploads)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.bulk_fee_import_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  imported_by TEXT,
  total_records INTEGER,
  successful_records INTEGER,
  failed_records INTEGER,
  error_details TEXT, -- JSON array of errors
  file_name TEXT,
  import_type TEXT, -- student_fees, payments, discounts
  status TEXT DEFAULT 'completed', -- processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_student_fees_roll ON public.student_fees(student_roll);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON public.student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_class ON public.student_fees(student_class);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON public.student_fees(due_date);
CREATE INDEX IF NOT EXISTS idx_student_fees_category ON public.student_fees(fee_category_id);

CREATE INDEX IF NOT EXISTS idx_student_payments_roll ON public.student_payments(student_roll);
CREATE INDEX IF NOT EXISTS idx_student_payments_date ON public.student_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_student_payments_fee_id ON public.student_payments(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_status ON public.student_payments(status);

CREATE INDEX IF NOT EXISTS idx_fee_discounts_roll ON public.student_fee_discounts(student_roll);
CREATE INDEX IF NOT EXISTS idx_fee_discounts_fee_id ON public.student_fee_discounts(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_discounts_approved ON public.student_fee_discounts(is_approved);

CREATE INDEX IF NOT EXISTS idx_reminders_roll ON public.fee_payment_reminders(student_roll);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON public.fee_payment_reminders(is_sent);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON public.fee_payment_reminders(reminder_type);

-- ====================================================================
-- SAMPLE DATA - FEE CATEGORIES
-- ====================================================================
INSERT INTO public.fee_categories (category_name, category_code, description, frequency, applicable_to_classes, display_order)
VALUES 
  ('Tuition Fee', 'TF-001', 'Regular tuition & academic instruction', 'Monthly', 'All', 1),
  ('Laboratory Fee', 'LF-002', 'Science lab facility & equipment', 'Quarterly', '["9","10","11","12"]', 2),
  ('Computer Lab Fee', 'CLF-003', 'IT & computer center access', 'Monthly', 'All', 3),
  ('Sports & Activities', 'SA-004', 'Sports, games, and co-curricular activities', 'Annual', 'All', 4),
  ('Library Fee', 'LIB-005', 'Library membership and resources', 'Annual', 'All', 5),
  ('Examination Fee', 'EXF-006', 'Annual exam conduction & administration', 'Annual', 'All', 6),
  ('Development Fund', 'DEV-007', 'Infrastructure & development projects', 'Annual', 'All', 7),
  ('Transport Fee', 'TRN-008', 'Bus transportation services', 'Monthly', 'All', 8)
ON CONFLICT (category_name) DO NOTHING;

-- ====================================================================
-- SAMPLE DATA - FEE STRUCTURES (for Grade 9 & 10)
-- ====================================================================
INSERT INTO public.fee_structures (fee_category_id, class_name, standard_amount, academic_year)
SELECT id, 'Grade 9', 2500, '2024-2025' FROM public.fee_categories WHERE category_code = 'TF-001'
ON CONFLICT (fee_category_id, class_name, academic_year) DO NOTHING;

INSERT INTO public.fee_structures (fee_category_id, class_name, standard_amount, academic_year)
SELECT id, 'Grade 10', 2500, '2024-2025' FROM public.fee_categories WHERE category_code = 'TF-001'
ON CONFLICT (fee_category_id, class_name, academic_year) DO NOTHING;

INSERT INTO public.fee_structures (fee_category_id, class_name, standard_amount, academic_year)
SELECT id, 'Grade 9', 500, '2024-2025' FROM public.fee_categories WHERE category_code = 'CLF-003'
ON CONFLICT (fee_category_id, class_name, academic_year) DO NOTHING;

INSERT INTO public.fee_structures (fee_category_id, class_name, standard_amount, academic_year)
SELECT id, 'Grade 10', 500, '2024-2025' FROM public.fee_categories WHERE category_code = 'CLF-003'
ON CONFLICT (fee_category_id, class_name, academic_year) DO NOTHING;

-- ====================================================================
-- TRIGGER: Update student_fees status based on payments (OPTIONAL - requires PL/pgSQL)
-- ====================================================================
-- This would require a PL/pgSQL function, skipping for basic SQL setup

-- ====================================================================
-- VIEW: Student Fee Summary
-- ====================================================================
CREATE OR REPLACE VIEW student_fee_summary AS
SELECT 
  sf.student_roll,
  sf.student_name,
  sf.student_class,
  COUNT(DISTINCT sf.id) as total_fees,
  COALESCE(SUM(sf.amount), 0) as total_due_amount,
  COALESCE(SUM(sp.amount_paid), 0) as total_paid_amount,
  COALESCE(SUM(sf.amount), 0) - COALESCE(SUM(sp.amount_paid), 0) as balance_due,
  CASE 
    WHEN COALESCE(SUM(sf.amount), 0) = 0 THEN 'N/A'
    WHEN COALESCE(SUM(sp.amount_paid), 0) = 0 THEN 'Pending'
    WHEN COALESCE(SUM(sp.amount_paid), 0) < COALESCE(SUM(sf.amount), 0) THEN 'Partial'
    ELSE 'Cleared'
  END as fee_status,
  MAX(sf.due_date) as last_due_date,
  sf.academic_year
FROM public.student_fees sf
LEFT JOIN public.student_payments sp ON sf.id = sp.student_fee_id AND sp.status = 'verified'
WHERE sf.is_active = TRUE OR sf.is_active IS NULL
GROUP BY sf.student_roll, sf.student_name, sf.student_class, sf.academic_year;

-- ====================================================================
-- END OF ADVANCED FEE MANAGEMENT SETUP
-- ====================================================================
